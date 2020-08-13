import {
  Erc20MintableInstance,
  OTokenInstance,
  OptionsFactoryInstance
} from '../build/types/truffle-types';
import BN = require('bn.js');
const oToken = artifacts.require('oToken');
const OptionsFactory = artifacts.require('OptionsFactory');
const MockCompoundOracle = artifacts.require('MockCompoundOracle');
const MintableToken = artifacts.require('ERC20Mintable');

const MAX_UINT256 =
  '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

const {time, expectEvent, expectRevert} = require('@openzeppelin/test-helpers');

// Initialize the Options Factory, Options Exchange and other mock contracts
contract(
  'OptionsContract: ERC20 collateral',
  ([creatorAddress, owner1, owner2, exerciser, nonOwnerAddress]) => {
    let otoken: OTokenInstance;
    let optionsFactory: OptionsFactoryInstance;
    let weth: Erc20MintableInstance;
    let usdc: Erc20MintableInstance;
    let expiry: number;

    let mintAmount: BN;
    const collateralEachVault = new BN(250).mul(new BN(1e6)); // 2500 USDC

    before('set up contracts', async () => {
      const now = (await time.latest()).toNumber();
      expiry = now + time.duration.days(30).toNumber();

      // 1. Deploy mock contracts
      // 1.1 Compound Oracle
      await MockCompoundOracle.deployed();

      // 1.2 Mock usdc contract
      usdc = await MintableToken.new();
      weth = await MintableToken.new();

      // 2. Deploy our contracts
      // Deploy the Options Factory contract and add assets to it
      optionsFactory = await OptionsFactory.deployed();

      await optionsFactory.addAsset('USDC', usdc.address);
      await optionsFactory.addAsset('WETH', weth.address);

      // Create the unexpired options contract
      const optionsContractResult = await optionsFactory.createOptionsContract(
        'USDC',
        -6,
        'WETH',
        -18,
        -6,
        25,
        -5,
        'USDC',
        expiry,
        expiry,
        {from: creatorAddress}
      );

      const optionsContractAddr = optionsContractResult.logs[1].args[0];
      otoken = await oToken.at(optionsContractAddr);
      // change collateral ratio to 1
      await otoken.setDetails('Opyn WETH:USDC', 'oETH', {
        from: creatorAddress
      });
      await otoken.updateParameters('100', '500', 0, 10, {
        from: creatorAddress
      });

      mintAmount = await otoken.maxOTokensIssuable(
        collateralEachVault.toString()
      );

      // mint USDC for option sellers
      await usdc.mint(owner1, collateralEachVault.toString());
      await usdc.mint(owner2, collateralEachVault.toString());

      // approve contact to add USDC as collateral
      await usdc.approve(otoken.address, collateralEachVault.toString(), {
        from: owner1
      });
      await usdc.approve(otoken.address, collateralEachVault.toString(), {
        from: owner2
      });

      // Open two vaults, mint otokens to exerciser
      await otoken.createERC20CollateralOption(
        mintAmount,
        collateralEachVault.toString(),
        exerciser,
        {
          from: owner1
        }
      );
      await otoken.createERC20CollateralOption(
        mintAmount,
        collateralEachVault.toString(),
        exerciser,
        {
          from: owner2
        }
      );
    });

    describe('#exercise() on 1 vault', () => {
      let contractUnderlyingBefore: BN;
      let contractCollateralBefore: BN;

      let totalSupplyBefore: BN;

      let exerciserUnderlyingBefore: BN;
      let exerciserOtokenBefore: BN;
      let exerciserCollateralBefore: BN;
      let amountOtokenToExercise: BN;

      before('move otokens & mint underlying for exerciser', async () => {
        amountOtokenToExercise = mintAmount.div(new BN(2));
        // ensure the person has enough oTokens
        const underlyingAmount = new BN(1000).mul(new BN(10).pow(new BN(18))); // 1000 USDC
        await weth.mint(exerciser, underlyingAmount);

        exerciserOtokenBefore = await otoken.balanceOf(exerciser);
        exerciserUnderlyingBefore = await weth.balanceOf(exerciser);
        exerciserCollateralBefore = await usdc.balanceOf(exerciser);

        contractUnderlyingBefore = await weth.balanceOf(otoken.address);
        contractCollateralBefore = await usdc.balanceOf(otoken.address);

        totalSupplyBefore = await otoken.totalSupply();
      });

      it('should revert when trying to exercise on address with no vault', async () => {
        await expectRevert(
          otoken.exercise('100', [nonOwnerAddress], {
            from: owner1
          }),
          "Cannot exercise from a vault that doesn't exist."
        );
      });

      it('should be able to exercise half of vault 1', async () => {
        const amountCollateralToGetBack = collateralEachVault.div(new BN(2));
        amountOtokenToExercise = await otoken.maxOTokensIssuable(
          amountCollateralToGetBack.toString()
        );

        const amountUnderlyingToPay = await otoken.underlyingRequiredToExercise(
          amountOtokenToExercise
        );

        await weth.approve(otoken.address, amountUnderlyingToPay, {
          from: exerciser
        });

        const txInfo = await otoken.exercise(amountOtokenToExercise, [owner1], {
          from: exerciser
        });
        // check event is emitted.
        expectEvent(txInfo, 'Exercise', {
          amtUnderlyingToPay: amountUnderlyingToPay,
          amtCollateralToPay: amountCollateralToGetBack
        });
      });

      it('check that the otoken total supply decreased', async () => {
        const totalSupplyAfter = await otoken.totalSupply();
        assert.equal(
          totalSupplyBefore.sub(amountOtokenToExercise).toString(),
          totalSupplyAfter.toString()
        );
      });

      it('check the oToken balance of exercier has declined', async () => {
        // check exerciser oToken balance decreased
        const exerciserOtokenAfter = await otoken.balanceOf(exerciser);
        assert.equal(
          exerciserOtokenAfter.toString(),
          new BN(exerciserOtokenBefore).sub(amountOtokenToExercise).toString(),
          'Wrong exerciser otoken balance'
        );
      });

      it('check the collateral balances changed correctly', async () => {
        const collateralPaid = collateralEachVault.div(new BN(2));
        // check exerciser collateral (USDC) balance increased
        const exerciserCollateralAfter = await usdc.balanceOf(exerciser);

        assert.equal(
          exerciserCollateralAfter.toString(),
          exerciserCollateralBefore.add(collateralPaid).toString(),
          'Wrong Exerciser Collateral (USDC) balance'
        );

        // check contract collateral should have decreased
        const contractCollateralAfter = await usdc.balanceOf(otoken.address);
        assert.equal(
          contractCollateralAfter.toString(),
          contractCollateralBefore.sub(collateralPaid).toString(),
          'Wrong contract collateral (USDC) amount'
        );
      });

      it('check that the underlying and oTokens were transferred', async () => {
        const underlyingPaid: BN = await otoken.underlyingRequiredToExercise(
          amountOtokenToExercise
        );

        // check exerciser uderlying balance increase
        const exerciserUnderlyingAfter = await weth.balanceOf(exerciser);
        assert.equal(
          exerciserUnderlyingAfter.toString(),
          exerciserUnderlyingBefore.sub(underlyingPaid).toString(),
          'Wrong Exercier Underlying (WETH)balance'
        );

        // check contract underlying should have increase
        const contractUnderlyingAfter = await weth.balanceOf(otoken.address);

        assert.equal(
          contractUnderlyingAfter.toString(),
          contractUnderlyingBefore.add(underlyingPaid).toString(),
          'Wrong contract collateral (WETH) balance.'
        );
      });
    });

    describe('#exercise() edge cases', () => {
      // Two more tests to cover old exercise implementation.
      it('should be able to exercise 0 amount', async () => {
        await otoken.exercise('0', [owner1], {
          from: exerciser
        });
      });

      it('should revert when amount to exercise is higher than amount in specified vault.', async () => {
        // owenr1 has already be exercised, to the amount left is < mintAmount
        const underlyingNeeded = await otoken.underlyingRequiredToExercise(
          mintAmount
        );
        await weth.approve(otoken.address, underlyingNeeded, {from: exerciser});
        await expectRevert(
          otoken.exercise(mintAmount, [owner1], {
            from: exerciser
          }),
          'Specified vaults have insufficient collateral'
        );
      });
    });

    describe('#removeUnderlying() before expiry window', () => {
      let amountToExercise: BN;

      before('let the exerciser exercise half of vault 2', async () => {
        // exercise half of the second vault.
        amountToExercise = mintAmount.div(new BN(2));
        const underlyingAmount = await otoken.underlyingRequiredToExercise(
          amountToExercise.toString()
        );
        await weth.approve(otoken.address, underlyingAmount, {from: exerciser});
        await otoken.exercise(amountToExercise, [owner2], {
          from: exerciser
        });
      });

      it('owner2 should be able to remove underlying before expiry', async () => {
        const underlyingPaidByExerciser = await otoken.underlyingRequiredToExercise(
          amountToExercise
        );

        const txInfo = await otoken.removeUnderlying({
          from: owner2
        });

        expectEvent(txInfo, 'RemoveUnderlying', {
          amountUnderlying: underlyingPaidByExerciser.toString(),
          vaultOwner: owner2
        });

        // check the owner's underlying balance increased
        const ownerUnderlying = await weth.balanceOf(owner2);
        assert.equal(
          ownerUnderlying.toString(),
          underlyingPaidByExerciser.toString()
        );
      });
    });

    describe('#redeem() after expiry window', () => {
      before('increase time to expiry', async () => {
        await time.increaseTo(expiry);
      });

      it('should revert when trying to exercise after expiry', async () => {
        await expectRevert(
          otoken.exercise('100', [owner1], {
            from: exerciser
          }),
          "Can't exercise outside of the exercise window"
        );
      });

      it('owner1 should be able to collect their share of collateral', async () => {
        const wethBalanceBefore = await weth.balanceOf(owner1);

        const underlyingPaidInExercise = await otoken.underlyingRequiredToExercise(
          mintAmount.div(new BN(2)).toString()
        );

        const txInfo = await otoken.redeemVaultBalance({
          from: owner1
        });

        const wethBalanceAfter = await weth.balanceOf(owner1);

        const collateralWithdrawn = collateralEachVault
          .div(new BN(2))
          .toString();

        expectEvent(txInfo, 'RedeemVaultBalance', {
          amtCollateralRedeemed: collateralWithdrawn,
          amtUnderlyingRedeemed: underlyingPaidInExercise.toString()
        });

        assert.equal(
          wethBalanceAfter.toString(),
          wethBalanceBefore.add(underlyingPaidInExercise).toString(),
          'Final WETH blance after redemption wrong'
        );

        // check the owner's collatearl balance increased
        const ownerCollateral = await usdc.balanceOf(owner1);
        assert.equal(
          ownerCollateral.toString(),
          collateralWithdrawn.toString()
        );
      });

      it('only a vault owner can collect collateral', async () => {
        await expectRevert(
          otoken.redeemVaultBalance({
            from: nonOwnerAddress
          }),
          'Vault does not exist'
        );
      });

      it('once collateral has been collected, should not be able to collect again', async () => {
        const ownerWETHBalBefore = await weth.balanceOf(owner1);
        const ownerusdcBalBefore = await usdc.balanceOf(owner1);

        await otoken.redeemVaultBalance({
          from: owner1
        });
        const ownerWETHBalAfter = await weth.balanceOf(owner1);
        const ownerusdcBalAfter = await usdc.balanceOf(owner1);
        assert.equal(
          ownerWETHBalBefore.toString(),
          ownerWETHBalAfter.toString()
        );
        // check underlying balance stays the same
        assert.equal(
          ownerusdcBalBefore.toString(),
          ownerusdcBalAfter.toString()
        );
      });

      it('Owner2 should be able to collect his collateral', async () => {
        const owner2UnderlyginBefore = await weth.balanceOf(owner2);

        const txInfo = await otoken.redeemVaultBalance({
          from: owner2
        });

        // check the calculations on amount of collateral paid out and underlying transferred is correct
        expectEvent(txInfo, 'RedeemVaultBalance', {
          amtCollateralRedeemed: collateralEachVault.div(new BN(2)).toString(),
          amtUnderlyingRedeemed: '0',
          vaultOwner: owner2
        });

        // check owner2's WETH doesn't increase after redemption
        const owner2UnderlyginAfter = await weth.balanceOf(owner2);
        assert.equal(
          owner2UnderlyginBefore.toString(),
          owner2UnderlyginAfter.toString(),
          'Owner2 ETH balance mismatch'
        );
      });
    });
  }
);

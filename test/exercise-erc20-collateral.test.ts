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

const {time, expectEvent, expectRevert} = require('@openzeppelin/test-helpers');

// Initialize the Options Factory, Options Exchange and other mock contracts
contract(
  'OptionsContract: ERC20 collateral',
  ([
    creatorAddress,
    owner0,
    owner1,
    owner2,
    owner3,
    owner4,
    exerciser,
    nonOwnerAddress
  ]) => {
    let otoken: OTokenInstance;
    let optionsFactory: OptionsFactoryInstance;
    let weth: Erc20MintableInstance;
    let usdc: Erc20MintableInstance;
    let expiry: number;

    let mintAmount: BN;

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
    });

    describe('#exercise() edge cases', () => {
      it('should revert when trying to exercise on address with no vault', async () => {
        await expectRevert(
          otoken.exercise('100', [nonOwnerAddress], {
            from: nonOwnerAddress
          }),
          "Cannot exercise from a vault that doesn't exist."
        );
      });
      // Two more tests to cover old exercise implementation.
      it('should be able to exercise 0 amount', async () => {
        await expectRevert(
          otoken.exercise('0', [owner0], {
            from: exerciser
          }),
          "Can't exercise 0 otoken"
        );
      });

      // Two more tests to cover old exercise implementation.
      it('should revert when exercising on empty vault', async () => {
        await otoken.openVault({from: owner0});
        await expectRevert(
          otoken.exercise('10', [owner0], {
            from: exerciser
          }),
          'Specified vaults have insufficient collateral'
        );
      });
    });

    describe('#exercise() on 1 vault (owner1)', () => {
      const collateralEachVault = new BN(250).mul(new BN(1e6)); // 2500 USDC

      let contractUnderlyingBefore: BN;
      let contractCollateralBefore: BN;

      let totalSupplyBefore: BN;

      let exerciserUnderlyingBefore: BN;
      let exerciserOtokenBefore: BN;
      let exerciserCollateralBefore: BN;
      let amountOtokenToExercise: BN;

      before('move otokens & mint underlying for exerciser', async () => {
        const mintAmount = await otoken.maxOTokensIssuable(
          collateralEachVault.toString()
        );

        // Vault Creation from owner 1
        // mint USDC for option sellers
        await usdc.mint(owner1, collateralEachVault.toString());
        await usdc.approve(otoken.address, collateralEachVault.toString(), {
          from: owner1
        });

        // Open a vault, mint otokens to exerciser
        await otoken.createERC20CollateralOption(
          mintAmount,
          collateralEachVault.toString(),
          exerciser,
          {
            from: owner1
          }
        );

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

      it('owner1 should be able to remove underlying before expiry', async () => {
        const underlyingPaidByExerciser = await otoken.underlyingRequiredToExercise(
          amountOtokenToExercise
        );

        const txInfo = await otoken.removeUnderlying({
          from: owner1
        });

        expectEvent(txInfo, 'RemoveUnderlying', {
          amountUnderlying: underlyingPaidByExerciser.toString(),
          vaultOwner: owner1
        });

        // check the owner's underlying balance increased
        const ownerUnderlying = await weth.balanceOf(owner1);
        assert.equal(
          ownerUnderlying.toString(),
          underlyingPaidByExerciser.toString()
        );
      });
    });

    describe('#exercise() on multiple vaults (owner2, owner3)', () => {
      const collateralEachVault = new BN(250).mul(new BN(1e6)); // 2500 USDC

      let contractUnderlyingBefore: BN;
      let contractCollateralBefore: BN;

      let totalSupplyBefore: BN;

      let exerciserUnderlyingBefore: BN;
      let exerciserOtokenBefore: BN;
      let exerciserCollateralBefore: BN;

      let amountOtokenToExercise: BN;
      let otokenMintedEachVaule: BN;

      before('move otokens & mint underlying for exerciser', async () => {
        otokenMintedEachVaule = await otoken.maxOTokensIssuable(
          collateralEachVault.toString()
        );

        // Vault Creation from owner 1
        // mint USDC for option sellers
        await usdc.mint(owner2, collateralEachVault.toString());
        await usdc.mint(owner3, collateralEachVault.toString());
        await usdc.approve(otoken.address, collateralEachVault.toString(), {
          from: owner2
        });
        await usdc.approve(otoken.address, collateralEachVault.toString(), {
          from: owner3
        });

        // Open a vault, mint otokens to exerciser
        await otoken.createERC20CollateralOption(
          otokenMintedEachVaule,
          collateralEachVault.toString(),
          exerciser,
          {
            from: owner2
          }
        );
        await otoken.createERC20CollateralOption(
          otokenMintedEachVaule,
          collateralEachVault.toString(),
          exerciser,
          {
            from: owner3
          }
        );

        // ensure the exerciser has enough underlying
        const underlyingAmount = new BN(1000).mul(new BN(10).pow(new BN(18))); // 1000 USDC
        await weth.mint(exerciser, underlyingAmount);

        exerciserOtokenBefore = await otoken.balanceOf(exerciser);
        exerciserUnderlyingBefore = await weth.balanceOf(exerciser);
        exerciserCollateralBefore = await usdc.balanceOf(exerciser);

        contractUnderlyingBefore = await weth.balanceOf(otoken.address);
        contractCollateralBefore = await usdc.balanceOf(otoken.address);

        totalSupplyBefore = await otoken.totalSupply();
      });

      it('should be able to exercise vault2 and half of vault3', async () => {
        const underlyingToExerciseOneVault = await otoken.underlyingRequiredToExercise(
          otokenMintedEachVaule
        );

        amountOtokenToExercise = otokenMintedEachVaule
          .mul(new BN(3))
          .div(new BN(2));

        const amountUnderlyingToPay = underlyingToExerciseOneVault
          .mul(new BN(3))
          .div(new BN(2));

        await weth.approve(otoken.address, amountUnderlyingToPay, {
          from: exerciser
        });

        const txInfo = await otoken.exercise(
          amountOtokenToExercise,
          [owner2, owner3],
          {
            from: exerciser
          }
        );

        // vault2 should be fully exercised
        expectEvent(txInfo, 'Exercise', {
          amtUnderlyingToPay: underlyingToExerciseOneVault.toString(),
          amtCollateralToPay: collateralEachVault.toString(),
          vaultExercisedFrom: owner2
        });

        // vault3 should be exercised by half
        expectEvent(txInfo, 'Exercise', {
          amtUnderlyingToPay: underlyingToExerciseOneVault
            .div(new BN(2))
            .toString(),
          amtCollateralToPay: collateralEachVault.div(new BN(2)).toString(),
          vaultExercisedFrom: owner3
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
        const collateralPaid = collateralEachVault
          .mul(new BN(3))
          .div(new BN(2));
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

      it('owner2 should be able to remove underlying before expiry', async () => {
        // owner 2 was fully exercised
        const underlyingPaidByExerciser = await otoken.underlyingRequiredToExercise(
          otokenMintedEachVaule
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
      const collateralEachVault = new BN(250).mul(new BN(1e6)); // 2500 USDC
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

        const txInfo = await otoken.redeemVaultBalance({
          from: owner1
        });

        const wethBalanceAfter = await weth.balanceOf(owner1);

        const collateralWithdrawn = collateralEachVault
          .div(new BN(2))
          .toString();

        // owner1 already remove the underlying from the vault
        expectEvent(txInfo, 'RedeemVaultBalance', {
          amtCollateralRedeemed: collateralWithdrawn,
          amtUnderlyingRedeemed: '0'
        });

        assert.equal(
          wethBalanceAfter.toString(),
          wethBalanceBefore.toString(),
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

      it('owner2 should not be able to collect any more assets after expiry', async () => {
        const owner2UnderlyginBefore = await weth.balanceOf(owner2);

        const txInfo = await otoken.redeemVaultBalance({
          from: owner2
        });

        // check the calculations on amount of collateral paid out and underlying transferred is correct
        expectEvent(txInfo, 'RedeemVaultBalance', {
          amtCollateralRedeemed: '0',
          amtUnderlyingRedeemed: '0',
          vaultOwner: owner2
        });

        // check owner2's WETH doesn't increase after redemption
        const owner2UnderlyginAfter = await weth.balanceOf(owner2);
        assert.equal(
          owner2UnderlyginBefore.toString(),
          owner2UnderlyginAfter.toString(),
          'owner3 ETH balance mismatch'
        );
      });

      it('owner3 should be able to collect collateral and underlying after expiry', async () => {
        const collateralLeft = collateralEachVault.div(new BN(2));
        const otokenExercised = await otoken.maxOTokensIssuable(
          collateralLeft.toString()
        );
        const underlyingInVault = await otoken.underlyingRequiredToExercise(
          otokenExercised
        );

        const owner3UnderlyginBefore = await weth.balanceOf(owner3);
        const owner3CollateralBefore = await usdc.balanceOf(owner3);

        const txInfo = await otoken.redeemVaultBalance({
          from: owner3
        });

        // check the calculations on amount of collateral paid out and underlying transferred is correct
        expectEvent(txInfo, 'RedeemVaultBalance', {
          amtCollateralRedeemed: collateralLeft.toString(),
          amtUnderlyingRedeemed: underlyingInVault.toString(),
          vaultOwner: owner3
        });

        // check owner3's WETH and usdc increases after redemption
        const owner3UnderlyginAfter = await weth.balanceOf(owner3);
        const owner3CollateralAfter = await usdc.balanceOf(owner3);

        assert.equal(
          owner3UnderlyginBefore.add(underlyingInVault).toString(),
          owner3UnderlyginAfter.toString(),
          'owner3 underlying WETH balance mismatch'
        );

        assert.equal(
          owner3CollateralBefore.add(collateralLeft).toString(),
          owner3CollateralAfter.toString(),
          'owner3 collateral USDC balance mismatch'
        );
      });
    });
  }
);

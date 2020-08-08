import {expect} from 'chai';
import {
  Erc20MintableInstance,
  OTokenInstance,
  OptionsFactoryInstance
} from '../build/types/truffle-types';
// import {BigNumber} from 'bignumber.js';
import BN = require('bn.js');
const oToken = artifacts.require('oToken');
const OptionsFactory = artifacts.require('OptionsFactory');
const MockCompoundOracle = artifacts.require('MockCompoundOracle');
const MintableToken = artifacts.require('ERC20Mintable');

const {
  time,
  expectEvent,
  expectRevert,
  balance
} = require('@openzeppelin/test-helpers');

// Initialize the Options Factory, Options Exchange and other mock contracts
contract(
  'OptionsContract',
  ([creatorAddress, owner1, owner2, exerciser, nonOwnerAddress]) => {
    let otoken: OTokenInstance;
    let optionsFactory: OptionsFactoryInstance;
    let usdc: Erc20MintableInstance;
    let expiry: number;

    let mintAmount: BN;
    const collateralEachVault = new BN(10).pow(new BN(18)); // wei

    before('set up contracts', async () => {
      const now = (await time.latest()).toNumber();
      expiry = now + time.duration.days(30).toNumber();

      // 1. Deploy mock contracts
      // 1.1 Compound Oracle
      await MockCompoundOracle.deployed();

      // 1.2 Mock usdc contract
      usdc = await MintableToken.new();

      // 2. Deploy our contracts
      // Deploy the Options Factory contract and add assets to it
      optionsFactory = await OptionsFactory.deployed();

      await optionsFactory.addAsset('USDC', usdc.address);

      // Create the unexpired options contract
      const optionsContractResult = await optionsFactory.createOptionsContract(
        'ETH',
        -18,
        'USDC',
        -6,
        -6,
        4, // strike price
        -9, // strike price exp
        'ETH',
        expiry,
        expiry,
        {from: creatorAddress}
      );

      const optionsContractAddr = optionsContractResult.logs[1].args[0];
      otoken = await oToken.at(optionsContractAddr);
      // change collateral ratio to 1
      await otoken.setDetails('Opyn USDC:ETH', 'oUSDC', {
        from: creatorAddress
      });
      await otoken.updateParameters('100', '500', 0, 10, {
        from: creatorAddress
      });

      mintAmount = await otoken.maxOTokensIssuable(
        collateralEachVault.toString()
      );

      // Open two vaults
      await otoken.createETHCollateralOption(mintAmount, owner1, {
        from: owner1,
        value: collateralEachVault.toString()
      });
      await otoken.createETHCollateralOption(mintAmount, owner2, {
        from: owner2,
        value: collateralEachVault.toString()
      });
    });

    describe('#exercise() during expiry window', () => {
      let contractUnderlyingBefore: BN;
      let contractCollateralBefore: BN;

      let exerciserUnderlyingBefore: BN;
      let exerciserOtokenBefore: BN;
      let exerciserCollateralBefore: BN;

      let txFeeInWei: BN;

      before('move otokens and underlying for exerciser', async () => {
        // ensure the person has enough oTokens
        await otoken.transfer(exerciser, mintAmount, {
          from: owner1
        });
        await otoken.transfer(exerciser, mintAmount, {
          from: owner2
        });

        const exerciserOtoken = await otoken.balanceOf(exerciser);

        // Mint underlying for exerciser
        const exerciserUnderlyingNeeded = await otoken.underlyingRequiredToExercise(
          exerciserOtoken.toString()
        );

        await usdc.mint(exerciser, exerciserUnderlyingNeeded);
        await usdc.approve(otoken.address, exerciserUnderlyingNeeded, {
          from: exerciser
        });

        exerciserOtokenBefore = await otoken.balanceOf(exerciser);
        exerciserUnderlyingBefore = await usdc.balanceOf(exerciser);
        exerciserCollateralBefore = await balance.current(exerciser);

        contractUnderlyingBefore = await usdc.balanceOf(otoken.address);
        contractCollateralBefore = await balance.current(otoken.address);
      });

      it('should be able to exercise half of 1 vault', async () => {
        const totalSupplyBefore = new BN(
          (await otoken.totalSupply()).toString()
        );

        // exercise half of the first vault.
        const amountOtokenToExercise = mintAmount.div(new BN(2));
        const amountCollateralToGetBack = collateralEachVault.div(new BN(2));
        const amountUnderlyingToPay = await otoken.maxOTokensIssuable(
          amountCollateralToGetBack
        );

        const txInfo = await otoken.exercise(amountOtokenToExercise, [owner1], {
          from: exerciser
        });
        // check event is emitted.
        expectEvent(txInfo, 'Exercise', {
          amtUnderlyingToPay: amountUnderlyingToPay,
          amtCollateralToPay: amountCollateralToGetBack
        });

        const tx = await web3.eth.getTransaction(txInfo.tx);
        // const finalETH = await balance.current(exerciser);

        const gasUsed = new BN(txInfo.receipt.gasUsed);
        const gasPrice = new BN(tx.gasPrice);

        txFeeInWei = gasUsed.mul(gasPrice);

        const totalSupplyAfter = await otoken.totalSupply();
        assert.equal(
          totalSupplyBefore.sub(new BN(amountOtokenToExercise)).toString(),
          totalSupplyAfter.toString()
        );
      });

      it('check that the underlying and oTokens were transferred', async () => {
        const otokenExercised = mintAmount.div(new BN(2));
        const collateralPaid = collateralEachVault.div(new BN(2));
        // const collateralPaid = await otoken.maxOTokensIssuable(otokenExercised);
        const underlyingPaid: BN = await otoken.underlyingRequiredToExercise(
          otokenExercised
        );

        /* ----------------------------
          |  Check Exerciser Blanaces  |
           ---------------------------- */

        // check exerciser oToken balance decreased
        const exerciserOtokenAfter = await otoken.balanceOf(exerciser);
        assert.equal(
          exerciserOtokenAfter.toString(),
          new BN(exerciserOtokenBefore).sub(new BN(otokenExercised)).toString(),
          'Wrong exerciser otoken balance'
        );

        // check exerciser collateral (ETH) balance increase
        const exerciserCollateralAfter = await balance.current(exerciser);

        assert.equal(
          exerciserCollateralAfter.toString(),
          exerciserCollateralBefore
            .add(collateralPaid)
            .sub(txFeeInWei)
            .toString(),
          'Wrong Exerciser Collateral (ETH) balance'
        );

        // check exerciser uderlying balance increase
        const exerciserUnderlyingAfter = await usdc.balanceOf(exerciser);
        assert.equal(
          exerciserUnderlyingAfter.toString(),
          exerciserUnderlyingBefore.sub(underlyingPaid).toString()
        );

        /* ----------------------------
          |  Check Contract Blanaces  |
           ---------------------------- */

        // check contract underlying should have increase
        const contractUnderlyingAfter = await usdc.balanceOf(otoken.address);

        assert.equal(
          contractUnderlyingAfter.toString(),
          contractUnderlyingBefore.add(underlyingPaid).toString(),
          'Wrong contract USDC balance.'
        );

        // check contract collateral should have decrease
        const contractCollateralAfter = await balance.current(otoken.address);
        assert.equal(
          contractCollateralAfter.toString(),
          contractCollateralBefore.sub(collateralPaid).toString(),
          'Wrong contract collateral amount'
        );
      });

      // Two more tests to cover old exercise implementation.
      it('should be able to exercise 0 amount', async () => {
        await otoken.exercise('0', [owner1], {
          from: exerciser
        });
      });

      it('should revert when amount to exercise is higher than amount in specified vault.', async () => {
        // owenr1 has already be exercised, to the amount left is < mintAmount
        await expectRevert(
          otoken.exercise(mintAmount, [owner1], {
            from: exerciser
          }),
          'Specified vaults have insufficient collateral'
        );
      });
    });

    describe('#redeem() after expiry window', () => {
      it('owner1 should be able to collect their share of collateral', async () => {
        await time.increaseTo(expiry);

        const initialETH = await balance.current(owner1);

        const txInfo = await otoken.redeemVaultBalance({
          from: owner1
        });

        const tx = await web3.eth.getTransaction(txInfo.tx);
        const finalETH = await balance.current(owner1);

        const collateralWithdrawn = collateralEachVault
          .div(new BN(2))
          .toString();
        // check the calculations on amount of collateral paid out and underlying transferred is correct
        expectEvent(txInfo, 'RedeemVaultBalance', {
          amtCollateralRedeemed: collateralWithdrawn,
          amtUnderlyingRedeemed: '125000000'
        });

        const gasUsed = new BN(txInfo.receipt.gasUsed);
        const gasPrice = new BN(tx.gasPrice);
        const expectedEndETHBalance = initialETH
          .sub(gasUsed.mul(gasPrice))
          .add(new BN(collateralWithdrawn));
        assert.equal(
          finalETH.toString(),
          expectedEndETHBalance.toString(),
          'Final ETH blance after redemption wrong'
        );

        // check the owner's underlying balance increased
        const ownerusdcBal = await usdc.balanceOf(owner1);
        expect(ownerusdcBal.toString()).to.equal('125000000');
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
        const ownerETHBalBefore = await balance.current(owner1);
        const ownerusdcBalBefore = await usdc.balanceOf(owner1);

        const txInfo = await otoken.redeemVaultBalance({
          from: owner1
        });
        const tx = await web3.eth.getTransaction(txInfo.tx);

        // check ETH balance after = balance before - gas
        const gasUsed = new BN(txInfo.receipt.gasUsed);
        const gasPrice = new BN(tx.gasPrice);
        const ownerETHBalAfter = await balance.current(owner1);
        const ownerusdcBalAfter = await usdc.balanceOf(owner1);
        assert.equal(
          ownerETHBalBefore.sub(gasUsed.mul(gasPrice)).toString(),
          ownerETHBalAfter.toString()
        );
        // check underlying balance stays the same
        assert.equal(
          ownerusdcBalBefore.toString(),
          ownerusdcBalAfter.toString()
        );
      });

      it('Owner2 should be able to collect his collateral', async () => {
        const tx = await otoken.redeemVaultBalance({
          from: owner2
        });

        // check the calculations on amount of collateral paid out and underlying transferred is correct
        expectEvent(tx, 'RedeemVaultBalance', {
          amtCollateralRedeemed: collateralEachVault.toString(),
          amtUnderlyingRedeemed: '0',
          vaultOwner: owner2
        });

        const ownerusdcBal = await usdc.balanceOf(owner2);
        expect(ownerusdcBal.toString()).to.equal('0');
      });
    });
  }
);

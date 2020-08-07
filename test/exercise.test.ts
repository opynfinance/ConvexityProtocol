import {expect} from 'chai';
import {
  ERC20MintableInstance,
  oTokenInstance,
  OptionsFactoryInstance
} from '../build/types/truffle-types';

const oToken = artifacts.require('oToken');
const OptionsFactory = artifacts.require('OptionsFactory');
const MockCompoundOracle = artifacts.require('MockCompoundOracle');
const MintableToken = artifacts.require('ERC20Mintable');

const {
  BN,
  time,
  expectEvent,
  expectRevert,
  balance
} = require('@openzeppelin/test-helpers');

// Initialize the Options Factory, Options Exchange and other mock contracts
contract(
  'OptionsContract',
  ([creatorAddress, owner1, owner2, exerciser, nonOwnerAddress]) => {
    let optionsContracts: oTokenInstance;
    let optionsFactory: OptionsFactoryInstance;
    let dai: ERC20MintableInstance;
    let expiry: number;

    before('set up contracts', async () => {
      const now = (await time.latest()).toNumber();
      expiry = now + time.duration.days(30).toNumber();

      // 1. Deploy mock contracts
      // 1.1 Compound Oracle
      await MockCompoundOracle.deployed();

      // 1.2 Mock Dai contract
      dai = await MintableToken.new();

      // 2. Deploy our contracts
      // Deploy the Options Factory contract and add assets to it
      optionsFactory = await OptionsFactory.deployed();

      await optionsFactory.addAsset('DAI', dai.address);

      // Create the unexpired options contract
      const optionsContractResult = await optionsFactory.createOptionsContract(
        'ETH',
        -'18',
        'DAI',
        -'18',
        -'14',
        '9',
        -'15',
        'DAI',
        expiry,
        expiry,
        {from: creatorAddress}
      );

      const optionsContractAddr = optionsContractResult.logs[1].args[0];
      optionsContracts = await oToken.at(optionsContractAddr);
      // change collateral ratio to 1
      await optionsContracts.setDetails('Opyn oETH put', '250 ETH put', {
        from: creatorAddress
      });
      // await optionsContracts.updateParameters('100', '500', 0, 10, {
      //   from: creatorAddress
      // });

      // Open two vaults
      const mintAmount = '25000';
      const ethAmount = '20000000';
      await optionsContracts.createETHCollateralOption(mintAmount, owner1, {
        from: owner1,
        value: ethAmount
      });
      await optionsContracts.createETHCollateralOption(mintAmount, owner2, {
        from: owner2,
        value: ethAmount
      });
    });

    describe('#exercise() during expiry window', () => {
      let initialETH: BN;
      let finalETH: BN;
      let gasUsed: BN;
      let gasPrice: BN;

      const amtToExercise = '10';

      before('move otokens and underlying for exerciser', async () => {
        // ensure the person has enough oTokens
        await optionsContracts.transfer(exerciser, amtToExercise, {
          from: owner1
        });
        // Mint underlying for exerciser
        await dai.mint(exerciser, '100000');
        await dai.approve(optionsContracts.address, '10000000000000000000000', {
          from: exerciser
        });
      });

      it('should be able to call exercise', async () => {
        // ensure the person has enough underyling

        const totalSupplyBefore = new BN(
          (await optionsContracts.totalSupply()).toString()
        );

        initialETH = await balance.current(exerciser);

        const txInfo = await optionsContracts.exercise(
          amtToExercise,
          [owner1],
          {
            from: exerciser
          }
        );

        const tx = await web3.eth.getTransaction(txInfo.tx);
        finalETH = await balance.current(exerciser);

        gasUsed = new BN(txInfo.receipt.gasUsed);
        gasPrice = new BN(tx.gasPrice);

        // check that the person gets the right amount of ETH back
        const expectedEndETHBalance = initialETH
          .sub(gasUsed.mul(gasPrice))
          .add(new BN(450));
        expect(finalETH.toString()).to.equal(expectedEndETHBalance.toString());

        // check the supply of oTokens has changed
        const totalSupplyAfter = await optionsContracts.totalSupply();
        expect(
          totalSupplyBefore.sub(new BN(amtToExercise)).toString()
        ).to.equal(totalSupplyAfter.toString());

        // check that the right events were emitted
        expectEvent(txInfo, 'Exercise', {
          amtUnderlyingToPay: new BN(100000),
          amtCollateralToPay: new BN(450)
        });
      });

      it('check that the underlying and oTokens were transferred', async () => {
        // The balances of the person should be 0
        const amtOTokens = await optionsContracts.balanceOf(exerciser);
        expect(amtOTokens.toString()).to.equal('0');

        const ownerDaiBal = await dai.balanceOf(exerciser);
        expect(ownerDaiBal.toString()).to.equal('0');

        // The underlying balances of the contract should have increased
        const contractDaiBal = await dai.balanceOf(optionsContracts.address);
        expect(contractDaiBal.toString()).to.equal('100000');
      });

      // Two more tests to cover old exercise implementation.
      it('should be able to exercise 0 amount', async () => {
        await optionsContracts.exercise('0', [owner1], {
          from: exerciser
        });
      });
    });

    describe('#redeem() after expiry window', () => {
      it('owner1 should be able to collect their share of collateral', async () => {
        await time.increaseTo(expiry);

        const initialETH = await balance.current(owner1);

        const txInfo = await optionsContracts.redeemVaultBalance({
          from: owner1
        });

        const tx = await web3.eth.getTransaction(txInfo.tx);
        const finalETH = await balance.current(owner1);

        // check the calculations on amount of collateral paid out and underlying transferred is correct
        expectEvent(txInfo, 'RedeemVaultBalance', {
          amtCollateralRedeemed: '19999550',
          amtUnderlyingRedeemed: '100000'
        });

        const gasUsed = new BN(txInfo.receipt.gasUsed);
        const gasPrice = new BN(tx.gasPrice);
        const expectedEndETHBalance = initialETH
          .sub(gasUsed.mul(gasPrice))
          .add(new BN(19999550));
        expect(finalETH.toString()).to.equal(expectedEndETHBalance.toString());

        // check the person's underlying balance increased
        const ownerDaiBal = await dai.balanceOf(owner1);
        expect(ownerDaiBal.toString()).to.equal('100000');
      });

      it('only a vault owner can collect collateral', async () => {
        await expectRevert(
          optionsContracts.redeemVaultBalance({
            from: nonOwnerAddress
          }),
          'Vault does not exist'
        );
      });

      it('once collateral has been collected, should not be able to collect again', async () => {
        const ownerETHBalBefore = await balance.current(owner1);
        const ownerDaiBalBefore = await dai.balanceOf(owner1);

        const txInfo = await optionsContracts.redeemVaultBalance({
          from: owner1
        });
        const tx = await web3.eth.getTransaction(txInfo.tx);

        // check ETH balance after = balance before - gas
        const gasUsed = new BN(txInfo.receipt.gasUsed);
        const gasPrice = new BN(tx.gasPrice);
        const ownerETHBalAfter = await balance.current(owner1);
        const ownerDaiBalAfter = await dai.balanceOf(owner1);
        expect(
          ownerETHBalBefore.sub(gasUsed.mul(gasPrice)).toString()
        ).to.equal(ownerETHBalAfter.toString());
        // check underlying balance stays the same
        expect(ownerDaiBalBefore.toString()).to.equal(
          ownerDaiBalAfter.toString()
        );
      });

      it('Owner2 should be able to collect his collateral', async () => {
        const tx = await optionsContracts.redeemVaultBalance({
          from: owner2
        });

        // check the calculations on amount of collateral paid out and underlying transferred is correct
        expectEvent(tx, 'RedeemVaultBalance', {
          amtCollateralRedeemed: '20000000',
          amtUnderlyingRedeemed: '0',
          vaultOwner: owner2
        });

        const ownerDaiBal = await dai.balanceOf(owner2);
        expect(ownerDaiBal.toString()).to.equal('0');
      });
    });
  }
);

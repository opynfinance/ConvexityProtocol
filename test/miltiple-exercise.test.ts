import {expect} from 'chai';
import {
  MockErc20Instance,
  MockOracleInstance,
  OptionsContractInstance,
  OptionsFactoryInstance
} from '../build/types/truffle-types';

const OptionsContract = artifacts.require('OptionsContract');
const OptionsFactory = artifacts.require('OptionsFactory');
const MockOracle = artifacts.require('MockOracle');
const MockERC20 = artifacts.require('MockERC20');

import {ZERO_ADDRESS} from './utils/helper';
import Reverter from './utils/reverter';

const {BN, balance, time, expectEvent} = require('@openzeppelin/test-helpers');

contract('OptionsContract', accounts => {
  const reverter = new Reverter(web3);

  const creatorAddress = accounts[0];
  const firstVaultOwnerAddress = accounts[1];
  const secondVaultOwnerAddress = accounts[2];

  const firstExerciser = accounts[3];
  const secondExerciser = accounts[4];

  const optionsContracts: OptionsContractInstance[] = [];
  let optionsFactory: OptionsFactoryInstance;
  let compoundOracle: MockOracleInstance;
  let dai: MockErc20Instance;
  let usdc: MockErc20Instance;

  const vault1Collateral = '20000000';
  const vault1PutsOutstanding = '250000';

  const vault2Collateral = '10000000';
  const vault2PutsOutstanding = '100000';

  let expiry: number;
  let windowSize: number;

  before('set up contracts', async () => {
    const now = (await time.latest()).toNumber();
    expiry = now + time.duration.days(30).toNumber();
    windowSize = expiry;
    // 1. Deploy mock contracts
    // 1.1 Compound Oracle
    compoundOracle = await MockOracle.deployed();

    // 1.2 Mock Dai contract
    dai = await MockERC20.new('DAI', 'DAI', 18);
    await dai.mint(creatorAddress, '10000000');
    await dai.mint(firstExerciser, '100000', {from: creatorAddress});
    await dai.mint(secondExerciser, '100000', {from: creatorAddress});

    // 1.3 Mock Dai contract
    usdc = await MockERC20.new('USDC', 'USDC', 6);
    await usdc.mint(creatorAddress, '10000000');

    // 2. Deploy our contracts
    // Deploy the Options Factory contract and add assets to it
    optionsFactory = await OptionsFactory.deployed();

    await optionsFactory.whitelistAsset(ZERO_ADDRESS);
    await optionsFactory.whitelistAsset(dai.address);
    // TODO: deploy a mock USDC and get its address
    await optionsFactory.whitelistAsset(usdc.address);

    // Create the unexpired options contract
    const optionsContractResult = await optionsFactory.createOptionsContract(
      ZERO_ADDRESS,
      dai.address,
      usdc.address,
      -'14',
      '9',
      -'15',
      expiry,
      windowSize,
      'Opyn DAI:USDC',
      'oDAI',
      {from: creatorAddress}
    );

    const optionsContractAddr = optionsContractResult.logs[1].args[0];
    optionsContracts.push(await OptionsContract.at(optionsContractAddr));

    // Open vault1, add Collateral and Mint oTokens
    await optionsContracts[0].openVault({
      from: firstVaultOwnerAddress
    });

    await optionsContracts[0].addETHCollateral(firstVaultOwnerAddress, {
      from: firstVaultOwnerAddress,

      value: vault1Collateral
    });

    await optionsContracts[0].issueOTokens(
      vault1PutsOutstanding,
      firstVaultOwnerAddress,
      {
        from: firstVaultOwnerAddress
      }
    );

    await optionsContracts[0].transfer(firstExerciser, '10', {
      from: firstVaultOwnerAddress
    });

    // Open vault2, add Collateral and Mint oTokens
    await optionsContracts[0].openVault({
      from: secondVaultOwnerAddress
    });

    await optionsContracts[0].addETHCollateral(secondVaultOwnerAddress, {
      from: secondVaultOwnerAddress,

      value: vault2Collateral
    });

    await optionsContracts[0].issueOTokens(
      vault2PutsOutstanding,
      secondVaultOwnerAddress,
      {
        from: secondVaultOwnerAddress
      }
    );

    await optionsContracts[0].transfer(secondExerciser, '10', {
      from: secondVaultOwnerAddress
    });

    await reverter.snapshot();
  });

  describe('Scenario: Exercise + Redeem collateral', () => {
    it('firstExerciser should be able to exercise 10 oTokens', async () => {
      const underlyingToPay = new BN(100000);
      const collateralToPay = new BN(450);
      const amtToExercise = '10';
      const initialDaiBalance = new BN(
        (await dai.balanceOf(firstExerciser)).toString()
      );

      await dai.approve(
        optionsContracts[0].address,
        '10000000000000000000000',
        {from: firstExerciser}
      );

      // call exercise
      // ensure you approve before burn
      await optionsContracts[0].approve(
        optionsContracts[0].address,
        '10000000000000000',
        {from: firstExerciser}
      );

      const initialETH = await balance.current(firstExerciser);

      const txInfo = await optionsContracts[0].exercise(
        amtToExercise,
        [firstVaultOwnerAddress],
        {
          from: firstExerciser
        }
      );

      const tx = await web3.eth.getTransaction(txInfo.tx);
      const finalETH = await balance.current(firstExerciser);

      expectEvent(txInfo, 'Exercise', {
        amtUnderlyingToPay: underlyingToPay,
        amtCollateralToPay: collateralToPay
      });

      const oTokenBalance = await optionsContracts[0].balanceOf(firstExerciser);
      expect(oTokenBalance.toString()).to.equal('0');

      const finalDaiBalance = await dai.balanceOf(firstExerciser);
      expect(initialDaiBalance.sub(underlyingToPay).toString()).to.equal(
        finalDaiBalance.toString()
      );

      const gasUsed = new BN(txInfo.receipt.gasUsed);
      const gasPrice = new BN(tx.gasPrice);
      const expectedEndETHBalance = initialETH
        .sub(gasUsed.mul(gasPrice))
        .add(collateralToPay);
      expect(finalETH.toString()).to.equal(expectedEndETHBalance.toString());
    });

    it('vault 1 should be unsafe after Compund Oracle drops price', async () => {
      const newETHToUSDPrice = 100;
      const newPrice = Math.floor((1 / newETHToUSDPrice) * 10 ** 18).toString();
      await compoundOracle.updatePrice(newPrice, {
        from: creatorAddress
      });

      const result = await optionsContracts[0].isUnsafe(firstVaultOwnerAddress);

      expect(result).to.be.true;
    });

    it('vault 2 should be unsafe after Compund Oracle drops price', async () => {
      const newETHToUSDPrice = 100;
      const newPrice = Math.floor((1 / newETHToUSDPrice) * 10 ** 18).toString();
      await compoundOracle.updatePrice(newPrice, {
        from: creatorAddress
      });

      const result = await optionsContracts[0].isUnsafe(
        secondVaultOwnerAddress
      );

      expect(result).to.be.true;
    });

    it('balance of first vault should have changed', async () => {
      const vault = await optionsContracts[0].getVault(firstVaultOwnerAddress);
      expect(vault['0'].toString()).to.equal('19999550');
      expect(vault['1'].toString()).to.equal('249990');
      expect(vault['2'].toString()).to.equal('100000');
    });

    it('secondExerciser should be able to exercise 10 oTokens', async () => {
      const newETHToUSDPrice = 200;
      const newPrice = Math.floor((1 / newETHToUSDPrice) * 10 ** 18).toString();
      await compoundOracle.updatePrice(newPrice, {
        from: creatorAddress
      });

      const underlyingToPay = new BN(100000);
      const collateralToPay = new BN(450);
      const amtToExercise = '10';
      const initialDaiBalance = new BN(
        (await dai.balanceOf(secondExerciser)).toString()
      );

      await dai.approve(
        optionsContracts[0].address,
        '10000000000000000000000',
        {from: secondExerciser}
      );

      // call exercise
      // ensure you approve before burn
      await optionsContracts[0].approve(
        optionsContracts[0].address,
        '10000000000000000',
        {from: secondExerciser}
      );

      const initialETH = await balance.current(secondExerciser);

      const txInfo = await optionsContracts[0].exercise(
        amtToExercise,
        [secondVaultOwnerAddress],
        {
          from: secondExerciser
        }
      );

      expectEvent(txInfo, 'Exercise', {
        amtUnderlyingToPay: underlyingToPay,
        amtCollateralToPay: collateralToPay
      });

      const tx = await web3.eth.getTransaction(txInfo.tx);
      const finalETH = await balance.current(secondExerciser);

      const oTokenBalance = await optionsContracts[0].balanceOf(
        secondExerciser
      );
      expect(oTokenBalance.toString()).to.equal('0');

      const finalDaiBalance = await dai.balanceOf(secondExerciser);
      expect(initialDaiBalance.sub(underlyingToPay).toString()).to.equal(
        finalDaiBalance.toString()
      );

      const gasUsed = new BN(txInfo.receipt.gasUsed);
      const gasPrice = new BN(tx.gasPrice);
      const expectedEndETHBalance = initialETH
        .sub(gasUsed.mul(gasPrice))
        .add(collateralToPay);
      expect(finalETH.toString()).to.equal(expectedEndETHBalance.toString());
    });

    it('secondVaultOwnerAddress should be able to withdraw underlying before expiry', async () => {
      const underlyingRedeemed = new BN(100000);
      const initialDaiBalance = new BN(
        (await dai.balanceOf(secondVaultOwnerAddress)).toString()
      );

      await optionsContracts[0].removeUnderlying({
        from: secondVaultOwnerAddress
      });

      const finalDaiBalance = new BN(
        (await dai.balanceOf(secondVaultOwnerAddress)).toString()
      );
      expect(initialDaiBalance.add(underlyingRedeemed).toString()).to.equal(
        finalDaiBalance.toString()
      );
    });

    it('secondVaultOwnerAddress should be able to redeem after expiry', async () => {
      const newETHToUSDPrice = 200;
      const newPrice = Math.floor((1 / newETHToUSDPrice) * 10 ** 18).toString();
      await compoundOracle.updatePrice(newPrice, {
        from: creatorAddress
      });

      const collateralRedeemed = new BN(9999550);
      const underlyingRedeemed = new BN(0);

      const initialDaiBalance = new BN(
        (await dai.balanceOf(secondVaultOwnerAddress)).toString()
      );

      await time.increaseTo(windowSize + 2);

      const txInfo = await optionsContracts[0].redeemVaultBalance({
        from: secondVaultOwnerAddress
      });

      expectEvent(txInfo, 'RedeemVaultBalance', {
        amtCollateralRedeemed: collateralRedeemed,
        amtUnderlyingRedeemed: underlyingRedeemed
      });

      const finalDaiBalance = new BN(
        (await dai.balanceOf(secondVaultOwnerAddress)).toString()
      );
      expect(initialDaiBalance.add(underlyingRedeemed).toString()).to.equal(
        finalDaiBalance.toString()
      );

      const vault = await optionsContracts[0].getVault(secondVaultOwnerAddress);
      expect(vault['0'].toString()).to.equal('0');
    });

    it('firstVaultOwnerAddress should be able to redeem after expiry', async () => {
      const collateralRedeemed = new BN(19999550);
      const underlyingRedeemed = new BN(100000);

      const initialDaiBalance = new BN(
        (await dai.balanceOf(firstVaultOwnerAddress)).toString()
      );
      //       await time.increaseTo(1577836802);
      const txInfo = await optionsContracts[0].redeemVaultBalance({
        from: firstVaultOwnerAddress
      });

      expectEvent(txInfo, 'RedeemVaultBalance', {
        amtCollateralRedeemed: collateralRedeemed,
        amtUnderlyingRedeemed: underlyingRedeemed
      });

      const finalDaiBalance = new BN(
        (await dai.balanceOf(firstVaultOwnerAddress)).toString()
      );
      expect(initialDaiBalance.add(underlyingRedeemed).toString()).to.equal(
        finalDaiBalance.toString()
      );

      const vault = await optionsContracts[0].getVault(firstVaultOwnerAddress);
      expect(vault['0'].toString()).to.equal('0');
    });

    it('should revert everything', async () => {
      await reverter.revert();

      let vault = await optionsContracts[0].getVault(firstVaultOwnerAddress);
      expect(vault['0'].toString()).to.equal(vault1Collateral);
      expect(vault['1'].toString()).to.equal(vault1PutsOutstanding);

      vault = await optionsContracts[0].getVault(secondVaultOwnerAddress);
      expect(vault['0'].toString()).to.equal(vault2Collateral);
      expect(vault['1'].toString()).to.equal(vault2PutsOutstanding);
    });
  });
});

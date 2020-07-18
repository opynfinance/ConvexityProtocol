import {expect} from 'chai';
import {
  ERC20MintableInstance,
  MockCompoundOracleInstance,
  OptionsContractInstance,
  OptionsFactoryInstance
} from '../build/types/truffle-types';

const OptionsContract = artifacts.require('OptionsContract');
const OptionsFactory = artifacts.require('OptionsFactory');
const MockCompoundOracle = artifacts.require('MockCompoundOracle');
const MockUniswapFactory = artifacts.require('MockUniswapFactory');
const MintableToken = artifacts.require('ERC20Mintable');

import Reverter from './utils/reverter';

const {
  BN,
  constants,
  balance,
  time,
  expectEvent,
  expectRevert
} = require('@openzeppelin/test-helpers');

contract('OptionsContract', accounts => {
  const reverter = new Reverter(web3);

  const creatorAddress = accounts[0];
  const firstVaultOwnerAddress = accounts[1];
  const secondVaultOwnerAddress = accounts[2];

  const firstExerciser = accounts[3];
  const secondExerciser = accounts[4];

  const tokenHolder = accounts[5];

  const optionsContracts: OptionsContractInstance[] = [];
  let optionsFactory: OptionsFactoryInstance;
  let compoundOracle: MockCompoundOracleInstance;
  let dai: ERC20MintableInstance;
  let usdc: ERC20MintableInstance;

  const vault1Collateral = '20000000';
  const vault1PutsOutstanding = '250000';

  const vault2Collateral = '10000000';
  const vault2PutsOutstanding = '100000';

  const windowSize = 1589932800;

  before('set up contracts', async () => {
    // 1. Deploy mock contracts
    // 1.1 Compound Oracle
    compoundOracle = await MockCompoundOracle.deployed();

    // 1.2 Mock Dai contract
    dai = await MintableToken.new();
    await dai.mint(creatorAddress, '10000000');
    await dai.mint(firstExerciser, '100000', {from: creatorAddress});
    await dai.mint(secondExerciser, '100000', {from: creatorAddress});

    // 1.3 Mock Dai contract
    usdc = await MintableToken.new();
    await usdc.mint(creatorAddress, '10000000');

    // 2. Deploy our contracts

    // Deploy the Options Factory contract and add assets to it
    optionsFactory = await OptionsFactory.deployed();

    await optionsFactory.addAsset('DAI', dai.address);
    // TODO: deploy a mock USDC and get its address
    await optionsFactory.addAsset('USDC', usdc.address);

    // Create the unexpired options contract
    const optionsContractResult = await optionsFactory.createOptionsContract(
      'ETH',
      -'18',
      'DAI',
      -'18',
      -'14',
      '9',
      -'15',
      'USDC',
      '1589932800',
      windowSize,
      {from: creatorAddress, gas: '4000000'}
    );

    const optionsContractAddr = optionsContractResult.logs[1].args[0];
    optionsContracts.push(await OptionsContract.at(optionsContractAddr));

    // Open vault1, add Collateral and Mint oTokens
    await optionsContracts[0].openVault({
      from: firstVaultOwnerAddress,
      gas: '100000'
    });

    await optionsContracts[0].addETHCollateral(firstVaultOwnerAddress, {
      from: firstVaultOwnerAddress,
      gas: '100000',
      value: vault1Collateral
    });

    await optionsContracts[0].issueOTokens(
      vault1PutsOutstanding,
      firstVaultOwnerAddress,
      {
        from: firstVaultOwnerAddress,
        gas: '100000'
      }
    );

    await optionsContracts[0].transfer(firstExerciser, '10', {
      from: firstVaultOwnerAddress,
      gas: '100000'
    });

    await optionsContracts[0].transfer(tokenHolder, '101010', {
      from: firstVaultOwnerAddress,
      gas: '100000'
    });

    // Open vault2, add Collateral and Mint oTokens
    await optionsContracts[0].openVault({
      from: secondVaultOwnerAddress,
      gas: '100000'
    });

    await optionsContracts[0].addETHCollateral(secondVaultOwnerAddress, {
      from: secondVaultOwnerAddress,
      gas: '100000',
      value: vault2Collateral
    });

    await optionsContracts[0].issueOTokens(
      vault2PutsOutstanding,
      secondVaultOwnerAddress,
      {
        from: secondVaultOwnerAddress,
        gas: '100000'
      }
    );

    await optionsContracts[0].transfer(secondExerciser, '10', {
      from: secondVaultOwnerAddress,
      gas: '100000'
    });

    await optionsContracts[0].transfer(tokenHolder, '1000', {
      from: secondVaultOwnerAddress,
      gas: '100000'
    });

    await reverter.snapshot();
  });

  describe('Scenario: Exercise + Add + remove collateral + liquidate + burn tokens + Exercise + Claim collateral', () => {
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
          from: firstExerciser,
          gas: '1000000'
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
        from: creatorAddress,
        gas: '1000000'
      });

      const result = await optionsContracts[0].isUnsafe(firstVaultOwnerAddress);

      expect(result).to.be.true;
    });

    it('vault 2 should be unsafe after Compund Oracle drops price', async () => {
      const newETHToUSDPrice = 100;
      const newPrice = Math.floor((1 / newETHToUSDPrice) * 10 ** 18).toString();
      await compoundOracle.updatePrice(newPrice, {
        from: creatorAddress,
        gas: '1000000'
      });

      const result = await optionsContracts[0].isUnsafe(
        secondVaultOwnerAddress
      );

      expect(result).to.be.true;
    });

    it('anyone should be able to add ETH collateral to vault 2', async () => {
      let vaultState = await optionsContracts[0].getVault(
        secondVaultOwnerAddress
      );
      const initialCollateral = new BN(vaultState['0'].toString());

      await optionsContracts[0].addETHCollateral(secondVaultOwnerAddress, {
        from: creatorAddress,
        gas: '100000',
        value: vault2Collateral
      });

      vaultState = await optionsContracts[0].getVault(secondVaultOwnerAddress);
      const finalCollateral = new BN(vaultState['0'].toString());

      // Lower bound in case of decimal precision errors
      expect(finalCollateral.toNumber()).to.be.closeTo(
        initialCollateral.add(new BN(vault2Collateral)).toNumber(),
        1
      );
    });

    it('vault 2 should be safe after adding ETH collateral', async () => {
      const result = await optionsContracts[0].isUnsafe(
        secondVaultOwnerAddress
      );
      expect(result).to.be.false;
    });

    it('vault 1 should be safe after Compund Oracle increases price', async () => {
      const newETHToUSDPrice = 200;
      const newPrice = Math.floor((1 / newETHToUSDPrice) * 10 ** 18).toString();
      await compoundOracle.updatePrice(newPrice, {
        from: creatorAddress,
        gas: '1000000'
      });

      const result = await optionsContracts[0].isUnsafe(firstVaultOwnerAddress);

      expect(result).to.be.false;
    });

    it('secondVaultOwnerAddress should be able to remove collateral', async () => {
      let vaultState = await optionsContracts[0].getVault(
        secondVaultOwnerAddress
      );
      const initialCollateral = new BN(vaultState['0'].toString());
      const initialETH = await balance.current(secondVaultOwnerAddress);
      const txInfo = await optionsContracts[0].removeCollateral(
        vault2Collateral,
        {
          from: secondVaultOwnerAddress,
          gas: '100000'
        }
      );

      const tx = await web3.eth.getTransaction(txInfo.tx);
      const finalETH = await balance.current(secondVaultOwnerAddress);

      vaultState = await optionsContracts[0].getVault(secondVaultOwnerAddress);
      const finalCollateral = new BN(vaultState['0'].toString());

      expect(finalCollateral.toNumber()).to.be.closeTo(
        initialCollateral.sub(new BN(vault2Collateral)).toNumber(),
        1
      );

      const gasUsed = new BN(txInfo.receipt.gasUsed);
      const gasPrice = new BN(tx.gasPrice);
      const expectedEndETHBalance = initialETH
        .sub(gasUsed.mul(gasPrice))
        .add(new BN(vault2Collateral));
      expect(finalETH.toString()).to.equal(expectedEndETHBalance.toString());
    });

    it("firstVaultOwnerAddress shouldn't be able to remove collateral", async () => {
      await expectRevert(
        optionsContracts[0].removeCollateral(vault2Collateral, {
          from: firstVaultOwnerAddress,
          gas: '100000'
        }),
        'Vault is unsafe'
      );
    });

    it('vault 1 should be unsafe after Compund Oracle drops price', async () => {
      const newETHToUSDPrice = 100;
      const newPrice = Math.floor((1 / newETHToUSDPrice) * 10 ** 18).toString();
      await compoundOracle.updatePrice(newPrice, {
        from: creatorAddress,
        gas: '1000000'
      });
      const result = await optionsContracts[0].isUnsafe(firstVaultOwnerAddress);

      expect(result).to.be.true;
    });

    it('vault 2 should be unsafe after Compund Oracle drops price', async () => {
      const result = await optionsContracts[0].isUnsafe(
        secondVaultOwnerAddress
      );

      expect(result).to.be.true;
    });

    it('should be able to liquidate some collateral from vault 1', async () => {
      const expectedCollateralToPay = new BN(9181809);
      const initialETH = await balance.current(tokenHolder);

      const txInfo = await optionsContracts[0].liquidate(
        firstVaultOwnerAddress,
        '101010',
        {
          from: tokenHolder,
          gas: '200000'
        }
      );

      const tx = await web3.eth.getTransaction(txInfo.tx);
      const finalETH = await balance.current(tokenHolder);

      expectEvent(txInfo, 'Liquidate', {
        amtCollateralToPay: expectedCollateralToPay
      });

      const gasUsed = new BN(txInfo.receipt.gasUsed);
      const gasPrice = new BN(tx.gasPrice);
      const expectedEndETHBalance = initialETH
        .sub(gasUsed.mul(gasPrice))
        .add(expectedCollateralToPay);
      expect(finalETH.toString()).to.equal(expectedEndETHBalance.toString());
    });

    it('vault 1 should remain unsafe after Compund Oracle increases price', async () => {
      const newETHToUSDPrice = 150;
      const newPrice = Math.floor((1 / newETHToUSDPrice) * 10 ** 18).toString();
      await compoundOracle.updatePrice(newPrice, {
        from: creatorAddress,
        gas: '1000000'
      });

      const result = await optionsContracts[0].isUnsafe(firstVaultOwnerAddress);

      expect(result).to.be.true;
    });

    it('vault 2 should be safe after Compund Oracle increases price', async () => {
      const result = await optionsContracts[0].isUnsafe(
        secondVaultOwnerAddress
      );

      expect(result).to.be.false;
    });

    it('should be able to liquidate some more collateral from vault 1', async () => {
      const expectedCollateralToPay = new BN(6060);
      const initialETH = await balance.current(tokenHolder);

      const txInfo = await optionsContracts[0].liquidate(
        firstVaultOwnerAddress,
        '100',
        {
          from: tokenHolder,
          gas: '200000'
        }
      );

      const tx = await web3.eth.getTransaction(txInfo.tx);
      const finalETH = await balance.current(tokenHolder);

      expectEvent(txInfo, 'Liquidate', {
        amtCollateralToPay: expectedCollateralToPay
      });

      const gasUsed = new BN(txInfo.receipt.gasUsed);
      const gasPrice = new BN(tx.gasPrice);
      const expectedEndETHBalance = initialETH
        .sub(gasUsed.mul(gasPrice))
        .add(expectedCollateralToPay);
      expect(finalETH.toString()).to.equal(expectedEndETHBalance.toString());
    });

    it('vault 1 should remain unsafe after liquidation', async () => {
      const result = await optionsContracts[0].isUnsafe(firstVaultOwnerAddress);

      expect(result).to.be.true;
    });

    it('firstVaultOwner should be able to burn some put tokens to turn the vault safe', async () => {
      await optionsContracts[0].burnOTokens('100000', {
        from: firstVaultOwnerAddress,
        gas: '100000'
      });

      const result = await optionsContracts[0].isUnsafe(firstVaultOwnerAddress);

      expect(result).to.be.false;
    });

    it('secondExerciser should be able to exercise 10 oTokens', async () => {
      const newETHToUSDPrice = 100;
      const newPrice = Math.floor((1 / newETHToUSDPrice) * 10 ** 18).toString();
      await compoundOracle.updatePrice(newPrice, {
        from: creatorAddress,
        gas: '1000000'
      });

      const underlyingToPay = new BN(100000);
      const collateralToPay = new BN(900);
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
          from: secondExerciser,
          gas: '1000000'
        }
      );

      const tx = await web3.eth.getTransaction(txInfo.tx);
      const finalETH = await balance.current(secondExerciser);

      expectEvent(txInfo, 'Exercise', {
        amtUnderlyingToPay: underlyingToPay,
        amtCollateralToPay: collateralToPay
      });

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

    it('secondVaultOwnerAddress should be able to claim after expiry', async () => {
      const newETHToUSDPrice = 200;
      const newPrice = Math.floor((1 / newETHToUSDPrice) * 10 ** 18).toString();
      await compoundOracle.updatePrice(newPrice, {
        from: creatorAddress,
        gas: '1000000'
      });

      const collateralRedeemed = new BN(9999100);
      const underlyingRedeemed = new BN(100000);

      const initialDaiBalance = new BN(
        (await dai.balanceOf(secondVaultOwnerAddress)).toString()
      );

      await time.increaseTo(windowSize + 2);

      const txInfo = await optionsContracts[0].redeemVaultBalance({
        from: secondVaultOwnerAddress,
        gas: '1000000'
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

    it('firstVaultOwnerAddress should be able to claim after expiry', async () => {
      const collateralRedeemed = new BN(10811681);
      const underlyingRedeemed = new BN(100000);

      const initialDaiBalance = new BN(
        (await dai.balanceOf(firstVaultOwnerAddress)).toString()
      );

      const txInfo = await optionsContracts[0].redeemVaultBalance({
        from: firstVaultOwnerAddress,
        gas: '1000000'
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
  });

  describe('Scenario: Exercise + Add + remove collateral + liquidate + burn tokens + Exercise + Claim collateral AFTER updateParameters ', () => {
    before('revert', async () => {
      await reverter.revert();

      let vault = await optionsContracts[0].getVault(firstVaultOwnerAddress);
      expect(vault['0'].toString()).to.equal(vault1Collateral);
      expect(vault['1'].toString()).to.equal(vault1PutsOutstanding);

      vault = await optionsContracts[0].getVault(secondVaultOwnerAddress);
      expect(vault['0'].toString()).to.equal(vault2Collateral);
      expect(vault['1'].toString()).to.equal(vault2PutsOutstanding);
    });

    it('only owner should be able to update parameters', async () => {
      await expectRevert(
        optionsContracts[0].updateParameters(0, 0, 0, 0, {
          from: firstVaultOwnerAddress,
          gas: '100000'
        }),
        'Ownable: caller is not the owner.'
      );
    });

    it('owner should be able to update parameters', async () => {
      const liquidationIncentive = 20;
      const liquidationFactor = 1000;
      const transactionFee = 10;
      const collateralizationRatio = 20;

      let currentCollateralizationRatio = await optionsContracts[0].minCollateralizationRatio();
      expect(currentCollateralizationRatio[0].toString()).to.equal('16');

      await optionsContracts[0].updateParameters(
        liquidationIncentive,
        liquidationFactor,
        transactionFee,
        collateralizationRatio,
        {from: creatorAddress, gas: '100000'}
      );

      currentCollateralizationRatio = await optionsContracts[0].minCollateralizationRatio();
      expect(currentCollateralizationRatio[0].toString()).to.equal('20');
    });

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
          from: firstExerciser,
          gas: '1000000'
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
        from: creatorAddress,
        gas: '1000000'
      });

      const result = await optionsContracts[0].isUnsafe(firstVaultOwnerAddress);

      expect(result).to.be.true;
    });

    it('vault 2 should be unsafe after Compund Oracle drops price', async () => {
      const newETHToUSDPrice = 100;
      const newPrice = Math.floor((1 / newETHToUSDPrice) * 10 ** 18).toString();
      await compoundOracle.updatePrice(newPrice, {
        from: creatorAddress,
        gas: '1000000'
      });

      const result = await optionsContracts[0].isUnsafe(
        secondVaultOwnerAddress
      );

      expect(result).to.be.true;
    });

    it('anyone should be able to add ETH collateral to vault 2', async () => {
      let vaultState = await optionsContracts[0].getVault(
        secondVaultOwnerAddress
      );
      const initialCollateral = new BN(vaultState['0'].toString());

      await optionsContracts[0].addETHCollateral(secondVaultOwnerAddress, {
        from: creatorAddress,
        gas: '100000',
        value: vault2Collateral
      });

      vaultState = await optionsContracts[0].getVault(secondVaultOwnerAddress);
      const finalCollateral = new BN(vaultState['0'].toString());

      expect(finalCollateral.toString()).to.equal(
        initialCollateral.add(new BN(vault2Collateral)).toString()
      );
    });

    it('vault 2 should be safe after adding ETH collateral', async () => {
      const result = await optionsContracts[0].isUnsafe(
        secondVaultOwnerAddress
      );
      expect(result).to.be.false;
    });

    it('vault 1 should be safe after Compund Oracle increases price', async () => {
      const newETHToUSDPrice = 400;
      const newPrice = Math.floor((1 / newETHToUSDPrice) * 10 ** 18).toString();
      await compoundOracle.updatePrice(newPrice, {
        from: creatorAddress,
        gas: '1000000'
      });

      const result = await optionsContracts[0].isUnsafe(firstVaultOwnerAddress);

      expect(result).to.be.false;
    });

    it('secondVaultOwnerAddress should be able to remove collateral', async () => {
      let vaultState = await optionsContracts[0].getVault(
        secondVaultOwnerAddress
      );
      const initialCollateral = new BN(vaultState['0'].toString());
      const initialETH = await balance.current(secondVaultOwnerAddress);
      const txInfo = await optionsContracts[0].removeCollateral(
        vault2Collateral,
        {
          from: secondVaultOwnerAddress,
          gas: '100000'
        }
      );

      const tx = await web3.eth.getTransaction(txInfo.tx);
      const finalETH = await balance.current(secondVaultOwnerAddress);

      vaultState = await optionsContracts[0].getVault(secondVaultOwnerAddress);
      const finalCollateral = new BN(vaultState['0'].toString());

      expect(finalCollateral.toString()).to.equal(
        initialCollateral.sub(new BN(vault2Collateral)).toString()
      );

      const gasUsed = new BN(txInfo.receipt.gasUsed);
      const gasPrice = new BN(tx.gasPrice);
      const expectedEndETHBalance = initialETH
        .sub(gasUsed.mul(gasPrice))
        .add(new BN(vault2Collateral));
      expect(finalETH.toString()).to.equal(expectedEndETHBalance.toString());
    });

    it("firstVaultOwnerAddress shouldn't be able to remove collateral", async () => {
      await expectRevert(
        optionsContracts[0].removeCollateral(vault2Collateral, {
          from: firstVaultOwnerAddress,
          gas: '100000'
        }),
        'Vault is unsafe'
      );
    });

    it('vault 1 should be unsafe after Compund Oracle drops price', async () => {
      const newETHToUSDPrice = 100;
      const newPrice = Math.floor((1 / newETHToUSDPrice) * 10 ** 18).toString();
      await compoundOracle.updatePrice(newPrice, {
        from: creatorAddress,
        gas: '1000000'
      });
      const result = await optionsContracts[0].isUnsafe(firstVaultOwnerAddress);

      expect(result).to.be.true;
    });

    it('vault 2 should be unsafe after Compund Oracle drops price', async () => {
      const result = await optionsContracts[0].isUnsafe(
        secondVaultOwnerAddress
      );

      expect(result).to.be.true;
    });

    it('should be able to liquidate some collateral from vault 1', async () => {
      const expectedCollateralToPay = new BN(9272718);
      const initialETH = await balance.current(tokenHolder);

      const txInfo = await optionsContracts[0].liquidate(
        firstVaultOwnerAddress,
        '101010',
        {
          from: tokenHolder,
          gas: '200000'
        }
      );

      const tx = await web3.eth.getTransaction(txInfo.tx);
      const finalETH = await balance.current(tokenHolder);

      expectEvent(txInfo, 'Liquidate', {
        amtCollateralToPay: expectedCollateralToPay
      });

      const gasUsed = new BN(txInfo.receipt.gasUsed);
      const gasPrice = new BN(tx.gasPrice);
      const expectedEndETHBalance = initialETH
        .sub(gasUsed.mul(gasPrice))
        .add(expectedCollateralToPay);
      expect(finalETH.toString()).to.equal(expectedEndETHBalance.toString());
    });

    it('vault 1 should remain unsafe after Compund Oracle increases price', async () => {
      const newETHToUSDPrice = 200;
      const newPrice = Math.floor((1 / newETHToUSDPrice) * 10 ** 18).toString();
      await compoundOracle.updatePrice(newPrice, {
        from: creatorAddress,
        gas: '1000000'
      });

      const result = await optionsContracts[0].isUnsafe(firstVaultOwnerAddress);

      expect(result).to.be.true;
    });

    it('vault 2 should be safe after Compund Oracle increases price', async () => {
      const result = await optionsContracts[0].isUnsafe(
        secondVaultOwnerAddress
      );

      expect(result).to.be.false;
    });

    it('should be able to liquidate some more collateral from vault 1', async () => {
      const expectedCollateralToPay = new BN(4590);
      const initialETH = await balance.current(tokenHolder);

      const vault = await optionsContracts[0].getVault(firstVaultOwnerAddress);

      const txInfo = await optionsContracts[0].liquidate(
        firstVaultOwnerAddress,
        '100',
        {
          from: tokenHolder,
          gas: '200000'
        }
      );

      const tx = await web3.eth.getTransaction(txInfo.tx);
      const finalETH = await balance.current(tokenHolder);

      expectEvent(txInfo, 'Liquidate', {
        amtCollateralToPay: expectedCollateralToPay
      });

      const gasUsed = new BN(txInfo.receipt.gasUsed);
      const gasPrice = new BN(tx.gasPrice);
      const expectedEndETHBalance = initialETH
        .sub(gasUsed.mul(gasPrice))
        .add(expectedCollateralToPay);
      expect(finalETH.toString()).to.equal(expectedEndETHBalance.toString());
    });

    it('vault 1 should remain unsafe after liquidation', async () => {
      const result = await optionsContracts[0].isUnsafe(firstVaultOwnerAddress);

      expect(result).to.be.true;
    });

    it('firstVaultOwner should be able to burn some put tokens to turn the vault safe', async () => {
      await optionsContracts[0].burnOTokens('100000', {
        from: firstVaultOwnerAddress,
        gas: '100000'
      });

      const result = await optionsContracts[0].isUnsafe(firstVaultOwnerAddress);

      expect(result).to.be.false;
    });

    it('secondExerciser should be able to exercise 10 oTokens', async () => {
      const newETHToUSDPrice = 100;
      const newPrice = Math.floor((1 / newETHToUSDPrice) * 10 ** 18).toString();
      await compoundOracle.updatePrice(newPrice, {
        from: creatorAddress,
        gas: '1000000'
      });

      const underlyingToPay = new BN(100000);
      const collateralToPay = new BN(900);
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
          from: secondExerciser,
          gas: '1000000'
        }
      );

      const tx = await web3.eth.getTransaction(txInfo.tx);
      const finalETH = await balance.current(secondExerciser);

      expectEvent(txInfo, 'Exercise', {
        amtUnderlyingToPay: underlyingToPay,
        amtCollateralToPay: collateralToPay
      });

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

    it('secondVaultOwnerAddress should be able to claim after expiry', async () => {
      const newETHToUSDPrice = 200;
      const newPrice = Math.floor((1 / newETHToUSDPrice) * 10 ** 18).toString();
      await compoundOracle.updatePrice(newPrice, {
        from: creatorAddress,
        gas: '1000000'
      });

      const collateralRedeemed = new BN(9999091);
      const underlyingRedeemed = new BN(100000);

      const initialDaiBalance = new BN(
        (await dai.balanceOf(secondVaultOwnerAddress)).toString()
      );

      await time.increaseTo(windowSize + 2);

      const txInfo = await optionsContracts[0].redeemVaultBalance({
        from: secondVaultOwnerAddress,
        gas: '1000000'
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

    it('firstVaultOwnerAddress should be able to claim after expiry', async () => {
      const collateralRedeemed = new BN(10722238);
      const underlyingRedeemed = new BN(100000);

      const initialDaiBalance = new BN(
        (await dai.balanceOf(firstVaultOwnerAddress)).toString()
      );

      const txInfo = await optionsContracts[0].redeemVaultBalance({
        from: firstVaultOwnerAddress,
        gas: '1000000'
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

    it('owner should be able to withdraw fee', async () => {
      const initialETH = await balance.current(creatorAddress);

      const txInfo = await optionsContracts[0].transferFee(creatorAddress, {
        from: creatorAddress,
        gas: '1000000'
      });

      const tx = await web3.eth.getTransaction(txInfo.tx);
      const finalETH = await balance.current(creatorAddress);
      const gasUsed = new BN(txInfo.receipt.gasUsed);
      const gasPrice = new BN(tx.gasPrice);
      const expectedEndETHBalance = initialETH
        .sub(gasUsed.mul(gasPrice))
        .add(new BN('13'));
      expect(finalETH.toString()).to.equal(expectedEndETHBalance.toString());
    });
  });
});

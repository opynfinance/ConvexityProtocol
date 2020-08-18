import {expect} from 'chai';
import {
  Erc20MintableInstance,
  MockOracleInstance,
  OptionsContractInstance,
  OptionsFactoryInstance
} from '../build/types/truffle-types';

const OptionsContract = artifacts.require('OptionsContract');
const OptionsFactory = artifacts.require('OptionsFactory');
const MockOracle = artifacts.require('MockOracle');
const MintableToken = artifacts.require('ERC20Mintable');

import Reverter from './utils/reverter';
import {checkVault} from './utils/helper';
const {
  BN,
  time,
  balance,
  expectEvent,
  expectRevert
} = require('@openzeppelin/test-helpers');

contract('OptionsContract', accounts => {
  const reverter = new Reverter(web3);
  const [
    creatorAddress,
    firstVaultOwnerAddress,
    firstExerciser,
    secondExerciser,
    tokenHolder,
    random
  ] = accounts;

  const optionsContracts: OptionsContractInstance[] = [];
  let optionsFactory: OptionsFactoryInstance;
  let compoundOracle: MockOracleInstance;
  let dai: Erc20MintableInstance;
  let usdc: Erc20MintableInstance;

  const vault1Collateral = '20000000';
  const vault1PutsOutstanding = '250000';

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
      expiry,
      windowSize,
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

    await optionsContracts[0].transfer(tokenHolder, '101030', {
      from: firstVaultOwnerAddress
    });

    await reverter.snapshot();
  });

  describe('#liquidate()', () => {
    it('should revert when trying to liquidate someone with no vault', async () => {
      await expectRevert(
        optionsContracts[0].liquidate(random, 100),
        'Vault does not exis'
      );
    });

    it('vault should be unsafe when the price drops', async () => {
      let result = await optionsContracts[0].isUnsafe(firstVaultOwnerAddress);
      expect(result).to.be.false;

      const newETHToUSDPrice = 100;
      const newPrice = Math.floor((1 / newETHToUSDPrice) * 10 ** 18).toString();
      await compoundOracle.updatePrice(newPrice, {
        from: creatorAddress
      });

      result = await optionsContracts[0].isUnsafe(firstVaultOwnerAddress);
      expect(result).to.be.true;
    });

    it('should revert when msg.sender = vault owner', async () => {
      // Try to liquidate the vault
      await expectRevert(
        optionsContracts[0].liquidate(firstVaultOwnerAddress, '100', {
          from: firstVaultOwnerAddress
        }),
        "Owner can't liquidate themselves"
      );
    });

    it('should not be able to liquidate more than collateral factor when the price drops', async () => {
      // Try to liquidate the vault
      await expectRevert(
        optionsContracts[0].liquidate(firstVaultOwnerAddress, '1010100', {
          from: tokenHolder
        }),
        'Can only liquidate liquidation factor at any given time'
      );
    });

    it('should be able to liquidate when the price drops', async () => {
      const expectedCollateralToPay = new BN(9181809);
      const initialETH = await balance.current(tokenHolder);

      const txInfo = await optionsContracts[0].liquidate(
        firstVaultOwnerAddress,
        '101010',
        {
          from: tokenHolder
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

      // check that the vault balances have changed
      const vault = await optionsContracts[0].getVault(firstVaultOwnerAddress);
      checkVault(vault, '10818191', '148990');

      // check that the liquidator balances have changed
      const amtPTokens2 = await optionsContracts[0].balanceOf(tokenHolder);
      expect(amtPTokens2.toString()).to.equal('20');
    });

    it('should be able to liquidate if still undercollateralized', async () => {
      // check that vault is still unsafe
      const result = await optionsContracts[0].isUnsafe(firstVaultOwnerAddress);
      expect(result).to.be.true;

      const numOptions = (
        await optionsContracts[0].maxOTokensLiquidatable(firstVaultOwnerAddress)
      ).toString();

      await optionsContracts[0].transfer(tokenHolder, numOptions, {
        from: firstVaultOwnerAddress
      });

      const expectedCollateralToPay = new BN(5409004);
      const initialETH = await balance.current(tokenHolder);

      const txInfo = await optionsContracts[0].liquidate(
        firstVaultOwnerAddress,
        numOptions,
        {
          from: tokenHolder
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

      // check that the vault balances have changed
      const vault = await optionsContracts[0].getVault(firstVaultOwnerAddress);
      checkVault(vault, '5409187', '89485');

      // check that the liquidator balances have changed
      const amtPTokens2 = await optionsContracts[0].balanceOf(tokenHolder);
      expect(amtPTokens2.toString()).to.equal('20');
    });

    it('should not be able to liquidate if safe', async () => {
      const newETHToUSDPrice = 250;
      const newPrice = Math.floor((1 / newETHToUSDPrice) * 10 ** 18).toString();
      await compoundOracle.updatePrice(newPrice, {
        from: creatorAddress
      });

      const result = await optionsContracts[0].isUnsafe(firstVaultOwnerAddress);
      expect(result).to.be.false;

      // Try to liquidate the vault
      await expectRevert(
        optionsContracts[0].liquidate(firstVaultOwnerAddress, '10', {
          from: tokenHolder
        }),
        'Vault is safe'
      );
    });
  });
});

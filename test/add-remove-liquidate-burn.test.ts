import {expect} from 'chai';
import {
  MockErc20Instance,
  MockOracleInstance,
  OptionsContractInstance,
  OptionsFactoryInstance
} from '../build/types/truffle-types';
import {ZERO_ADDRESS} from './utils/helper';

const OptionsContract = artifacts.require('OptionsContract');
const OptionsFactory = artifacts.require('OptionsFactory');
const MockOracle = artifacts.require('MockOracle');
const MockERC20 = artifacts.require('MockERC20');

const {
  time,
  BN,
  balance,
  expectEvent,
  expectRevert
} = require('@openzeppelin/test-helpers');

contract('OptionsContract', accounts => {
  const creatorAddress = accounts[0];
  const firstVaultOwnerAddress = accounts[1];
  const secondVaultOwnerAddress = accounts[2];

  const tokenHolder = accounts[3];

  const optionsContracts: OptionsContractInstance[] = [];
  let optionsFactory: OptionsFactoryInstance;
  let compoundOracle: MockOracleInstance;
  let dai: MockErc20Instance;
  let usdc: MockErc20Instance;

  const vault1Collateral = '20000000';
  const vault1PutsOutstanding = '250000';

  const vault2Collateral = '10000000';
  const vault2PutsOutstanding = '100000';

  before('set up contracts', async () => {
    // 1. Deploy mock contracts
    // 1.1 Compound Oracle
    compoundOracle = await MockOracle.deployed();
    // 1.2 Uniswap Factory

    // 1.3 Mock Dai contract
    dai = await MockERC20.new('DAI', 'DAI', 18);
    await dai.mint(creatorAddress, '10000000');
    await dai.mint(tokenHolder, '100000', {from: creatorAddress});
    // 1.4 Mock Dai contract
    usdc = await MockERC20.new('USDC', 'USDC', 6);
    await usdc.mint(creatorAddress, '10000000');

    // Deploy the Options Factory contract and add assets to it
    optionsFactory = await OptionsFactory.deployed();

    // const windowSize = expiry;
    const now = (await time.latest()).toNumber();
    const expiry = now + time.duration.days(30).toNumber();
    const windowSize = expiry;
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
      'Opyn DAI:USDC option',
      'oDAI',
      {from: creatorAddress}
    );

    const optionsContractAddr = optionsContractResult.logs[0].args[0];
    optionsContracts.push(await OptionsContract.at(optionsContractAddr));

    await optionsContracts[0].updateParameters(10, 500, 16, {
      from: creatorAddress
    });

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

    await optionsContracts[0].transfer(tokenHolder, '101010', {
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

    await optionsContracts[0].transfer(tokenHolder, '1000', {
      from: secondVaultOwnerAddress
    });
  });

  describe('Scenario: Add + remove collateral + liquidate + burn tokens', () => {
    it('anyone should be able to add ETH collateral to vault 2', async () => {
      let vaultState = await optionsContracts[0].getVault(
        secondVaultOwnerAddress
      );
      const initialCollateral = new BN(vaultState['0'].toString());

      await optionsContracts[0].addETHCollateral(secondVaultOwnerAddress, {
        from: creatorAddress,

        value: vault2Collateral
      });

      vaultState = await optionsContracts[0].getVault(secondVaultOwnerAddress);
      const finalCollateral = new BN(vaultState['0'].toString());

      expect(finalCollateral.toString()).to.equal(
        initialCollateral.add(new BN(vault2Collateral)).toString()
      );
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

    it('vault 2 should be safe after Compund Oracle drops price', async () => {
      const result = await optionsContracts[0].isUnsafe(
        secondVaultOwnerAddress
      );
      expect(result).to.be.false;
    });

    it('vault 1 should be safe after Compund Oracle increases price', async () => {
      const newETHToUSDPrice = 200;
      const newPrice = Math.floor((1 / newETHToUSDPrice) * 10 ** 18).toString();
      await compoundOracle.updatePrice(newPrice, {
        from: creatorAddress
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
          from: secondVaultOwnerAddress
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
          from: firstVaultOwnerAddress
        }),
        'Vault is unsafe'
      );
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
    });

    it('vault 1 should remain unsafe after Compund Oracle reices price', async () => {
      const newETHToUSDPrice = 150;
      const newPrice = Math.floor((1 / newETHToUSDPrice) * 10 ** 18).toString();
      await compoundOracle.updatePrice(newPrice, {
        from: creatorAddress
      });

      const result = await optionsContracts[0].isUnsafe(firstVaultOwnerAddress);

      expect(result).to.be.true;
    });

    it('vault 2 should be safe after Compund Oracle reices price', async () => {
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
    });

    it('vault 1 should remain unsafe after liquidation', async () => {
      const result = await optionsContracts[0].isUnsafe(firstVaultOwnerAddress);

      expect(result).to.be.true;
    });

    it('firstVaultOwner should be able to burn some put tokens to turn the vault safe', async () => {
      await optionsContracts[0].burnOTokens('100000', {
        from: firstVaultOwnerAddress
      });

      const result = await optionsContracts[0].isUnsafe(firstVaultOwnerAddress);

      expect(result).to.be.false;
    });
  });
});

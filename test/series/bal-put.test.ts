import {
  OptionsFactoryInstance,
  OTokenInstance,
  Erc20MintableInstance
} from '../../build/types/truffle-types';

import BigNumber from 'bignumber.js';
const {time, expectEvent} = require('@openzeppelin/test-helpers');

const OTokenContract = artifacts.require('oToken');
const OptionsFactory = artifacts.require('OptionsFactory');
const MintableToken = artifacts.require('ERC20Mintable');

import Reverter from '../utils/reverter';

contract('OptionsContract: BAL put', accounts => {
  const reverter = new Reverter(web3);

  const creatorAddress = accounts[0];
  const firstOwner = accounts[1];
  const tokenHolder = accounts[2];

  let optionsFactory: OptionsFactoryInstance;
  let oToken: OTokenInstance;
  let bal: Erc20MintableInstance;
  let usdc: Erc20MintableInstance;

  const _name = 'Opyn BAL Put $7 08/28/20';
  const _symbol = 'oBALp $7';
  const _tokenDecimals = 7;

  const balDigits = new BigNumber(10).exponentiatedBy(18);
  const usdcDigits = new BigNumber(10).exponentiatedBy(6);
  const oTokenDigits = new BigNumber(10).exponentiatedBy(7);

  before('set up contracts', async () => {
    const now = (await time.latest()).toNumber();
    const expiry = now + time.duration.days(30).toNumber();
    const windowSize = expiry; // time.duration.days(1).toNumber();

    // 1. Deploy mock contracts
    // 1.1 Compound Oracle
    // oracle = await MockOracle.deployed();
    // oracle = MockOracle.at()

    // 1.2 Mock BAL contract
    bal = await MintableToken.new();
    await bal.mint(creatorAddress, new BigNumber(1000).times(balDigits)); // 1000 bal
    await bal.mint(firstOwner, new BigNumber(1000).times(balDigits));
    await bal.mint(tokenHolder, new BigNumber(1000).times(balDigits));

    // 1.3 Mock USDT contract
    usdc = await MintableToken.new();
    await usdc.mint(creatorAddress, new BigNumber(7000).times(usdcDigits)); // 1000 USDC
    await usdc.mint(firstOwner, new BigNumber(7000).times(usdcDigits));

    // 2. Deploy the Options Factory contract and add assets to it
    optionsFactory = await OptionsFactory.deployed();

    await optionsFactory.updateAsset('BAL', bal.address);
    await optionsFactory.updateAsset('USDC', usdc.address);
    const optionsContractResult = await optionsFactory.createOptionsContract(
      'USDC',
      -6,
      'BAL',
      -18,
      -_tokenDecimals,
      7,
      -7,
      'USDC',
      expiry,
      windowSize,
      {from: creatorAddress}
    );

    const optionsContractAddr = optionsContractResult.logs[1].args[0];
    oToken = await OTokenContract.at(optionsContractAddr);

    await reverter.snapshot();
  });

  describe('New option parameter test', () => {
    it('should have basic setting', async () => {
      await oToken.setDetails(_name, _symbol, {
        from: creatorAddress
      });

      assert.equal(await oToken.name(), String(_name), 'set name error');
      assert.equal(await oToken.symbol(), String(_symbol), 'set symbol error');
    });

    it('should update parameters', async () => {
      await oToken.updateParameters(0, 500, 0, 10, {
        from: creatorAddress
      });
    });

    it('should open empty vault', async () => {
      await oToken.openVault({
        from: creatorAddress
      });
      const vault = await oToken.getVault(creatorAddress);
      assert.equal(vault[0].toString(), '0');
      assert.equal(vault[1].toString(), '0');
      assert.equal(vault[2].toString(), '0');
    });

    it('should add USDC collateral', async () => {
      // approve and add 7000 usdc to the vault
      const usdcAmount = new BigNumber(7000).times(usdcDigits).toString();

      await usdc.approve(oToken.address, usdcAmount, {
        from: creatorAddress
      });
      await oToken.addERC20Collateral(creatorAddress, usdcAmount, {
        from: creatorAddress
      });

      // test that the vault's balances have been updated.
      const vault = await oToken.getVault(creatorAddress);
      assert.equal(vault[0].toString(), usdcAmount);
      assert.equal(vault[1].toString(), '0');
      assert.equal(vault[2].toString(), '0');
    });

    it('should add USDC collateral and Mint', async () => {
      // mint 1000 bal put
      const amountToIssue = new BigNumber(1000).times(oTokenDigits).toString();
      const amountCollateral = new BigNumber(7000).times(usdcDigits).toString();
      await usdc.approve(oToken.address, amountCollateral, {
        from: firstOwner
      });
      await oToken.createERC20CollateralOption(
        amountToIssue,
        amountCollateral,
        tokenHolder,
        {
          from: firstOwner
        }
      );

      // test that the vault's balances have been updated.
      const vault = await oToken.getVault(firstOwner);
      assert.equal(vault[0].toString(), amountCollateral);
      assert.equal(vault[1].toString(), amountToIssue);
      assert.equal(vault[2].toString(), '0');
    });

    it('should be able to exercise', async () => {
      // exercise 500 puts
      const amountToExercise = new BigNumber(500)
        .times(oTokenDigits)
        .toString();
      const amountPayout = new BigNumber(3500).times(usdcDigits).toString();
      const underlyingRequired = (
        await oToken.underlyingRequiredToExercise(amountToExercise)
      ).toString();

      assert.equal(
        underlyingRequired,
        new BigNumber(500).times(balDigits).toString()
      );

      await bal.approve(oToken.address, underlyingRequired, {
        from: tokenHolder
      });

      const exerciseTx = await oToken.exercise(amountToExercise, [firstOwner], {
        from: tokenHolder
      });

      expectEvent(exerciseTx, 'Exercise', {
        amtUnderlyingToPay: underlyingRequired,
        amtCollateralToPay: amountPayout
      });

      // test that the vault's balances have been updated.
      const vault = await oToken.getVault(firstOwner);
      // check remaining collateral
      assert.equal(
        vault[0].toString(),
        new BigNumber(7000 - 3500).times(usdcDigits).toString()
      );
      // check remaining oTokenIssued
      assert.equal(
        vault[1].toString(),
        new BigNumber(1000 - 500).times(oTokenDigits).toString()
      );
      // check underlying In the vault
      assert.equal(vault[2].toString(), underlyingRequired);
    });
  });
});

import {
  OptionsFactoryInstance,
  OTokenInstance,
  MockErc20Instance
} from '../../build/types/truffle-types';

import BigNumber from 'bignumber.js';
const {time, expectEvent} = require('@openzeppelin/test-helpers');

const OTokenContract = artifacts.require('oToken');
const OptionsFactory = artifacts.require('OptionsFactory');
const MockERC20 = artifacts.require('MockERC20');

import Reverter from '../utils/reverter';

contract('OptionsContract: UNI put', accounts => {
  const reverter = new Reverter(web3);

  const creatorAddress = accounts[0];
  const firstOwner = accounts[1];
  const tokenHolder = accounts[2];

  let optionsFactory: OptionsFactoryInstance;
  let oToken: OTokenInstance;
  let uni: MockErc20Instance;
  let usdc: MockErc20Instance;

  const _name = 'Opyn UNI Put $2.5 08/28/20';
  const _symbol = 'oUNIp $2.5';
  const _tokenDecimals = 5;

  const uniDigits = new BigNumber(10).exponentiatedBy(18);
  const usdcDigits = new BigNumber(10).exponentiatedBy(6);
  const oTokenDigits = new BigNumber(10).exponentiatedBy(_tokenDecimals);

  let firstOwnerCollateralBalance = new BigNumber(0);

  before('set up contracts', async () => {
    const now = (await time.latest()).toNumber();
    const expiry = now + time.duration.days(30).toNumber();
    const windowSize = expiry; // time.duration.days(1).toNumber();

    // 1. Deploy mock contracts
    // 1.1 Compound Oracle
    // oracle = await MockOracle.deployed();
    // oracle = MockOracle.at()

    // 1.2 Mock UNI contract
    uni = await MockERC20.new('uni', 'uni', 18);
    await uni.mint(creatorAddress, new BigNumber(1000).times(uniDigits)); // 1000 uni
    await uni.mint(firstOwner, new BigNumber(1000).times(uniDigits));
    await uni.mint(tokenHolder, new BigNumber(1000).times(uniDigits));

    // 1.3 Mock USDT contract
    usdc = await MockERC20.new('USDC', 'USDC', 6);
    await usdc.mint(creatorAddress, new BigNumber(2500).times(usdcDigits)); // 1000 USDC
    await usdc.mint(firstOwner, new BigNumber(2500).times(usdcDigits));

    // 2. Deploy the Options Factory contract and add assets to it
    optionsFactory = await OptionsFactory.deployed();

    await optionsFactory.whitelistAsset(uni.address);
    await optionsFactory.whitelistAsset(usdc.address);

    const optionsContractResult = await optionsFactory.createOptionsContract(
      usdc.address,
      uni.address,
      usdc.address,
      -_tokenDecimals,
      25,
      -6,
      expiry,
      windowSize,
      _name,
      _symbol,
      {from: creatorAddress}
    );

    const optionsContractAddr = optionsContractResult.logs[1].args[0];
    oToken = await OTokenContract.at(optionsContractAddr);

    await reverter.snapshot();
  });

  describe('New option parameter test', () => {
    it('should have basic setting', async () => {
      assert.equal(await oToken.name(), String(_name), 'set name error');
      assert.equal(await oToken.symbol(), String(_symbol), 'set symbol error');
    });

    it('should update parameters', async () => {
      await oToken.updateParameters(0, 500, 10, {
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
      // approve and add 2500 usdc to the vault
      const usdcAmount = new BigNumber(2500).times(usdcDigits).toString();

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
      // mint 1000 uni put
      const amountToIssue = new BigNumber(1000).times(oTokenDigits).toString();
      const amountCollateral = new BigNumber(2500).times(usdcDigits).toString();
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

      firstOwnerCollateralBalance = firstOwnerCollateralBalance.plus(
        amountCollateral
      );
    });

    it('should be able to exercise', async () => {
      // exercise 500 puts
      const amountToExercise = new BigNumber(500)
        .times(oTokenDigits)
        .toString();
      const amountPayout = new BigNumber(1250).times(usdcDigits).toString();
      const underlyingRequired = (
        await oToken.underlyingRequiredToExercise(amountToExercise)
      ).toString();

      assert.equal(
        underlyingRequired,
        new BigNumber(500).times(uniDigits).toString()
      );

      await uni.approve(oToken.address, underlyingRequired, {
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
        firstOwnerCollateralBalance.minus(amountPayout).toString()
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

  it('exponents should not overflow', async () => {
    const strikePrice = await oToken.strikePrice();
    const strikeExponent = strikePrice[1];
    const colalteralExponent = await oToken.collateralExp();
    const collateralToPayExponent = Math.max(
      Math.abs(strikeExponent - colalteralExponent),
      Math.abs(strikeExponent - colalteralExponent - 3)
    );

    assert(collateralToPayExponent <= 9, 'overflow possibility');

    const oTokenExchangeExponent = await oToken.oTokenExchangeRate();
    const underlingExponent = await oToken.underlyingExp();

    assert(
      Math.abs(oTokenExchangeExponent[1] - underlingExponent) <= 19,
      'overflow possiblitiy'
    );
  });
});

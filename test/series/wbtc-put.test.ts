import {
  OptionsFactoryInstance,
  OTokenInstance,
  Erc20MintableInstance
} from '../../build/types/truffle-types';

import BigNumber from 'bignumber.js';
const {time, expectRevert, expectEvent} = require('@openzeppelin/test-helpers');

const OTokenContract = artifacts.require('oToken');
const OptionsFactory = artifacts.require('OptionsFactory');
const MockERC20 = artifacts.require('MockERC20');

import Reverter from '../utils/reverter';

contract('OptionsContract: WBTC put', accounts => {
  const reverter = new Reverter(web3);

  const creatorAddress = accounts[0];
  const firstOwner = accounts[1];
  const tokenHolder = accounts[2];

  let optionsFactory: OptionsFactoryInstance;
  let oWbtc: OTokenInstance;
  // let oracle: MockwbtcoundOracleInstance;
  let wbtc: Erc20MintableInstance;
  let usdc: Erc20MintableInstance;

  const usdcAmount = '1050000000'; // 1000 USDC
  const wbtcAmount = '2000000000000000000000'; // 1000 wbtc

  const _name = 'WBTC put 10500';
  const _symbol = 'oWbtc 10500';

  before('set up contracts', async () => {
    const now = (await time.latest()).toNumber();
    const expiry = now + time.duration.days(30).toNumber();
    const windowSize = expiry; // time.duration.days(1).toNumber();

    // 1. Deploy mock contracts
    // 1.2 Mock wbtc contract
    wbtc = await MockERC20.new('WBTC', 'WBTC', 8);
    await wbtc.mint(creatorAddress, wbtcAmount); // 1000 wbtc
    await wbtc.mint(tokenHolder, wbtcAmount);

    // 1.3 Mock USDC contract
    usdc = await MockERC20.new('USDC', 'USDC', 6);
    await usdc.mint(creatorAddress, usdcAmount);
    await usdc.mint(firstOwner, usdcAmount);

    // 2. Deploy the Options Factory contract and add assets to it
    optionsFactory = await OptionsFactory.deployed();

    await optionsFactory.whitelistAsset(wbtc.address);
    await optionsFactory.whitelistAsset(usdc.address);

    // Create the unexpired options contract
    const optionsContractResult = await optionsFactory.createOptionsContract(
      usdc.address,
      wbtc.address,
      usdc.address,
      -7,
      105,
      -5,
      expiry,
      windowSize,
      _name,
      _symbol,
      {from: creatorAddress}
    );

    const optionsContractAddr = optionsContractResult.logs[1].args[0];
    oWbtc = await OTokenContract.at(optionsContractAddr);

    await reverter.snapshot();
  });

  describe('New option parameter test', () => {
    it('should have basic setting', async () => {
      assert.equal(await oWbtc.name(), String(_name), 'set name error');
      assert.equal(await oWbtc.symbol(), String(_symbol), 'set symbol error');
    });

    it('should open empty vault', async () => {
      await oWbtc.openVault({
        from: creatorAddress
      });
      const vault = await oWbtc.getVault(creatorAddress);
      assert.equal(vault[0].toString(), '0');
      assert.equal(vault[1].toString(), '0');
      assert.equal(vault[2].toString(), '0');
    });

    it('should add USDC collateral successfully', async () => {
      await usdc.approve(oWbtc.address, usdcAmount, {from: creatorAddress});
      await oWbtc.addERC20Collateral(creatorAddress, usdcAmount, {
        from: creatorAddress
      });

      // test that the vault's balances have been updated.
      const vault = await oWbtc.getVault(creatorAddress);
      assert.equal(vault[0].toString(), usdcAmount);
      assert.equal(vault[1].toString(), '0');
      assert.equal(vault[2].toString(), '0');
    });

    it('should add USDC collateral and Mint', async () => {
      const amountToIssue = new BigNumber('1000000'); // 1000 usdc can issue 1000000 put.

      await usdc.approve(oWbtc.address, usdcAmount, {from: firstOwner});

      await expectRevert(
        oWbtc.createERC20CollateralOption(
          amountToIssue.plus(1).toString(),
          usdcAmount,
          firstOwner,
          {
            from: firstOwner
          }
        ),
        'unsafe to mint'
      );

      await oWbtc.createERC20CollateralOption(
        amountToIssue.toString(),
        usdcAmount,
        firstOwner,
        {
          from: firstOwner
        }
      );

      // test that the vault's balances have been updated.
      const vault = await oWbtc.getVault(firstOwner);
      assert.equal(vault[0].toString(), usdcAmount);
      assert.equal(vault[1].toString(), amountToIssue.toString());
      assert.equal(vault[2].toString(), '0');
    });

    it('should not exercise without underlying allowance', async () => {
      await oWbtc.transfer(tokenHolder, '1000000', {from: firstOwner}); // transfer 80 oWbtc

      await expectRevert(
        oWbtc.exercise('1000000', [firstOwner], {
          from: tokenHolder
        }),
        'transfer amount exceeds allowance.'
      );
    });

    it('should be able to exercise', async () => {
      const amountToExercise = '1000000';
      const underlyingRequired = (
        await oWbtc.underlyingRequiredToExercise(amountToExercise)
      ).toString();

      await wbtc.approve(oWbtc.address, underlyingRequired, {
        from: tokenHolder
      });

      const exerciseTx = await oWbtc.exercise(amountToExercise, [firstOwner], {
        from: tokenHolder
      });

      expectEvent(exerciseTx, 'Exercise', {
        amtUnderlyingToPay: underlyingRequired,
        amtCollateralToPay: '1050000000'
      });

      // test that the vault's balances have been updated.
      const vault = await oWbtc.getVault(firstOwner);
      assert.equal(vault[0].toString(), '0');
      assert.equal(vault[1].toString(), '0');
      assert.equal(vault[2].toString(), underlyingRequired);
    });

    it('exponents should not overflow', async () => {
      const strikePrice = await oWbtc.strikePrice();
      const strikeExponent = strikePrice[1];
      const colalteralExponent = await oWbtc.collateralExp();
      const collateralToPayExponent = Math.max(
        Math.abs(strikeExponent - colalteralExponent),
        Math.abs(strikeExponent - colalteralExponent - 3)
      );

      assert(collateralToPayExponent <= 9, 'overflow possibility');

      const oTokenExchangeExponent = await oWbtc.oTokenExchangeRate();
      const underlingExponent = await oWbtc.underlyingExp();

      assert(
        Math.abs(oTokenExchangeExponent[1] - underlingExponent) <= 19,
        'overflow possiblitiy'
      );
    });
  });
});

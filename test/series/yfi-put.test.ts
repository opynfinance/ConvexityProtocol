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

contract('OptionsContract: YFI put', accounts => {
  const reverter = new Reverter(web3);

  const creatorAddress = accounts[0];
  const firstOwner = accounts[1];
  const tokenHolder = accounts[2];

  let optionsFactory: OptionsFactoryInstance;
  let oYfi: OTokenInstance;
  // let oracle: MockyfioundOracleInstance;
  let yfi: Erc20MintableInstance;
  let usdc: Erc20MintableInstance;

  const usdcAmount = '1000000000'; // 1000 USDC
  const yfiAmount = '2000000000000000000000'; // 1000 yfi

  const _name = 'YFI put 250';
  const _symbol = 'oYfi 250';

  before('set up contracts', async () => {
    const now = (await time.latest()).toNumber();
    const expiry = now + time.duration.days(30).toNumber();
    const windowSize = expiry; // time.duration.days(1).toNumber();

    // 1. Deploy mock contracts
    // 1.2 Mock yfi contract
    yfi = await MockERC20.new('YFI', 'YFI', 18);
    await yfi.mint(creatorAddress, yfiAmount); // 1000 yfi
    await yfi.mint(tokenHolder, yfiAmount);

    // 1.3 Mock USDC contract
    usdc = await MockERC20.new('USDC', 'USDC', 6);
    await usdc.mint(creatorAddress, usdcAmount);
    await usdc.mint(firstOwner, usdcAmount);

    // 2. Deploy the Options Factory contract and add assets to it
    optionsFactory = await OptionsFactory.deployed();

    await optionsFactory.whitelistAsset(yfi.address);
    await optionsFactory.whitelistAsset(usdc.address);

    // Create the unexpired options contract
    const optionsContractResult = await optionsFactory.createOptionsContract(
      usdc.address,
      yfi.address,
      usdc.address,
      -7,
      20,
      -4,
      expiry,
      windowSize,
      _name,
      _symbol,
      {from: creatorAddress}
    );

    const optionsContractAddr = optionsContractResult.logs[1].args[0];
    oYfi = await OTokenContract.at(optionsContractAddr);

    await reverter.snapshot();
  });

  describe('New option parameter test', () => {
    it('should have basic setting', async () => {
      assert.equal(await oYfi.name(), String(_name), 'set name error');
      assert.equal(await oYfi.symbol(), String(_symbol), 'set symbol error');
    });

    it('should open empty vault', async () => {
      await oYfi.openVault({
        from: creatorAddress
      });
      const vault = await oYfi.getVault(creatorAddress);
      assert.equal(vault[0].toString(), '0');
      assert.equal(vault[1].toString(), '0');
      assert.equal(vault[2].toString(), '0');
    });

    it('should add USDC collateral successfully', async () => {
      await usdc.approve(oYfi.address, usdcAmount, {from: creatorAddress});
      await oYfi.addERC20Collateral(creatorAddress, usdcAmount, {
        from: creatorAddress
      });

      // test that the vault's balances have been updated.
      const vault = await oYfi.getVault(creatorAddress);
      assert.equal(vault[0].toString(), usdcAmount);
      assert.equal(vault[1].toString(), '0');
      assert.equal(vault[2].toString(), '0');
    });

    it('should add USDC collateral and Mint', async () => {
      const amountToIssue = new BigNumber('500000'); // 1000 usdc can issue 5000000 put.

      await usdc.approve(oYfi.address, usdcAmount, {from: firstOwner});

      await expectRevert(
        oYfi.createERC20CollateralOption(
          amountToIssue.plus(1).toString(),
          usdcAmount,
          firstOwner,
          {
            from: firstOwner
          }
        ),
        'unsafe to mint'
      );

      await oYfi.createERC20CollateralOption(
        amountToIssue.toString(),
        usdcAmount,
        firstOwner,
        {
          from: firstOwner
        }
      );

      // test that the vault's balances have been updated.
      const vault = await oYfi.getVault(firstOwner);
      assert.equal(vault[0].toString(), usdcAmount);
      assert.equal(vault[1].toString(), amountToIssue.toString());
      assert.equal(vault[2].toString(), '0');
    });

    it('should not exercise without underlying allowance', async () => {
      await oYfi.transfer(tokenHolder, '500000', {from: firstOwner}); // transfer 80 oYfi

      await expectRevert(
        oYfi.exercise('500000', [firstOwner], {
          from: tokenHolder
        }),
        'transfer amount exceeds allowance.'
      );
    });

    it('should be able to exercise', async () => {
      const amountToExercise = '500000';
      const underlyingRequired = (
        await oYfi.underlyingRequiredToExercise(amountToExercise)
      ).toString();

      await yfi.approve(oYfi.address, underlyingRequired, {
        from: tokenHolder
      });

      const exerciseTx = await oYfi.exercise(amountToExercise, [firstOwner], {
        from: tokenHolder
      });

      expectEvent(exerciseTx, 'Exercise', {
        amtUnderlyingToPay: underlyingRequired,
        amtCollateralToPay: '1000000000'
      });

      // test that the vault's balances have been updated.
      const vault = await oYfi.getVault(firstOwner);
      assert.equal(vault[0].toString(), '0');
      assert.equal(vault[1].toString(), '0');
      assert.equal(vault[2].toString(), underlyingRequired);
    });

    it('exponents should not overflow', async () => {
      const strikePrice = await oYfi.strikePrice();
      const strikeExponent = strikePrice[1];
      const colalteralExponent = await oYfi.collateralExp();
      const collateralToPayExponent = Math.max(
        Math.abs(strikeExponent - colalteralExponent),
        Math.abs(strikeExponent - colalteralExponent - 3)
      );

      assert(collateralToPayExponent <= 9, 'overflow possibility');

      const oTokenExchangeExponent = await oYfi.oTokenExchangeRate();
      const underlingExponent = await oYfi.underlyingExp();

      assert(
        Math.abs(oTokenExchangeExponent[1] - underlingExponent) <= 19,
        'overflow possiblitiy'
      );
    });
  });
});

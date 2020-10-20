import {
  OptionsFactoryInstance,
  OTokenInstance,
  MockErc20Instance
} from '../../build/types/truffle-types';

import BigNumber from 'bignumber.js';
const {time, expectRevert, expectEvent} = require('@openzeppelin/test-helpers');

const OTokenContract = artifacts.require('oToken');
const OptionsFactory = artifacts.require('OptionsFactory');
const MockERC20 = artifacts.require('MockERC20');

import Reverter from '../utils/reverter';

contract('OptionsContract: DPI put', accounts => {
  const reverter = new Reverter(web3);

  const creatorAddress = accounts[0];
  const firstOwner = accounts[1];
  const tokenHolder = accounts[2];

  let optionsFactory: OptionsFactoryInstance;
  let oDPI: OTokenInstance;
  // let oracle: MockOracleInstance;
  let DPI: MockErc20Instance;
  let usdc: MockErc20Instance;

  const usdcAmount = '7500000000'; // 7500 USDC
  const DPIAmount = '1000000000000000000000'; // 1000 DPI

  const _name = 'DPI put 75';
  const _symbol = 'oDPI 75';

  before('set up contracts', async () => {
    const now = (await time.latest()).toNumber();
    const expiry = now + time.duration.days(30).toNumber();
    const windowSize = expiry; // time.duration.days(1).toNumber();

    // 1. Deploy mock contracts
    // 1.2 Mock DPI contract
    DPI = await MockERC20.new('DPI', 'DPI', 18);
    await DPI.mint(creatorAddress, DPIAmount); // 1000 DPI
    await DPI.mint(tokenHolder, DPIAmount);

    // 1.3 Mock USDC contract
    usdc = await MockERC20.new('USDC', 'USDC', 6);
    await usdc.mint(creatorAddress, usdcAmount);
    await usdc.mint(firstOwner, usdcAmount);

    // 2. Deploy the Options Factory contract and add assets to it
    optionsFactory = await OptionsFactory.deployed();

    await optionsFactory.whitelistAsset(DPI.address);
    await optionsFactory.whitelistAsset(usdc.address);

    // Create the unexpired options contract
    const optionsContractResult = await optionsFactory.createOptionsContract(
      usdc.address,
      DPI.address,
      usdc.address,
      -6,
      75,
      -6,
      expiry,
      windowSize,
      _name,
      _symbol,
      {from: creatorAddress}
    );

    const optionsContractAddr = optionsContractResult.logs[1].args[0];
    oDPI = await OTokenContract.at(optionsContractAddr);

    await reverter.snapshot();
  });

  describe('New option parameter test', () => {
    it('should have basic setting', async () => {
      assert.equal(await oDPI.name(), String(_name), 'set name error');
      assert.equal(await oDPI.symbol(), String(_symbol), 'set symbol error');
    });

    it('should update parameters', async () => {
      await oDPI.updateParameters('100', '500', 10, {from: creatorAddress});
    });

    it('should open empty vault', async () => {
      await oDPI.openVault({
        from: creatorAddress
      });
      const vault = await oDPI.getVault(creatorAddress);
      assert.equal(vault[0].toString(), '0');
      assert.equal(vault[1].toString(), '0');
      assert.equal(vault[2].toString(), '0');
    });

    it('should add USDC collateral successfully', async () => {
      await usdc.approve(oDPI.address, usdcAmount, {from: creatorAddress});
      await oDPI.addERC20Collateral(creatorAddress, usdcAmount, {
        from: creatorAddress
      });

      // test that the vault's balances have been updated.
      const vault = await oDPI.getVault(creatorAddress);
      assert.equal(vault[0].toString(), usdcAmount);
      assert.equal(vault[1].toString(), '0');
      assert.equal(vault[2].toString(), '0');
    });

    it('should add USDC collateral and Mint', async () => {
      const amountToIssue = new BigNumber('100000000'); // 7500 usdc can issue 100 puts.

      await usdc.approve(oDPI.address, usdcAmount, {from: firstOwner});

      await expectRevert(
        oDPI.createERC20CollateralOption(
          amountToIssue.plus(1).toString(),
          usdcAmount,
          firstOwner,
          {
            from: firstOwner
          }
        ),
        'unsafe to mint'
      );

      await oDPI.createERC20CollateralOption(
        amountToIssue.toString(),
        usdcAmount,
        firstOwner,
        {
          from: firstOwner
        }
      );

      // test that the vault's balances have been updated.
      const vault = await oDPI.getVault(firstOwner);
      assert.equal(vault[0].toString(), usdcAmount);
      assert.equal(vault[1].toString(), amountToIssue.toString());
      assert.equal(vault[2].toString(), '0');
    });

    it('should not exercise without underlying allowance', async () => {
      await oDPI.transfer(tokenHolder, '100000000', {from: firstOwner}); // transfer 100 oDPI

      await expectRevert(
        oDPI.exercise('100000000', [firstOwner], {
          from: tokenHolder
        }),
        'transfer amount exceeds allowance.'
      );
    });

    it('should be able to exercise', async () => {
      const amountToExercise = '100000000';
      const underlyingRequired = (
        await oDPI.underlyingRequiredToExercise(amountToExercise)
      ).toString();

      await DPI.approve(oDPI.address, underlyingRequired, {
        from: tokenHolder
      });

      const exerciseTx = await oDPI.exercise(amountToExercise, [firstOwner], {
        from: tokenHolder
      });

      expectEvent(exerciseTx, 'Exercise', {
        amtUnderlyingToPay: underlyingRequired,
        amtCollateralToPay: '7500000000'
      });

      // test that the vault's balances have been updated.
      const vault = await oDPI.getVault(firstOwner);
      assert.equal(vault[0].toString(), '0');
      assert.equal(vault[1].toString(), '0');
      assert.equal(vault[2].toString(), underlyingRequired);
    });
  });
});

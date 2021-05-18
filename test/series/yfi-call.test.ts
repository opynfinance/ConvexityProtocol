import {
  OptionsFactoryInstance,
  OTokenInstance,
  Erc20MintableInstance
} from '../../build/types/truffle-types';

import BigNumber from 'bignumber.js';
const {time, expectRevert} = require('@openzeppelin/test-helpers');

const OTokenContract = artifacts.require('oToken');
const OptionsFactory = artifacts.require('OptionsFactory');
const MockERC20 = artifacts.require('MockERC20');

import Reverter from '../utils/reverter';

contract('OptionsContract: YFI call', accounts => {
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
  const yfiAmount = '10000000000000000000000'; // 10,000 yfi

  const _name = 'YFI call $0.50';
  const _symbol = 'oYfi $0.50';

  before('set up contracts', async () => {
    const now = (await time.latest()).toNumber();
    const expiry = now + time.duration.days(30).toNumber();
    const windowSize = expiry; // time.duration.days(1).toNumber();

    // 1. Deploy mock contracts
    // 1.2 Mock yfi contract
    yfi = await MockERC20.new('YFI', 'YFI', 18);
    await yfi.mint(creatorAddress, yfiAmount); // 10000 yfi
    await yfi.mint(firstOwner, yfiAmount);

    // 1.3 Mock USDC contract
    usdc = await MockERC20.new('USDC', 'USDC', 6);
    await usdc.mint(creatorAddress, usdcAmount);
    await usdc.mint(tokenHolder, usdcAmount);

    // 2. Deploy the Options Factory contract and add assets to it
    optionsFactory = await OptionsFactory.deployed();

    await optionsFactory.whitelistAsset(yfi.address);
    await optionsFactory.whitelistAsset(usdc.address);

    // Create the unexpired options contract
    const optionsContractResult = await optionsFactory.createOptionsContract(
      yfi.address,
      usdc.address,
      yfi.address,
      -6,
      2,
      -6,
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

    it('should add YFI collateral successfully', async () => {
      await yfi.approve(oYfi.address, yfiAmount, {from: creatorAddress});
      await oYfi.addERC20Collateral(creatorAddress, yfiAmount, {
        from: creatorAddress
      });

      // test that the vault's balances have been updated.
      const vault = await oYfi.getVault(creatorAddress);
      assert.equal(vault[0].toString(), yfiAmount);
      assert.equal(vault[1].toString(), '0');
      assert.equal(vault[2].toString(), '0');
    });

    it('should add YFI collateral and Mint', async () => {
      const amountToIssue = new BigNumber('2');

      await yfi.approve(oYfi.address, yfiAmount, {from: firstOwner});

      await oYfi.createERC20CollateralOption(
        amountToIssue.toString(),
        yfiAmount,
        firstOwner,
        {
          from: firstOwner
        }
      );

      // test that the vault's balances have been updated.
      const vault = await oYfi.getVault(firstOwner);
      assert.equal(vault[0].toString(), yfiAmount);
      assert.equal(vault[1].toString(), amountToIssue.toString());
      assert.equal(vault[2].toString(), '0');
    });

    it('should not exercise without underlying allowance', async () => {
      await oYfi.transfer(tokenHolder, '2', {from: firstOwner});

      await expectRevert(
        oYfi.exercise('100', [firstOwner], {
          from: tokenHolder
        }),
        'transfer amount exceeds allowance.'
      );
    });

    it('should be able to exercise', async () => {
      const amountToExercise = '2';
      const underlyingRequired = (
        await oYfi.underlyingRequiredToExercise(amountToExercise)
      ).toString();

      await usdc.approve(oYfi.address, underlyingRequired, {
        from: tokenHolder
      });

      await oYfi.exercise(amountToExercise, [firstOwner], {
        from: tokenHolder
      });

      // test that the vault's balances have been updated.
      const vault = await oYfi.getVault(firstOwner);
      assert.equal(vault[0].toString(), '9999999996000000000000');
      assert.equal(vault[1].toString(), '0');
      assert.equal(vault[2].toString(), underlyingRequired);
    });
  });
});

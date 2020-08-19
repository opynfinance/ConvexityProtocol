import {
  OptionsFactoryInstance,
  OTokenInstance,
  Erc20MintableInstance,
  ExerciserInstance,
  Weth9Instance
} from '../../build/types/truffle-types';

import BigNumber from 'bignumber.js';
const {time, expectRevert, expectEvent} = require('@openzeppelin/test-helpers');

const OTokenContract = artifacts.require('oToken');
const OptionsFactory = artifacts.require('OptionsFactory');
const MockERC20 = artifacts.require('MockERC20');

const Exerciser = artifacts.require('Exerciser');
const WETH = artifacts.require('WETH9');

contract('OptionsContract: weth put', accounts => {
  const creatorAddress = accounts[0];
  const firstOwner = accounts[1];
  const tokenHolder = accounts[2];

  let optionsFactory: OptionsFactoryInstance;
  let oWeth: OTokenInstance;
  // let oracle: MockwethoundOracleInstance;

  let exerciser: ExerciserInstance;

  let weth: Weth9Instance;
  let usdc: Erc20MintableInstance;

  const usdcAmount = '1000000000'; // 10000 USDC

  const _name = 'TH put 250';
  const _symbol = 'oEth 250';

  before('set up contracts', async () => {
    const now = (await time.latest()).toNumber();
    const expiry = now + time.duration.days(30).toNumber();
    const windowSize = expiry; // time.duration.days(1).toNumber();

    // 1. Deploy mock contracts
    // 1.2 Mock weth contract
    weth = await WETH.new();
    exerciser = await Exerciser.new(weth.address);

    // 1.3 Mock USDC contract
    usdc = await MockERC20.new('USDC', 'USDC', 6);
    await usdc.mint(creatorAddress, usdcAmount);
    await usdc.mint(firstOwner, usdcAmount);

    // 2. Deploy the Options Factory contract and add assets to it
    optionsFactory = await OptionsFactory.deployed();

    await optionsFactory.whitelistAsset(weth.address);
    await optionsFactory.whitelistAsset(usdc.address);

    // Create the unexpired options contract
    const optionsContractResult = await optionsFactory.createOptionsContract(
      usdc.address,
      weth.address,
      usdc.address,
      -6,
      25,
      -5,
      expiry,
      windowSize,
      _name,
      _symbol,
      {from: creatorAddress}
    );

    const optionsContractAddr = optionsContractResult.logs[1].args[0];
    oWeth = await OTokenContract.at(optionsContractAddr);
  });

  describe('New option parameter test', () => {
    it('should have basic setting', async () => {
      assert.equal(await oWeth.name(), String(_name), 'set name error');
      assert.equal(await oWeth.symbol(), String(_symbol), 'set symbol error');
    });

    it('should open empty vault', async () => {
      await oWeth.openVault({
        from: creatorAddress
      });
      const vault = await oWeth.getVault(creatorAddress);
      assert.equal(vault[0].toString(), '0');
      assert.equal(vault[1].toString(), '0');
      assert.equal(vault[2].toString(), '0');
    });

    it('should add USDC collateral successfully', async () => {
      await usdc.approve(oWeth.address, usdcAmount, {from: creatorAddress});
      await oWeth.addERC20Collateral(creatorAddress, usdcAmount, {
        from: creatorAddress
      });

      // test that the vault's balances have been updated.
      const vault = await oWeth.getVault(creatorAddress);
      assert.equal(vault[0].toString(), usdcAmount);
      assert.equal(vault[1].toString(), '0');
      assert.equal(vault[2].toString(), '0');
    });

    it('should add USDC collateral and Mint', async () => {
      const amountToIssue = new BigNumber('4000000'); // 1000 usdc can issue 4 250 put.

      await usdc.approve(oWeth.address, usdcAmount, {from: firstOwner});

      await expectRevert(
        oWeth.createERC20CollateralOption(
          amountToIssue.plus(1).toString(),
          usdcAmount,
          firstOwner,
          {
            from: firstOwner
          }
        ),
        'unsafe to mint'
      );

      await oWeth.createERC20CollateralOption(
        amountToIssue.toString(),
        usdcAmount,
        firstOwner,
        {
          from: firstOwner
        }
      );

      // test that the vault's balances have been updated.
      const vault = await oWeth.getVault(firstOwner);
      assert.equal(vault[0].toString(), usdcAmount);
      assert.equal(vault[1].toString(), amountToIssue.toString());
      assert.equal(vault[2].toString(), '0');
    });

    it('should be able to exercise from wrapper exerciser ', async () => {
      const amountToExercise = '4000000';
      await oWeth.transfer(tokenHolder, amountToExercise, {from: firstOwner});
      // weth
      const underlyingRequired = (
        await oWeth.underlyingRequiredToExercise(amountToExercise)
      ).toString();

      // approve exerciser to spend otoken
      await oWeth.approve(exerciser.address, amountToExercise, {
        from: tokenHolder
      });

      const usdcBefore = (await usdc.balanceOf(oWeth.address)).toString();
      const wethBefore = (await weth.balanceOf(oWeth.address)).toString();

      const exerciseTx = await exerciser.exercise(
        oWeth.address,
        amountToExercise,
        [firstOwner],
        {
          value: underlyingRequired,
          from: tokenHolder
        }
      );

      expectEvent(exerciseTx, 'WrapperExercise', {
        otoken: oWeth.address,
        otokenAmount: amountToExercise,
        collateralExercised: '1000000000',
        user: tokenHolder
      });

      // test that the vault's balances have been updated.
      const vault = await oWeth.getVault(firstOwner);
      assert.equal(vault[0].toString(), '0');
      assert.equal(vault[1].toString(), '0');
      assert.equal(vault[2].toString(), underlyingRequired);

      const usdcAfter = (await usdc.balanceOf(oWeth.address)).toString();
      const wethAfter = (await weth.balanceOf(oWeth.address)).toString();

      assert.equal(
        new BigNumber(usdcBefore).minus(new BigNumber('1000000000')).toString(),
        new BigNumber(usdcAfter).toString()
      );

      assert.equal(
        new BigNumber(wethBefore)
          .plus(new BigNumber(underlyingRequired))
          .toString(),
        new BigNumber(wethAfter).toString()
      );
    });
  });
});

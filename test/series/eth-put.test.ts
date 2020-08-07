import {
  OptionsFactoryInstance,
  oTokenInstance,
  ERC20MintableInstance
} from '../../build/types/truffle-types';

import BigNumber from 'bignumber.js';
const {time, expectRevert, expectEvent} = require('@openzeppelin/test-helpers');

const OTokenContract = artifacts.require('oToken');
const OptionsFactory = artifacts.require('OptionsFactory');
const MintableToken = artifacts.require('ERC20Mintable');
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
import Reverter from '../utils/reverter';

contract('OptionsContract: ETH put', accounts => {
  const reverter = new Reverter(web3);

  const creatorAddress = accounts[0];
  const firstOwner = accounts[1];
  const tokenHolder = accounts[2];

  let optionsFactory: OptionsFactoryInstance;
  let oETH: oTokenInstance;
  // let oracle: MockCompoundOracleInstance;
  // let comp: ERC20MintableInstance;
  let usdc: ERC20MintableInstance;

  const usdcAmount = '1000000000'; // 1000 USDC

  const _name = 'ETH put 250';
  const _symbol = 'oETHp 250';

  before('set up contracts', async () => {
    const now = (await time.latest()).toNumber();
    const expiry = now + time.duration.days(30).toNumber();
    const windowSize = expiry; // time.duration.days(1).toNumber();

    // 1. Deploy mock contracts
    // 1.2 Mock Comp contract

    // 1.3 Mock USDC contract
    usdc = await MintableToken.new();
    await usdc.mint(creatorAddress, usdcAmount);
    await usdc.mint(firstOwner, usdcAmount);

    // 2. Deploy the Options Factory contract and add assets to it
    optionsFactory = await OptionsFactory.deployed();

    await optionsFactory.addAsset('USDC', usdc.address);

    // Create the unexpired options contract
    const optionsContractResult = await optionsFactory.createOptionsContract(
      'USDC',
      -6,
      'ETH',
      -18,
      -6,
      25,
      -5,
      'USDC',
      expiry,
      windowSize,
      {from: creatorAddress}
    );

    const optionsContractAddr = optionsContractResult.logs[1].args[0];
    oETH = await OTokenContract.at(optionsContractAddr);

    await reverter.snapshot();
  });

  describe('New option parameter test', () => {
    it('should have basic setting', async () => {
      await oETH.setDetails(_name, _symbol, {
        from: creatorAddress
      });

      assert.equal(await oETH.name(), String(_name), 'set name error');
      assert.equal(await oETH.symbol(), String(_symbol), 'set symbol error');
    });

    it('should update parameters', async () => {
      await oETH.updateParameters('100', '500', 0, 10, {from: creatorAddress});
    });

    it('should open empty vault', async () => {
      await oETH.openVault({
        from: creatorAddress
      });
      const vault = await oETH.getVault(creatorAddress);
      assert.equal(vault[0].toString(), '0');
      assert.equal(vault[1].toString(), '0');
      assert.equal(vault[2].toString(), '0');
    });

    it('should add USDC collateral successfully', async () => {
      await usdc.approve(oETH.address, usdcAmount, {from: creatorAddress});
      await oETH.addERC20Collateral(creatorAddress, usdcAmount, {
        from: creatorAddress
      });

      // test that the vault's balances have been updated.
      const vault = await oETH.getVault(creatorAddress);
      assert.equal(vault[0].toString(), usdcAmount);
      assert.equal(vault[1].toString(), '0');
      assert.equal(vault[2].toString(), '0');
    });

    it('should add USDC collateral and Mint', async () => {
      const amountToIssue = new BigNumber('4000000'); // 1000 usdc can issue 4 250 put.

      await usdc.approve(oETH.address, usdcAmount, {from: firstOwner});

      await expectRevert(
        oETH.createERC20CollateralOption(
          amountToIssue.plus(1).toString(),
          usdcAmount,
          firstOwner,
          {
            from: firstOwner
          }
        ),
        'unsafe to mint'
      );

      await oETH.createERC20CollateralOption(
        amountToIssue.toString(),
        usdcAmount,
        firstOwner,
        {
          from: firstOwner
        }
      );

      // test that the vault's balances have been updated.
      const vault = await oETH.getVault(firstOwner);
      assert.equal(vault[0].toString(), usdcAmount);
      assert.equal(vault[1].toString(), amountToIssue.toString());
      assert.equal(vault[2].toString(), '0');
    });

    it('should be able to exercise', async () => {
      await oETH.transfer(tokenHolder, '4000000', {from: firstOwner}); // transfer 4 oETH
      const amountToExercise = '4000000'; // 4 puts
      const underlyingRequired = (
        await oETH.underlyingRequiredToExercise(amountToExercise)
      ).toString();

      const exerciseTx = await oETH.exercise(amountToExercise, [firstOwner], {
        from: tokenHolder,
        value: new BigNumber(4).times(1e18).toString()
      });

      expectEvent(exerciseTx, 'Exercise', {
        amtUnderlyingToPay: underlyingRequired,
        amtCollateralToPay: '1000000000'
      });

      // test that the vault's balances have been updated.
      const vault = await oETH.getVault(firstOwner);
      assert.equal(vault[0].toString(), '0');
      assert.equal(vault[1].toString(), '0');
      assert.equal(vault[2].toString(), underlyingRequired);
    });

    it('should be able to remove underlying after exercise', async () => {
      const removeTx = await oETH.removeUnderlying({from: firstOwner});

      expectEvent(removeTx, 'RemoveUnderlying', {
        amountUnderlying: new BigNumber(4).times(1e18).toString(),
        vaultOwner: firstOwner
      });
    });
  });
});

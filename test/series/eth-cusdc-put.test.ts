import {
  OTokenInstance,
  MockErc20Instance,
  MockCtokenInstance,
  MockCompoundOracleInstance,
  MockOracleInstance,
  MockOtokensExchangeInstance,
  OracleInstance
} from '../../build/types/truffle-types';

import BigNumber from 'bignumber.js';
const {time, expectRevert, expectEvent} = require('@openzeppelin/test-helpers');

const OTokenContract = artifacts.require('oToken');
const OptionsContract = artifacts.require('OptionsContract');

const Oracle = artifacts.require('Oracle');
const MockCompoundOracle = artifacts.require('MockCompoundOracle');
const MockOtokensExchange = artifacts.require('MockOtokensExchange');
const MockERC20 = artifacts.require('MockERC20');
const MockCToken = artifacts.require('MockCtoken');

contract('OptionsContract: ETH:cUSDC Put', accounts => {
  const creatorAddress = accounts[0];
  const firstOwner = accounts[1];
  const tokenHolder = accounts[2];

  let oracle: OracleInstance;
  let compoundOracle: MockCompoundOracleInstance;
  let exchange: MockOtokensExchangeInstance;

  let oETH: OTokenInstance;
  let weth: MockErc20Instance;
  let usdc: MockErc20Instance;
  let cusdc: MockCtokenInstance;

  const cusdcExchagneRate = new BigNumber('211325689208873'); // 0.02112 * 1e16/
  // 1e8 cUSDC is roughly 0.02112 USDC
  // 32522402 USDC => 153897058714 cUSDC
  // 153897058714 * 211325689208873 / 1e18 = 32522402

  // amount we want to fix (for exercise)
  const usdcAmount = '1000000000'; // 1000 USDC

  // calculate equivilent amount of cUSDC
  const cusdcAmount = new BigNumber(usdcAmount)
    .times(new BigNumber(1e18))
    .div(cusdcExchagneRate)
    .integerValue();

  const _name = 'ETH put 250';
  const _symbol = 'oETHp 250';

  before('set up contracts', async () => {
    const now = (await time.latest()).toNumber();
    const expiry = now + time.duration.days(30).toNumber();
    const windowSize = expiry; // time.duration.days(1).toNumber();
    // 1. Deploy mock contracts

    // A. Mock USDC, cUSDC and WETH contract
    weth = await MockERC20.new('Wrap ETH', 'WETH', 18);
    usdc = await MockERC20.new('USDC', 'USDC', 6);
    cusdc = await MockCToken.new(
      'Compound USDC',
      'cUSDC',
      usdc.address,
      cusdcExchagneRate.toString()
    );

    // create mock compound Oracle and real oracle
    compoundOracle = await MockCompoundOracle.new();
    oracle = await Oracle.new(compoundOracle.address);
    // https://etherscan.io/address/0x1d8aedc9e924730dd3f9641cdb4d1b92b848b4bd#readContract
    // compound price for underlying (USDC) 2368601814348989000000000000
    await compoundOracle.updatePrice('2368601814348989000000000000');
    // register ctoken in oracle.
    await oracle.setUsdc(usdc.address);
    await oracle.setCusdc(cusdc.address);
    await oracle.setAssetToCtoken(usdc.address, cusdc.address);
    await oracle.setIsCtoken(cusdc.address, true);
    exchange = await MockOtokensExchange.new();

    // 1.2 Mint tokens

    await cusdc.mint(creatorAddress, cusdcAmount);
    await cusdc.mint(firstOwner, cusdcAmount);

    // Create the unexpired options contract
    oETH = await OTokenContract.new(
      cusdc.address,
      -8,
      weth.address,
      -18,
      -7,
      25,
      -6,
      usdc.address,
      expiry,
      exchange.address,
      oracle.address,
      windowSize,
      {from: creatorAddress}
    );
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

    it('should add cusdc collateral successfully', async () => {
      await cusdc.approve(oETH.address, cusdcAmount, {from: creatorAddress});
      await oETH.addERC20Collateral(creatorAddress, cusdcAmount, {
        from: creatorAddress
      });

      // test that the vault's balances have been updated.
      const vault = await oETH.getVault(creatorAddress);
      assert.equal(vault[0].toString(), cusdcAmount);
      assert.equal(vault[1].toString(), '0');
      assert.equal(vault[2].toString(), '0');
    });

    it('should add cusdc collateral and Mint', async () => {
      const amountToIssue = new BigNumber('40000000'); // 1000 cusdc can issue 4 250 put.

      await cusdc.approve(oETH.address, cusdcAmount, {from: firstOwner});

      await expectRevert(
        oETH.createERC20CollateralOption(
          amountToIssue.plus(100).toString(),
          cusdcAmount,
          firstOwner,
          {
            from: firstOwner
          }
        ),
        'unsafe to mint'
      );

      // const maxToIssue = await oETH.maxOTokensIssuable(cusdcAmount);

      // const cP = await oracle.getPrice(cusdc.address);
      // const P = await oracle.getPrice(usdc.address);
      // console.log(`cUSDC\t`, cP.toString());
      // console.log(`USDC\t`, P.toString());
      // console.log(`maxToIssue`, maxToIssue.toString());

      await oETH.createERC20CollateralOption(
        amountToIssue.toString(),
        cusdcAmount,
        firstOwner,
        {
          from: firstOwner
        }
      );

      // test that the vault's balances have been updated.
      const vault = await oETH.getVault(firstOwner);
      assert.equal(vault[0].toString(), cusdcAmount);
      assert.equal(vault[1].toString(), amountToIssue.toString());
      assert.equal(vault[2].toString(), '0');
    });

    it('should be able to exercise', async () => {
      await oETH.transfer(tokenHolder, '40000000', {from: firstOwner}); // transfer 4 oETH
      const amountToExercise = '40000000'; // 4 puts
      const underlyingRequired = (
        await oETH.underlyingRequiredToExercise(amountToExercise)
      ).toString();

      await weth.mint(tokenHolder, underlyingRequired);
      await weth.approve(oETH.address, underlyingRequired, {from: tokenHolder});
      const exerciseTx = await oETH.exercise(amountToExercise, [firstOwner], {
        from: tokenHolder
      });

      const usdcAmount = new BigNumber('1000000000');
      const equivalentCUSDC = usdcAmount
        .times(new BigNumber(1e18))
        .div(cusdcExchagneRate)
        .integerValue()
        .minus(1)
        .toString();

      expectEvent(exerciseTx, 'Exercise', {
        amtUnderlyingToPay: underlyingRequired,
        amtCollateralToPay: equivalentCUSDC
      });

      // test that the vault's balances have been updated.
      const vault = await oETH.getVault(firstOwner);
      assert.equal(vault[0].toString(), '1'); // left in the vault
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

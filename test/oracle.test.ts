import {
  OracleInstance,
  MockCompoundOracleInstance,
  MockErc20Instance,
  MockCtokenInstance
} from '../build/types/truffle-types';
import BigNumber from 'bignumber.js';
import {assert} from 'chai';
const MockCToken = artifacts.require('MockCtoken');
const Oracle = artifacts.require('Oracle');
const MockERC20 = artifacts.require('MockERC20');
const CompoundOracle = artifacts.require('MockCompoundOracle');

const {expectRevert} = require('@openzeppelin/test-helpers');
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

contract('Oracle.sol', ([owner, random, ...tokens]) => {
  let compoundOracle: MockCompoundOracleInstance;
  let oracle: OracleInstance;

  describe('contract deployment', () => {
    before('setup mock compound protocol', async () => {
      compoundOracle = await CompoundOracle.new();
    });
    it('shuold create oracle', async () => {
      oracle = await Oracle.new(random);
    });
  });

  describe('#setPriceOracle', () => {
    it('should revert when setting from arbitrary address', async () => {
      await expectRevert(
        oracle.setPriceOracle(compoundOracle.address, {from: random}),
        'Ownable: caller is not the owner.'
      );
    });

    it('should revert when setting from arbitrary address', async () => {
      await oracle.setPriceOracle(compoundOracle.address, {from: owner});
      const _oracle = await oracle.priceOracle();
      assert.equal(_oracle, compoundOracle.address);
    });
  });

  describe('#setIsCtoken', () => {
    it('should set isCtoken', async () => {
      await oracle.setIsCtoken(tokens[0], true, {from: owner});
      const isCtoken = await oracle.isCtoken(tokens[0]);
      assert.equal(true, isCtoken);

      // set back to false
      await oracle.setIsCtoken(tokens[0], false, {from: owner});
      assert.equal(false, await oracle.isCtoken(tokens[0]));
    });
  });

  describe('#setAssetToCtoken', () => {
    it('should set setAssetToCtoken mapping', async () => {
      await oracle.setAssetToCtoken(tokens[7], tokens[6], {from: owner});
      const cToken = await oracle.assetToCtokens(tokens[7]);
      assert.equal(tokens[6], cToken);
    });
  });

  describe('#getPrice', () => {
    let bat: MockErc20Instance;
    let usdc: MockErc20Instance;

    let cBat: MockCtokenInstance;
    let cUSDC: MockCtokenInstance;

    it('should set ETH price', async () => {
      const price = 333.5 * 1e6;
      await compoundOracle.setPrice('ETH', price);
      const oraclePrice = await compoundOracle.price('ETH');

      assert.equal(price, oraclePrice);
    });

    it('should get BAT asset price', async () => {
      bat = await MockERC20.new('BAT', 'BAT', 18);
      const cBatToBatExchangeRate = '203779026431652476585639266'; // 0.023779 * 1e28
      cBat = await MockCToken.new(
        'cBAT',
        'cBAT',
        bat.address,
        cBatToBatExchangeRate
      );
      await oracle.setIsCtoken(cBat.address, true);
      await oracle.setAssetToCtoken(bat.address, cBat.address);

      // update compound oracle price for BAT
      const batPrice = '777857500000000';
      await compoundOracle.updateUnderlyingPriceInWei(cBat.address, batPrice); // ? wei per BAT
      // get price for BAT
      const price = await oracle.getPrice(bat.address);
      assert.equal(price.toString(), batPrice);
    });

    it('should get cBAT asset price', async () => {
      const price = await oracle.getPrice(cBat.address);
      assert.equal(price.toString(), '15851104405255');
    });

    it('should get USDC asset price', async () => {
      usdc = await MockERC20.new('USDC', 'USDC', 6);

      // https://etherscan.io/address/0x39AA39c021dfbaE8faC545936693aC917d5E7563#readContract
      const cusdcExchangeRate = '211278877392162'; // 0.02112 * 1e16/
      cUSDC = await MockCToken.new(
        'cUSDC',
        'cUSDC',
        usdc.address,
        cusdcExchangeRate
      );
      await oracle.setIsCtoken(cUSDC.address, true);
      await oracle.setAssetToCtoken(usdc.address, cUSDC.address);

      // update compound oracle price for USDC
      // in wei
      const usdcPrice = '2348189545860141';
      await compoundOracle.updateUnderlyingPriceInWei(cUSDC.address, usdcPrice); // ? wei per USDC
      // get USDC price
      const price = await oracle.getPrice(usdc.address);
      assert.equal(price.toString(), '2348189545860141');
    });

    it('should get cUSDC asset price', async () => {
      const price = await oracle.getPrice(cUSDC.address);
      assert.equal(price.toString(), '49612285115334');
    });

    it('should get cETH price', async () => {
      // setting up cETH
      const cETHtoETHExchangeRate = '200178102566185484146669091'; // 0.020017 * 1e28
      const cETH = await MockCToken.new(
        'cETH',
        'cETH',
        ZERO_ADDRESS,
        cETHtoETHExchangeRate
      );
      await oracle.setCeth(cETH.address, {from: owner});
      await oracle.setIsCtoken(cETH.address, true);

      // calculating price of cETH
      const cETHPrice = await oracle.getPrice(cETH.address);
      const priceInWei = new BigNumber(cETHtoETHExchangeRate)
        .div(new BigNumber(10).pow(10))
        .integerValue();
      assert.equal(cETHPrice.toString(), priceInWei.toString());
    });

    it('should return 1e18 for ETH (address 0)', async () => {
      const price = await oracle.getPrice(ZERO_ADDRESS);
      // 1 ETH = 1e18 wei
      assert.equal(price.toString(), '1000000000000000000');
    });

    it('should return 0 for random tokens', async () => {
      const price = await oracle.getPrice(random);
      assert.equal(price.toString(), '0');
    });
  });
});

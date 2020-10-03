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

  describe('Set ctoken addresses', () => {
    it('should set cETH address', async () => {
      await oracle.setCeth(tokens[0], {from: owner});
      const newAddr = await oracle.getcEth();
      assert.equal(tokens[0], newAddr);

      assert.equal(await oracle.iscEth(newAddr), true);
    });
    it('should set cBAT address', async () => {
      await oracle.setCbat(tokens[1], {from: owner});
      const newAddr = await oracle.getcBat();
      assert.equal(tokens[1], newAddr);
    });
    it('should set cDai address', async () => {
      await oracle.setCdai(tokens[2], {from: owner});
      const newAddr = await oracle.getcDai();
      assert.equal(tokens[2], newAddr);
    });
    it('should set cREP address', async () => {
      await oracle.setCrep(tokens[3], {from: owner});
      const newAddr = await oracle.getcRep();
      assert.equal(tokens[3], newAddr);
    });
    it('should set cUSDC address', async () => {
      await oracle.setCusdc(tokens[4], {from: owner});
      const newAddr = await oracle.getcUsdc();
      assert.equal(tokens[4], newAddr);
    });
    it('should set cWBTC address', async () => {
      await oracle.setCwbtc(tokens[5], {from: owner});
      const newAddr = await oracle.getcWbtc();
      assert.equal(tokens[5], newAddr);
    });
    it('should set cZRX address', async () => {
      await oracle.setCzrx(tokens[6], {from: owner});
      const newAddr = await oracle.getcZrx();
      assert.equal(tokens[6], newAddr);
    });
  });

  describe('Set non-ctoken addresses', () => {
    it('should set BAT address', async () => {
      await oracle.setBat(tokens[7], {from: owner});
      const newAddr = await oracle.getBat();
      assert.equal(tokens[7], newAddr);
    });
    it('should set Dai address', async () => {
      await oracle.setDai(tokens[6], {from: owner});
      const newAddr = await oracle.getDai();
      assert.equal(tokens[6], newAddr);
    });
    it('should set REP address', async () => {
      await oracle.setRep(tokens[5], {from: owner});
      const newAddr = await oracle.getRep();
      assert.equal(tokens[5], newAddr);
    });
    it('should set USDC address', async () => {
      await oracle.setUsdc(tokens[4], {from: owner});
      const newAddr = await oracle.getUsdc();
      assert.equal(tokens[4], newAddr);
    });
    it('should set WBTC address', async () => {
      await oracle.setWbtc(tokens[3], {from: owner});
      const newAddr = await oracle.getWbtc();
      assert.equal(tokens[3], newAddr);
    });
    it('should set ZRX address', async () => {
      await oracle.setZrx(tokens[2], {from: owner});
      const newAddr = await oracle.getZrx();
      assert.equal(tokens[2], newAddr);
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

    it('should get BAT asset price', async () => {
      bat = await MockERC20.new('BAT', 'BAT', 18);
      await oracle.setBat(bat.address, {from: owner});
      const cBatToBatExchangeRate = '203779026431652476585639266'; // 0.023779 * 1e28
      cBat = await MockCToken.new(
        'cBAT',
        'cBAT',
        bat.address,
        cBatToBatExchangeRate
      );
      await oracle.setCbat(cBat.address, {from: owner});
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
      await oracle.setUsdc(usdc.address, {from: owner});

      // https://etherscan.io/address/0x39AA39c021dfbaE8faC545936693aC917d5E7563#readContract
      const cusdcExchangeRate = '211278877392162'; // 0.02112 * 1e16/
      cUSDC = await MockCToken.new(
        'cUSDC',
        'cUSDC',
        usdc.address,
        cusdcExchangeRate
      );
      await oracle.setCusdc(cUSDC.address, {from: owner});
      await oracle.setIsCtoken(cUSDC.address, true);
      await oracle.setAssetToCtoken(usdc.address, cUSDC.address);

      // update compound oracle price for USDC
      // in wei
      const usdcPrice = '2348189545860141';
      await compoundOracle.updateUnderlyingPriceInWei(cUSDC.address, usdcPrice); // ? wei per USDC
      // get USDC price
      const price = await oracle.getPrice(usdc.address);
      // expect the same?
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

      assert.equal(await oracle.iscEth(cETH.address), true);

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

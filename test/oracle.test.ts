import {
  OracleInstance,
  MockCompoundOracleInstance,
  MockCtokenInstance,
  MockErc20Instance
} from '../build/types/truffle-types';

const MockCToken = artifacts.require('MockCtoken');
const Oracle = artifacts.require('Oracle');
const MockERC20 = artifacts.require('MockERC20');
const CompoundOracle = artifacts.require('MockCompoundOracle');

const {expectEvent, expectRevert} = require('@openzeppelin/test-helpers');

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
    let cBat: MockCtokenInstance;

    const batPrice = '777857500000000';
    const cBatToBatExchangeRate = '203779026431652476585639266';

    before('setup cToken instance with proper data.', async () => {
      bat = await MockERC20.new('BAT', 'BAT', 18);
      cBat = await MockCToken.new(bat.address, cBatToBatExchangeRate);

      await oracle.setBat(bat.address, {from: owner});
      await oracle.setCbat(cBat.address, {from: owner});
      await oracle.setIsCtoken(bat.address, false);
      await oracle.setIsCtoken(cBat.address, true);
      //
      await oracle.setAssetToCtoken(bat.address, cBat.address);

      // update compound price oracle:
      await compoundOracle.updatePrice(batPrice); // ? wei per BAT
    });

    it('should get underlying asset price', async () => {
      const price = await oracle.getPrice(bat.address);
      assert.equal(price.toString(), batPrice);
    });
  });
});

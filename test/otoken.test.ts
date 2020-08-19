import {
  MockErc20Instance,
  MockOracleInstance,
  OTokenInstance,
  MockOtokensExchangeInstance
} from '../build/types/truffle-types';

import BN = require('bn.js');

const OToken = artifacts.require('oToken');
const MockOtokensExchange = artifacts.require('MockOtokensExchange');
const MockOracle = artifacts.require('MockOracle');
const MockERC20 = artifacts.require('MockERC20');

const {time, expectRevert, send} = require('@openzeppelin/test-helpers');

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const MAX_UINT256 =
  '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
// Initialize the Options Factory, Options Exchange and other mock contracts
contract('OToken', accounts => {
  const [
    creatorAddress,
    firstOwner,
    secondOwner,
    nonOwnerAddress,
    random
  ] = accounts;

  let exchange: MockOtokensExchangeInstance;
  let oracle: MockOracleInstance;
  let dai: MockErc20Instance;
  let usdc: MockErc20Instance;

  let otoken1: OTokenInstance; // erc20 collateral options
  let otoken2: OTokenInstance; // eth collateral options

  let expiry: number;
  let windowSize: number;

  before('set up contracts', async () => {
    const now = (await time.latest()).toNumber();
    expiry = now + time.duration.days(30).toNumber();
    windowSize = expiry;
    // 1. Deploy mock contracts
    // 1.1 Compound Oracle
    oracle = await MockOracle.new();

    // 1.2 Mock Dai contract
    dai = await MockERC20.new('DAI', 'DAI', 18);
    await dai.mint(creatorAddress, '10000000');

    exchange = await MockOtokensExchange.new();

    // 1.3 Mock USDC contract
    usdc = await MockERC20.new('USDC', 'USDC', 6);
    await usdc.mint(creatorAddress, '10000000000');
    await usdc.mint(firstOwner, '10000000000');
    await usdc.mint(secondOwner, '10000000000');
    await usdc.mint(nonOwnerAddress, '10000000000');
  });

  describe('#constructor', () => {
    it('should create an ERC20 collateral option', async () => {
      otoken1 = await OToken.new(
        usdc.address,
        dai.address,
        usdc.address,
        -'17',
        '90',
        -'18',
        expiry,
        windowSize,
        exchange.address,
        oracle.address
      );
    });

    it('should create an ETH collateral option', async () => {
      otoken2 = await OToken.new(
        ZERO_ADDRESS,
        dai.address,
        usdc.address,
        -'17',
        '90',
        -'18',
        expiry,
        windowSize,
        exchange.address,
        oracle.address
      );
    });
  });

  /**
   *  ----------------------------------------
   * | ETH Collateral Option Tests (otoken2)  |
   *  ----------------------------------------
   */

  describe('#createETHCollateralOption', () => {
    it('should revert when calling on ERC20 collateral option', async () => {
      const collateral = new BN(20000000).toString();
      const amountToIssue = await otoken1.maxOTokensIssuable(collateral);
      await expectRevert(
        otoken1.createETHCollateralOption(amountToIssue, firstOwner, {
          from: firstOwner,
          value: collateral
        }),
        'ETH is not the specified collateral type.'
      );
    });

    it('should openvault, add ETH as collateral and mint otoken on ETH collateral option', async () => {
      const collateral = new BN(20000000).toString();
      const amountToIssue = await otoken2.maxOTokensIssuable(collateral);
      await otoken2.createETHCollateralOption(amountToIssue, firstOwner, {
        from: firstOwner,
        value: collateral
      });

      const vault = await otoken2.getVault(firstOwner);
      assert.equal(vault[0].toString(), collateral);
      assert.equal(vault[1].toString(), amountToIssue);
    });
  });

  describe('#addETHCollateralOption', () => {
    it('should revert when calling on ERC20 collateral option', async () => {
      const collateral = new BN(20000000).toString();
      const amountToIssue = await otoken1.maxOTokensIssuable(collateral);
      await expectRevert(
        otoken1.addETHCollateralOption(amountToIssue, firstOwner, {
          from: firstOwner,
          value: collateral
        }),
        'ETH is not the specified collateral type.'
      );
    });
    it('should revert if caller has not opened a vault yet', async () => {
      const collateral = new BN(20000000).toString();
      const amountToIssue = await otoken2.maxOTokensIssuable(collateral);
      await expectRevert(
        otoken2.addETHCollateralOption(amountToIssue, firstOwner, {
          from: secondOwner,
          value: collateral
        }),
        'Vault does not exist'
      );
    });
    it('should add ETH as collateral and mint otoken on ETH collateral option', async () => {
      const oldVault = await otoken2.getVault(firstOwner);

      const collateral = new BN(10000000).toString();
      const amountToIssue = await otoken2.maxOTokensIssuable(collateral);
      await otoken2.addETHCollateralOption(amountToIssue, firstOwner, {
        from: firstOwner,
        value: collateral
      });

      const vault = await otoken2.getVault(firstOwner);
      assert.equal(vault[0].sub(oldVault[0]).toString(), collateral);
      assert.equal(vault[1].sub(oldVault[1]).toString(), amountToIssue);
    });
  });

  describe('#createAndSellETHCollateralOption', () => {
    before('set mock exchange price and fund some ETH', async () => {
      await exchange.setPrice('1');
      await send.ether(random, exchange.address, '1000000000000000000'); // 1 eth
    });
    it('should revert when calling on ERC20 collateral option', async () => {
      const collateral = new BN(20000000).toString();
      const amountToIssue = await otoken1.maxOTokensIssuable(collateral);
      await expectRevert(
        otoken1.createAndSellETHCollateralOption(amountToIssue, firstOwner, {
          from: firstOwner,
          value: collateral
        }),
        'ETH is not the specified collateral type.'
      );
    });
    it('should open vault, add collateral, mint and sell', async () => {
      const collateral = new BN(10000000).toString();
      const amountToIssue = await otoken2.maxOTokensIssuable(collateral);
      await otoken2.createAndSellETHCollateralOption(
        amountToIssue,
        secondOwner,
        {
          from: secondOwner,
          value: collateral
        }
      );

      const vault = await otoken2.getVault(secondOwner);
      assert.equal(vault[0].toString(), collateral);
      assert.equal(vault[1].toString(), amountToIssue);

      // otoken has already been sold
      const otokenBalance = await otoken2.balanceOf(secondOwner);
      assert.equal(otokenBalance, '0');
    });
  });

  describe('#addAndSellETHCollateralOption', () => {
    it('should revert when calling on ERC20 collateral option', async () => {
      const collateral = new BN(20000000).toString();
      const amountToIssue = await otoken1.maxOTokensIssuable(collateral);
      await expectRevert(
        otoken1.addAndSellETHCollateralOption(amountToIssue, firstOwner, {
          from: firstOwner,
          value: collateral
        }),
        'ETH is not the specified collateral type.'
      );
    });

    it('should revert if caller has not opened a vault yet', async () => {
      const collateral = new BN(20000000).toString();
      const amountToIssue = await otoken2.maxOTokensIssuable(collateral);
      await expectRevert(
        otoken2.addAndSellETHCollateralOption(amountToIssue, nonOwnerAddress, {
          from: nonOwnerAddress,
          value: collateral
        }),
        'Vault does not exist'
      );
    });

    it('should add collateral, mint and sell', async () => {
      const oldVault = await otoken2.getVault(secondOwner);

      const collateral = new BN(10000000).toString();
      const amountToIssue = await otoken2.maxOTokensIssuable(collateral);
      await otoken2.addAndSellETHCollateralOption(amountToIssue, secondOwner, {
        from: secondOwner,
        value: collateral
      });

      const vault = await otoken2.getVault(secondOwner);
      assert.equal(vault[0].sub(oldVault[0]).toString(), collateral);
      assert.equal(vault[1].sub(oldVault[1]).toString(), amountToIssue);

      const otokenBalance = await otoken2.balanceOf(secondOwner);
      assert.equal(otokenBalance, '0');
    });
  });

  /**
   *  -----------------------------------------
   * | ERC20 Collateral Option Tests (otoken1) |
   *  -----------------------------------------
   */

  describe('#createERC20CollateralOption', () => {
    before('Approve USDC transfer from all owners', async () => {
      await usdc.approve(otoken1.address, MAX_UINT256, {from: firstOwner});
      await usdc.approve(otoken1.address, MAX_UINT256, {from: secondOwner});
      await usdc.approve(otoken1.address, MAX_UINT256, {from: nonOwnerAddress});
    });

    it('should revert when calling on ETH collateral option', async () => {
      const collateral = new BN(20000000).toString();

      const amountToIssue = await otoken2.maxOTokensIssuable(collateral);
      await expectRevert(
        otoken2.createERC20CollateralOption(
          amountToIssue,
          collateral,
          firstOwner,
          {
            from: firstOwner
          }
        ),
        'revert' // address(o).transferFrom will revert
      );
    });

    it('should openvault, add ERC20 as collateral and mint otoken on ETH collateral option', async () => {
      const collateral = new BN(20000000).toString();
      const amountToIssue = await otoken1.maxOTokensIssuable(collateral);
      await otoken1.createERC20CollateralOption(
        amountToIssue,
        collateral,
        firstOwner,
        {
          from: firstOwner
        }
      );

      const vault = await otoken1.getVault(firstOwner);
      assert.equal(vault[0].toString(), collateral);
      assert.equal(vault[1].toString(), amountToIssue);
    });
  });

  describe('#addERC20CollateralOption', () => {
    it('should revert when calling on ETH collateral option', async () => {
      const collateral = new BN(20000000).toString();
      const amountToIssue = await otoken2.maxOTokensIssuable(collateral);
      await expectRevert(
        otoken2.addERC20CollateralOption(
          amountToIssue,
          collateral,
          firstOwner,
          {
            from: firstOwner
          }
        ),
        'revert' // address(o).transferFrom will revert
      );
    });
    it('should revert if caller has not opened a vault yet', async () => {
      const collateral = new BN(10000000).toString();
      const amountToIssue = await otoken1.maxOTokensIssuable(collateral);
      await expectRevert(
        otoken1.addERC20CollateralOption(
          amountToIssue,
          collateral,
          secondOwner,
          {
            from: secondOwner
          }
        ),
        'Vault does not exist'
      );
    });
    it('should add ERC20 as collateral and mint otoken', async () => {
      const oldVault = await otoken1.getVault(firstOwner);

      const collateral = new BN(10000000).toString();
      const amountToIssue = await otoken1.maxOTokensIssuable(collateral);
      await otoken1.addERC20CollateralOption(
        amountToIssue,
        collateral,
        firstOwner,
        {
          from: firstOwner
        }
      );

      const vault = await otoken1.getVault(firstOwner);
      assert.equal(vault[0].sub(oldVault[0]).toString(), collateral);
      assert.equal(vault[1].sub(oldVault[1]).toString(), amountToIssue);
    });
  });

  describe('#createAndSellERC20CollateralOption', () => {
    before('set mock exchange price and fund some ETH', async () => {
      await exchange.setPrice('1');
      await send.ether(random, exchange.address, '1000000000000000000'); // 1 eth
    });
    it('should revert when calling on ETH collateral option', async () => {
      const collateral = new BN(20000000).toString();
      const amountToIssue = await otoken2.maxOTokensIssuable(collateral);
      await expectRevert(
        otoken2.createAndSellERC20CollateralOption(
          amountToIssue,
          collateral,
          firstOwner,
          {
            from: firstOwner,
            value: collateral
          }
        ),
        'revert' // address(o).transferFrom will revert
      );
    });
    it('should open vault, add collateral, mint and sell', async () => {
      const collateral = new BN(10000000).toString();
      const amountToIssue = await otoken1.maxOTokensIssuable(collateral);
      await otoken1.createAndSellERC20CollateralOption(
        amountToIssue,
        collateral,
        secondOwner,
        {
          from: secondOwner
        }
      );

      const vault = await otoken1.getVault(secondOwner);
      assert.equal(vault[0].toString(), collateral);
      assert.equal(vault[1].toString(), amountToIssue);

      // otoken has already been sold
      const otokenBalance = await otoken1.balanceOf(secondOwner);
      assert.equal(otokenBalance, '0');
    });
  });

  describe('#addAndSellERC20CollateralOption', () => {
    it('should revert when calling on ETH collateral option', async () => {
      const collateral = new BN(20000000).toString();
      const amountToIssue = await otoken2.maxOTokensIssuable(collateral);
      await expectRevert(
        otoken2.addAndSellERC20CollateralOption(
          amountToIssue,
          collateral,
          firstOwner,
          {
            from: firstOwner
          }
        ),
        'revert' // address(o).transferFrom will revert
      );
    });

    it('should revert if caller has not opened a vault yet', async () => {
      const collateral = new BN(10000000).toString();
      const amountToIssue = await otoken1.maxOTokensIssuable(collateral);
      await expectRevert(
        otoken1.addAndSellERC20CollateralOption(
          amountToIssue,
          collateral,
          nonOwnerAddress,
          {
            from: nonOwnerAddress
          }
        ),
        'Vault does not exist'
      );
    });

    it('should add collateral, mint and sell', async () => {
      const oldVault = await otoken1.getVault(secondOwner);

      const collateral = new BN(10000000).toString();
      const amountToIssue = await otoken1.maxOTokensIssuable(collateral);
      await otoken1.addAndSellERC20CollateralOption(
        amountToIssue,
        collateral,
        secondOwner,
        {
          from: secondOwner
        }
      );

      const vault = await otoken1.getVault(secondOwner);
      assert.equal(vault[0].sub(oldVault[0]).toString(), collateral);
      assert.equal(vault[1].sub(oldVault[1]).toString(), amountToIssue);

      const otokenBalance = await otoken1.balanceOf(secondOwner);
      assert.equal(otokenBalance, '0');
    });
  });
});

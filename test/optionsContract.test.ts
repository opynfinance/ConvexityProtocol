import {expect} from 'chai';
import {
  MockErc20Instance,
  OptionsFactoryInstance,
  MockOracleInstance,
  OptionsContractInstance
} from '../build/types/truffle-types';

const OptionsContract = artifacts.require('OptionsContract');
const OptionsFactory = artifacts.require('OptionsFactory');
const MockOracle = artifacts.require('MockOracle');
const MockERC20 = artifacts.require('MockERC20');

const truffleAssert = require('truffle-assertions');

import Reverter from './utils/reverter';

import {checkVault} from './utils/helper';
const {
  time,
  expectEvent,
  expectRevert,
  BN
} = require('@openzeppelin/test-helpers');

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

// Initialize the Options Factory, Options Exchange and other mock contracts
contract('OptionsContract', accounts => {
  const reverter = new Reverter(web3);

  const [creatorAddress, firstOwnerAddress, nonOwnerAddress, random] = accounts;

  const optionsContracts: OptionsContractInstance[] = [];
  let optionsFactory: OptionsFactoryInstance;
  let oracle: MockOracleInstance;
  let weth: MockErc20Instance;
  let dai: MockErc20Instance;
  let usdc: MockErc20Instance;

  let expiry: number;
  let windowSize: number;

  before('set up contracts', async () => {
    const now = (await time.latest()).toNumber();
    expiry = now + time.duration.days(30).toNumber();
    windowSize = expiry;
    // 1. Deploy mock contracts
    // 1.1 Compound Oracle
    oracle = await MockOracle.new();

    weth = await MockERC20.new('WETH', 'WETH', 18);
    // 1.2 Mock Dai contract
    dai = await MockERC20.new('DAI', 'DAI', 18);
    await dai.mint(creatorAddress, '10000000');

    // 1.3 Mock USDC contract
    usdc = await MockERC20.new('USDC', 'USDC', 6);
    await usdc.mint(creatorAddress, '10000000');
    await usdc.mint(nonOwnerAddress, '10000000');

    // 2. Deploy our contracts
    // deploys the Options Exhange contract

    // Deploy the Options Factory contract and add assets to it
    optionsFactory = await OptionsFactory.deployed();

    await optionsFactory.whitelistAsset(ZERO_ADDRESS);
    await optionsFactory.whitelistAsset(weth.address);
    await optionsFactory.whitelistAsset(dai.address);
    await optionsFactory.whitelistAsset(usdc.address);

    // Create the unexpired options contract
    let optionsContractResult = await optionsFactory.createOptionsContract(
      ZERO_ADDRESS,
      dai.address,
      ZERO_ADDRESS,
      -'17',
      '90',
      -'18',
      expiry,
      windowSize,
      'Opyn Token',
      'oDAI',
      {from: creatorAddress}
    );

    let optionsContractAddr = optionsContractResult.logs[1].args[0];
    optionsContracts.push(await OptionsContract.at(optionsContractAddr));

    optionsContractResult = await optionsFactory.createOptionsContract(
      usdc.address,
      dai.address,
      usdc.address,
      -'17',
      '90',
      -'18',
      expiry,
      windowSize,
      'Opyn Token',
      'oDai',
      {from: creatorAddress}
    );

    optionsContractAddr = optionsContractResult.logs[1].args[0];
    const ERC20collateralOptContract = await OptionsContract.at(
      optionsContractAddr
    );
    optionsContracts.push(ERC20collateralOptContract);

    await reverter.snapshot();
  });

  describe('#constructor', () => {
    it('should revert when deploying expired options', async () => {
      const expiry = (await time.latest()) - 100;
      await expectRevert(
        OptionsContract.new(
          usdc.address,
          dai.address,
          usdc.address,
          -'17',
          '90',
          -'18',
          expiry,
          windowSize,
          oracle.address
        ),
        "Can't deploy an expired contract"
      );
    });

    it('should revert with invalid window and expiry', async () => {
      await expectRevert(
        OptionsContract.new(
          usdc.address,
          dai.address,
          usdc.address,
          -'17',
          '90',
          -'18',
          expiry,
          expiry + 1,
          oracle.address
        ),
        "Exercise window can't be longer than the contract's lifespan"
      );
    });

    it('should revert with invalid collateral exponent range', async () => {
      const wrongToken = await MockERC20.new('Wrong', 'wrong', 31);
      await expectRevert(
        OptionsContract.new(
          wrongToken.address,
          dai.address,
          usdc.address,
          -'17',
          '90',
          -'18',
          expiry,
          expiry,
          oracle.address
        ),
        'collateral exponent not within expected range'
      );
    });

    it('should revert with invalid underlying exponent range', async () => {
      const wrongToken = await MockERC20.new('Wrong', 'wrong', 31);
      await expectRevert(
        OptionsContract.new(
          usdc.address,
          wrongToken.address,
          usdc.address,
          -'17',
          '90',
          -'18',
          expiry,
          expiry,
          oracle.address
        ),
        'underlying exponent not within expected range'
      );
    });

    it('should revert with invalid strike price exponent range', async () => {
      await expectRevert(
        OptionsContract.new(
          usdc.address,
          dai.address,
          usdc.address,
          -'17',
          '90',
          -'31',
          expiry,
          expiry,
          oracle.address
        ),
        'strike price exponent not within expected range'
      );
    });

    it('should revert with invalid oTokenExchangeExp range', async () => {
      await expectRevert(
        OptionsContract.new(
          usdc.address,
          dai.address,
          usdc.address,
          -'31',
          '90',
          -'18',
          expiry,
          expiry,
          oracle.address
        ),
        'oToken exchange rate exponent not within expected range'
      );
    });

    it('should revert when creating an option with eth as underlying ', async () => {
      await expectRevert(
        OptionsContract.new(
          ZERO_ADDRESS,
          ZERO_ADDRESS,
          ZERO_ADDRESS,
          -'17',
          '90',
          -'18',
          expiry,
          expiry,
          oracle.address
        ),
        "OptionsContract: Can't use ETH as underlying"
      );
    });

    it('should create a option with eth as collateral, strike, DAI as underlying ', async () => {
      await OptionsContract.new(
        ZERO_ADDRESS,
        dai.address,
        ZERO_ADDRESS,
        -'17',
        '90',
        -'18',
        expiry,
        expiry,
        oracle.address
      );
    });
  });

  describe('#setDetails', () => {
    it('should set detail for the valid otoken', async () => {
      const validOtoken = await OptionsContract.new(
        usdc.address,
        dai.address,
        usdc.address,
        1,
        '90',
        -'18',
        expiry,
        expiry,
        oracle.address
      );
      await validOtoken.setDetails('Valid Otoken', 'oDAI');
      const name = await validOtoken.name();
      assert.equal(name, 'Valid Otoken');
    });
  });

  describe('#updateParameter()', () => {
    let option: OptionsContractInstance;
    before('Create a test option', async () => {
      option = await OptionsContract.new(
        ZERO_ADDRESS,
        usdc.address,
        ZERO_ADDRESS,
        -6,
        4, // strike price
        -9, // strike price exp
        expiry,
        expiry,
        oracle.address,
        {from: creatorAddress}
      );
    });

    it('should revert when calling from other address', async () => {
      await expectRevert(
        option.updateParameters(100, 500, 0, 10, {from: random}),
        'Ownable: caller is not the owner'
      );
    });

    it('should revert when trying to set liquidation incentive > 200%', async () => {
      await expectRevert(
        option.updateParameters(201, 500, 0, 10), //
        "Can't have >20% liquidation incentive"
      );
    });

    it('should revert when trying to set transaction fee > 10%', async () => {
      await expectRevert(
        option.updateParameters(100, 500, 101, 10), //
        "Can't have transaction fee > 10%"
      );
    });

    it('should revert when trying to set liquidation factor > 100%', async () => {
      await expectRevert(
        option.updateParameters(100, 1001, 0, 10), //
        "Can't liquidate more than 100% of the vault"
      );
    });

    it('should revert when trying to set collateral ratio < 1', async () => {
      await expectRevert(
        option.updateParameters(100, 500, 0, 9), //
        "Can't have minCollateralizationRatio < 1"
      );
    });

    it('should emit UpdateParameters event ', async () => {
      expectEvent(
        await option.updateParameters(200, 500, 0, 10), //
        'UpdateParameters',
        {
          liquidationIncentive: '200',
          liquidationFactor: '500',
          transactionFee: '0',
          minCollateralizationRatio: '10'
        }
      );
    });
  });

  describe('#openVault()', () => {
    it('should open first vault correctly', async () => {
      const result = await optionsContracts[0].openVault({
        from: creatorAddress
      });

      // test getVault
      const vault = await optionsContracts[0].getVault(creatorAddress);
      expect(vault['0'].toString()).to.equal('0');
      expect(vault['1'].toString()).to.equal('0');
      expect(vault['2'].toString()).to.equal('0');
      expect(vault['3']).to.equal(true);

      // check proper events emitted
      expect(result.logs[0].event).to.equal('VaultOpened');
    });

    it("shouldn't allow to open second vault correctly", async () => {
      await expectRevert(
        optionsContracts[0].openVault({
          from: creatorAddress
        }),
        'Vault already created'
      );
    });

    it('new person should be able to open third vault correctly', async () => {
      await optionsContracts[0].openVault({
        from: firstOwnerAddress
      });

      // test getVault
      const vault = await optionsContracts[0].getVault(firstOwnerAddress);
      expect(vault['0'].toString()).to.equal('0');
      expect(vault['1'].toString()).to.equal('0');
      expect(vault['2'].toString()).to.equal('0');
      expect(vault['3']).to.equal(true);
    });
  });

  describe('#addETHCollateral()', () => {
    it("shouldn't be able to add ETH collateral to a 0x0 address", async () => {
      const msgValue = '10000000';
      await expectRevert(
        optionsContracts[0].addETHCollateral(
          '0x0000000000000000000000000000000000000000',
          {
            from: creatorAddress,
            value: msgValue
          }
        ),
        'Vault does not exist'
      );
    });

    it('should add ETH collateral successfully', async () => {
      const msgValue = '10000000';
      const result = await optionsContracts[0].addETHCollateral(
        creatorAddress,
        {
          from: creatorAddress,

          value: msgValue
        }
      );

      // test that the vault's balances have been updated.
      const vault = await optionsContracts[0].getVault(creatorAddress);
      checkVault(vault, '10000000', '0');

      // check proper events emitted
      expect(result.logs[0].event).to.equal('ETHCollateralAdded');
      expect(result.logs[0].args.vaultOwner).to.equal(creatorAddress);
      expect(result.logs[0].args.amount.toString()).to.equal(msgValue);
    });

    it('anyone should be able to add ETH collateral to any vault', async () => {
      const msgValue = '10000000';
      let result = await optionsContracts[0].addETHCollateral(creatorAddress, {
        from: firstOwnerAddress,

        value: msgValue
      });

      // test that the vault's balances have been updated.
      let vault = await optionsContracts[0].getVault(creatorAddress);
      checkVault(vault, '20000000', '0');
      // check proper events emitted
      expect(result.logs[0].event).to.equal('ETHCollateralAdded');
      expect(result.logs[0].args.vaultOwner).to.equal(creatorAddress);
      expect(result.logs[0].args.amount.toString()).to.equal(msgValue);
      expect(result.logs[0].args.payer).to.equal(firstOwnerAddress);

      result = await optionsContracts[0].addETHCollateral(firstOwnerAddress, {
        from: creatorAddress,

        value: msgValue
      });

      // test that the vault's balances have been updated.
      vault = await optionsContracts[0].getVault(firstOwnerAddress);
      checkVault(vault, '10000000', '0');
    });
  });

  describe('#addERC20Collateral()', () => {
    it('should open ERC20 vault correctly', async () => {
      await optionsContracts[1].openVault({
        from: creatorAddress
      });

      const vault = await optionsContracts[1].getVault(creatorAddress);
      checkVault(vault, '0', '0');
    });

    it('should add ERC20 collateral successfully', async () => {
      const msgValue = '10000000';
      await usdc.approve(optionsContracts[1].address, '10000000000000000');
      const result = await optionsContracts[1].addERC20Collateral(
        creatorAddress,
        msgValue,
        {
          from: creatorAddress
        }
      );

      // Adding ETH should emit an event correctly
      expectEvent(result, 'ERC20CollateralAdded', {
        vaultOwner: creatorAddress,
        amount: msgValue
      });

      // test that the vault's balances have been updated.
      const vault = await optionsContracts[1].getVault(creatorAddress);
      checkVault(vault, msgValue, '0');
    });

    it("shouldn't be able to add ERC20 collateral to a 0x0 address", async () => {
      await usdc.approve(optionsContracts[1].address, '10000000000000000', {
        from: nonOwnerAddress
      });
      const msgValue = '10000000';
      await expectRevert(
        optionsContracts[1].addERC20Collateral(
          '0x0000000000000000000000000000000000000000',
          msgValue,
          {
            from: nonOwnerAddress
          }
        ),
        'Vault does not exist'
      );
    });

    it('should not be able to add ERC20 collateral to non-ERC20 collateralized options contract', async () => {
      try {
        const msgValue = '10000000';
        await optionsContracts[0].addERC20Collateral(firstOwnerAddress, '0', {
          from: firstOwnerAddress,

          value: msgValue
        });
      } catch (err) {
        return;
      }
      truffleAssert.fails('should throw error');
    });

    it('should not be able to add ETH collateral to non-ETH collateralized options contract', async () => {
      try {
        const msgValue = '10000000';

        await optionsContracts[1].addETHCollateral(creatorAddress, {
          from: firstOwnerAddress,

          value: msgValue
        });
      } catch (err) {
        return;
      }
      truffleAssert.fails('should throw error');
    });
  });

  describe('#issueOTokens()', () => {
    it('should allow you to mint correctly', async () => {
      const numTokens = '138888';

      const result = await optionsContracts[0].issueOTokens(
        numTokens,
        creatorAddress,
        {
          from: creatorAddress
        }
      );

      const amtPTokens = await optionsContracts[0].balanceOf(creatorAddress);
      expect(amtPTokens.toString()).to.equal(numTokens);

      // Minting oTokens should emit an event correctly
      expectEvent(result, 'IssuedOTokens', {
        issuedTo: creatorAddress,
        oTokensIssued: numTokens,
        vaultOwner: creatorAddress
      });
    });

    it('only owner should of a vault should be able to mint', async () => {
      const numTokens = '100';
      await expectRevert(
        optionsContracts[0].issueOTokens(numTokens, firstOwnerAddress, {
          from: nonOwnerAddress
        }),
        'Vault does not exist'
      );
    });

    it('should only allow you to mint tokens if you have sufficient collateral', async () => {
      const numTokens = '2';
      await expectRevert(
        optionsContracts[0].issueOTokens(numTokens, creatorAddress, {
          from: creatorAddress
        }),
        'unsafe to mint'
      );

      // the balance of the contract caller should be 0. They should not have gotten tokens.
      const amtPTokens = await optionsContracts[0].balanceOf(creatorAddress);
      expect(amtPTokens.toString()).to.equal('138888');

      const maxLiquidatable = await optionsContracts[0].maxOTokensLiquidatable(
        creatorAddress
      );
      assert.equal(maxLiquidatable, '0');
    });

    it('should be able to issue options in the erc20 contract', async () => {
      const numTokens = '10';
      await optionsContracts[1].issueOTokens(numTokens, creatorAddress, {
        from: creatorAddress
      });

      const amtPTokens = await optionsContracts[1].balanceOf(creatorAddress);
      expect(amtPTokens.toString()).to.equal(numTokens);
    });
  });

  describe('#burnOTokens()', () => {
    it('should be able to burn oTokens', async () => {
      const numTokens = '10';

      const result = await optionsContracts[0].burnOTokens(numTokens, {
        from: creatorAddress
      });
      const amtPTokens = await optionsContracts[0].balanceOf(creatorAddress);
      expect(amtPTokens.toString()).to.equal('138878');

      expectEvent(result, 'BurnOTokens', {
        vaultOwner: creatorAddress,
        oTokensBurned: numTokens
      });
    });

    it('only owner should be able to burn oTokens', async () => {
      await optionsContracts[0].transfer(nonOwnerAddress, '10', {
        from: creatorAddress
      });
      const amtPTokens = await optionsContracts[0].balanceOf(nonOwnerAddress);
      expect(amtPTokens.toString()).to.equal('10');

      const numTokens = '10';

      await expectRevert(
        optionsContracts[0].burnOTokens(numTokens, {
          from: nonOwnerAddress
        }),
        'Vault does not exist'
      );
    });
  });

  describe('#removeCollateral()', () => {
    it('should revert when trying to remove 0 collateral', async () => {
      await expectRevert(
        optionsContracts[0].removeCollateral(0, {
          from: creatorAddress
        }),
        'Cannot remove 0 collateral'
      );
    });

    it('should be able to remove collateral if sufficiently collateralized', async () => {
      const numTokens = '1000';

      const result = await optionsContracts[0].removeCollateral(numTokens, {
        from: firstOwnerAddress
      });

      const vault = await optionsContracts[0].getVault(firstOwnerAddress);
      checkVault(vault, '9999000', '0');

      // TODO: Check that the owner correctly got their collateral back.
      expectEvent(result, 'RemoveCollateral', {
        amtRemoved: numTokens,
        vaultOwner: firstOwnerAddress
      });
    });

    it('only owner should be able to remove collateral', async () => {
      const numTokens = '10';
      await expectRevert(
        optionsContracts[0].removeCollateral(numTokens, {
          from: nonOwnerAddress
        }),
        'Vault does not exist'
      );
    });

    it('should be able to remove more collateral if sufficient collateral', async () => {
      const numTokens = '500';

      const result = await optionsContracts[0].removeCollateral(numTokens, {
        from: creatorAddress
      });

      expectEvent(result, 'RemoveCollateral', {
        amtRemoved: numTokens,
        vaultOwner: creatorAddress
      });

      // Check the contract correctly updated the vault
      const vault = await optionsContracts[0].getVault(creatorAddress);
      checkVault(vault, '19999500', '138878');
    });

    it('should not be able to remove collateral if not sufficient collateral', async () => {
      const numTokens = '20000000';

      await expectRevert(
        optionsContracts[0].removeCollateral(numTokens, {
          from: creatorAddress
        }),
        "Can't remove more collateral than owned"
      );

      // check that the collateral in the vault remains the same
      const vault = await optionsContracts[0].getVault(creatorAddress);
      checkVault(vault, '19999500', '138878');
    });
  });

  describe('#removeUnderlying()', () => {
    it('should revert when caller has no vault', async () => {
      await expectRevert(
        optionsContracts[0].removeUnderlying({
          from: random
        }),
        'Vault does not exist'
      );
    });

    it('should be able to remove underlying if no one has exercised', async () => {
      await expectRevert(
        optionsContracts[0].removeUnderlying({
          from: firstOwnerAddress
        }),
        'No underlying balance.'
      );
    });
  });

  describe('expired OptionContract', () => {
    before(async () => {
      await reverter.revert();

      await optionsContracts[0].openVault({
        from: creatorAddress
      });

      await time.increaseTo(expiry + 2);
    });

    it('should not be able to open a vault in an expired options contract', async () => {
      await expectRevert(
        optionsContracts[0].openVault({
          from: creatorAddress
        }),
        'Options contract expired'
      );
    });

    it('should not be able to add ETH collateral to an expired options contract', async () => {
      await expectRevert(
        optionsContracts[0].addETHCollateral(firstOwnerAddress, {
          from: firstOwnerAddress,
          value: '10000000'
        }),
        'Options contract expired'
      );
    });

    it('should not be able to add ERC20 collateral to an expired options contract', async () => {
      await expectRevert(
        optionsContracts[1].addETHCollateral(creatorAddress, {
          from: creatorAddress,
          value: '10000000'
        }),
        'Options contract expired'
      );
    });
    describe('#harvest', () => {
      const amount = '100000000';
      let otoken: OptionsContractInstance;
      let bonusToken: MockErc20Instance;
      before('contract setup', async () => {
        const now = (await time.latest()).toNumber();
        expiry = now + time.duration.days(30).toNumber();
        windowSize = expiry;
        otoken = await OptionsContract.new(
          weth.address,
          dai.address,
          usdc.address,
          -'17',
          '90',
          -'18',
          expiry,
          windowSize,
          oracle.address,
          {from: creatorAddress}
        );
        bonusToken = await MockERC20.new('BONUS', 'BONUS', 18);

        await bonusToken.mint(otoken.address, amount);
      });

      it('should revert trying to harvest collateral token', async () => {
        weth.mint(otoken.address, amount);
        await expectRevert(
          otoken.harvest(weth.address, amount, {
            from: creatorAddress
          }),
          "Owner can't harvest this token"
        );
      });

      it('should revert trying to harvest underlying token', async () => {
        dai.mint(otoken.address, amount);
        await expectRevert(
          otoken.harvest(dai.address, amount, {
            from: creatorAddress
          }),
          "Owner can't harvest this token"
        );
      });

      it('should revert trying to harvest strike token', async () => {
        usdc.mint(otoken.address, amount);
        await expectRevert(
          otoken.harvest(usdc.address, amount, {
            from: creatorAddress
          }),
          "Owner can't harvest this token"
        );
      });

      it('should revert when someone esle than owner call harvest', async () => {
        await expectRevert(
          otoken.harvest(bonusToken.address, amount, {
            from: firstOwnerAddress
          }),
          'Ownable: caller is not the owner.'
        );
      });

      it('should remove bonus token from the contract', async () => {
        const contractBalanceBefore = await bonusToken.balanceOf(
          otoken.address
        );
        const ownerBalanceBefore = await bonusToken.balanceOf(creatorAddress);

        await otoken.harvest(bonusToken.address, amount, {
          from: creatorAddress
        });

        const contractBalanceAfter = await bonusToken.balanceOf(otoken.address);
        const ownerBalanceAfter = await bonusToken.balanceOf(creatorAddress);

        assert.equal(
          contractBalanceBefore.toString(),
          contractBalanceAfter.add(new BN(amount)).toString()
        );

        assert.equal(
          ownerBalanceAfter.toString(),
          ownerBalanceBefore.add(new BN(amount)).toString()
        );
      });
    });
  });
});

import {expect} from 'chai';
import {
  Erc20MintableInstance,
  OptionsFactoryInstance,
  MockCompoundOracleInstance,
  OptionsContractInstance
} from '../build/types/truffle-types';

const OptionsCotract = artifacts.require('OptionsContract');
const OptionsFactory = artifacts.require('OptionsFactory');
const MockCompoundOracle = artifacts.require('MockCompoundOracle');
const MintableToken = artifacts.require('ERC20Mintable');

const truffleAssert = require('truffle-assertions');

import Reverter from './utils/reverter';

import {checkVault} from './utils/helper';
const {time, expectEvent, expectRevert} = require('@openzeppelin/test-helpers');

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

// Initialize the Options Factory, Options Exchange and other mock contracts
contract('OptionsContract', accounts => {
  const reverter = new Reverter(web3);

  const [
    creatorAddress,
    firstOwnerAddress,
    nonOwnerAddress,
    fakeExchange,
    random
  ] = accounts;

  const optionsContracts: OptionsContractInstance[] = [];
  let optionsFactory: OptionsFactoryInstance;
  let oracle: MockCompoundOracleInstance;
  let dai: Erc20MintableInstance;
  let usdc: Erc20MintableInstance;

  let expiry: number;
  let windowSize: number;

  before('set up contracts', async () => {
    const now = (await time.latest()).toNumber();
    expiry = now + time.duration.days(30).toNumber();
    windowSize = expiry;
    // 1. Deploy mock contracts
    // 1.1 Compound Oracle
    oracle = await MockCompoundOracle.new();

    // 1.2 Mock Dai contract
    dai = await MintableToken.new();
    await dai.mint(creatorAddress, '10000000');

    // 1.3 Mock USDC contract
    usdc = await MintableToken.new();
    await usdc.mint(creatorAddress, '10000000');
    await usdc.mint(nonOwnerAddress, '10000000');

    // 2. Deploy our contracts
    // deploys the Options Exhange contract

    // Deploy the Options Factory contract and add assets to it
    optionsFactory = await OptionsFactory.deployed();

    await optionsFactory.addAsset('DAI', dai.address);
    await optionsFactory.addAsset('USDC', usdc.address);

    // Create the unexpired options contract
    let optionsContractResult = await optionsFactory.createOptionsContract(
      'ETH',
      -'18',
      'DAI',
      -'18',
      -'17',
      '90',
      -'18',
      'ETH',
      expiry,
      windowSize,
      {from: creatorAddress}
    );

    let optionsContractAddr = optionsContractResult.logs[1].args[0];
    optionsContracts.push(await OptionsCotract.at(optionsContractAddr));

    optionsContractResult = await optionsFactory.createOptionsContract(
      'USDC',
      -'18',
      'DAI',
      -'18',
      -'17',
      '90',
      -'18',
      'USDC',
      expiry,
      windowSize,
      {from: creatorAddress}
    );

    optionsContractAddr = optionsContractResult.logs[1].args[0];
    const ERC20collateralOptContract = await OptionsCotract.at(
      optionsContractAddr
    );
    optionsContracts.push(ERC20collateralOptContract);

    await reverter.snapshot();
  });

  describe('#constructor', () => {
    it('should revert when deploying expired options', async () => {
      const expiry = (await time.latest()) - 100;
      await expectRevert(
        OptionsCotract.new(
          usdc.address,
          -'18',
          dai.address,
          -'18',
          -'17',
          '90',
          -'18',
          usdc.address,
          expiry,
          fakeExchange,
          oracle.address,
          windowSize
        ),
        "Can't deploy an expired contract"
      );
    });

    it('should revert with invalid window and expiry', async () => {
      await expectRevert(
        OptionsCotract.new(
          usdc.address,
          -'18',
          dai.address,
          -'18',
          -'17',
          '90',
          -'18',
          usdc.address,
          expiry,
          fakeExchange,
          oracle.address,
          expiry + 1
        ),
        "Exercise window can't be longer than the contract's lifespan"
      );
    });

    it('should revert with invalid collateral exponent range', async () => {
      await expectRevert(
        OptionsCotract.new(
          usdc.address,
          -'31',
          dai.address,
          -'18',
          -'17',
          '90',
          -'18',
          usdc.address,
          expiry,
          fakeExchange,
          oracle.address,
          expiry
        ),
        'collateral exponent not within expected range'
      );
    });

    it('should revert with invalid underlying exponent range', async () => {
      await expectRevert(
        OptionsCotract.new(
          usdc.address,
          -'18',
          dai.address,
          -'31',
          -'17',
          '90',
          -'18',
          usdc.address,
          expiry,
          fakeExchange,
          oracle.address,
          expiry
        ),
        'underlying exponent not within expected range'
      );
    });

    it('should revert with invalid strike price exponent range', async () => {
      await expectRevert(
        OptionsCotract.new(
          usdc.address,
          -'18',
          dai.address,
          -'18',
          -'17',
          '90',
          -'31',
          usdc.address,
          expiry,
          fakeExchange,
          oracle.address,
          expiry
        ),
        'strike price exponent not within expected range'
      );
    });

    it('should revert with invalid oTokenExchangeExp range', async () => {
      await expectRevert(
        OptionsCotract.new(
          usdc.address,
          -'18',
          dai.address,
          -'18',
          -'31',
          '90',
          -'18',
          usdc.address,
          expiry,
          fakeExchange,
          oracle.address,
          expiry
        ),
        'oToken exchange rate exponent not within expected range'
      );
    });

    it('should create a option with eth as collateral, strike, underlying ', async () => {
      await OptionsCotract.new(
        ZERO_ADDRESS,
        -'18',
        ZERO_ADDRESS,
        -'18',
        -'18',
        '90',
        -'18',
        ZERO_ADDRESS,
        expiry,
        fakeExchange,
        oracle.address,
        expiry
      );
    });
  });

  describe('#updateParameter()', () => {
    let option: OptionsContractInstance;
    before('Create a test option', async () => {
      option = await OptionsCotract.new(
        ZERO_ADDRESS,
        -18,
        usdc.address,
        -6,
        -6,
        4, // strike price
        -9, // strike price exp
        ZERO_ADDRESS,
        expiry,
        fakeExchange,
        oracle.address,
        expiry,
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
    // it('should open first vault correctly', async () => {
    //   const result = await optionsContracts[0].openVault({
    //     from: creatorAddress
    //   });
    //   // test getVault
    //   const vault = await optionsContracts[0].getVault(creatorAddress);
    //   expect(vault['0'].toString()).to.equal('0');
    //   expect(vault['1'].toString()).to.equal('0');
    //   expect(vault['2'].toString()).to.equal('0');
    //   expect(vault['3']).to.equal(true);
    //   // check proper events emitted
    //   expect(result.logs[0].event).to.equal('VaultOpened');
    // });
    // it("shouldn't allow to open second vault correctly", async () => {
    //   await expectRevert(
    //     optionsContracts[0].openVault({
    //       from: creatorAddress
    //     }),
    //     'Vault already created'
    //   );
    // });
    // it('new person should be able to open third vault correctly', async () => {
    //   await optionsContracts[0].openVault({
    //     from: firstOwnerAddress
    //   });
    //   // test getVault
    //   const vault = await optionsContracts[0].getVault(firstOwnerAddress);
    //   expect(vault['0'].toString()).to.equal('0');
    //   expect(vault['1'].toString()).to.equal('0');
    //   expect(vault['2'].toString()).to.equal('0');
    //   expect(vault['3']).to.equal(true);
    // });
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
      try {
        await optionsContracts[0].issueOTokens(numTokens, creatorAddress, {
          from: creatorAddress
        });
      } catch (err) {
        return;
      }

      truffleAssert.fails('should throw error');

      // the balance of the contract caller should be 0. They should not have gotten tokens.
      const amtPTokens = await optionsContracts[0].balanceOf(creatorAddress);
      expect(amtPTokens.toString()).to.equal('138888');
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
      const numTokens = '7000';

      try {
        await optionsContracts[0].removeCollateral(numTokens, {
          from: creatorAddress
        });
      } catch (err) {
        return;
      }

      truffleAssert.fails('should throw error');

      // check that the collateral in the vault remains the same
      const vault = await optionsContracts[0].getVault(creatorAddress);
      checkVault(vault, '19999500', '138878');
    });
  });

  // describe('Otoken tests', () => {
  //   it('should be able to create a new Vault, add ETH collateral and issue maxOTokensIssuable', async () => {
  //     const collateral = '20000000';
  //     const numOptions = (
  //       await optionsContracts[0].maxOTokensIssuable(collateral)
  //     ).toString();

  //     const result = await optionsContracts[0].createETHCollateralOption(
  //       numOptions,
  //       nonOwnerAddress,
  //       {
  //         from: nonOwnerAddress,
  //         value: collateral
  //       }
  //     );

  //     expectEvent(result, 'VaultOpened', {
  //       vaultOwner: nonOwnerAddress
  //     });

  //     expectEvent(result, 'ETHCollateralAdded', {
  //       vaultOwner: nonOwnerAddress,
  //       amount: collateral,
  //       payer: nonOwnerAddress
  //     });

  //     expectEvent(result, 'IssuedOTokens', {
  //       issuedTo: nonOwnerAddress,
  //       oTokensIssued: numOptions,
  //       vaultOwner: nonOwnerAddress
  //     });
  //   });

  //   it('should be able to create a new Vault, add ERC20 collateral and issue oTokens', async () => {
  //     const collateral = '20000000';
  //     const numOptions = (
  //       await optionsContracts[1].maxOTokensIssuable(collateral)
  //     ).toString();

  //     await usdc.mint(nonOwnerAddress, '20000000');
  //     await usdc.approve(optionsContracts[1].address, '10000000000000000', {
  //       from: nonOwnerAddress
  //     });

  //     const result = await optionsContracts[1].createERC20CollateralOption(
  //       numOptions,
  //       collateral,
  //       nonOwnerAddress,
  //       {
  //         from: nonOwnerAddress
  //       }
  //     );

  //     expectEvent(result, 'VaultOpened', {
  //       vaultOwner: nonOwnerAddress
  //     });

  //     expectEvent(result, 'ERC20CollateralAdded', {
  //       vaultOwner: nonOwnerAddress,
  //       amount: collateral,
  //       payer: nonOwnerAddress
  //     });

  //     expectEvent(result, 'IssuedOTokens', {
  //       issuedTo: nonOwnerAddress,
  //       oTokensIssued: numOptions,
  //       vaultOwner: nonOwnerAddress
  //     });
  //   });
  // });

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
  });
});

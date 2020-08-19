import {
  OptionsFactoryInstance,
  OTokenInstance,
  MockErc20Instance,
  MockOracleInstance
} from '../../build/types/truffle-types';

import BigNumber from 'bignumber.js';
const {
  time,
  ether,
  expectRevert,
  expectEvent
} = require('@openzeppelin/test-helpers');

const OTokenContract = artifacts.require('oToken');
const OptionsFactory = artifacts.require('OptionsFactory');
const MockOracle = artifacts.require('MockOracle');
const MockERC20 = artifacts.require('MockERC20');

import Reverter from '../utils/reverter';
import {ZERO_ADDRESS} from '../utils/helper';

contract('OptionsContract: Aave insurance', accounts => {
  const reverter = new Reverter(web3);

  const creatorAddress = accounts[0];
  const firstOwner = accounts[1];
  const tokenHolder = accounts[2];

  let optionsFactory: OptionsFactoryInstance;
  let oaUSDT: OTokenInstance;
  let oracle: MockOracleInstance;
  let ausdt: MockErc20Instance;
  let usdt: MockErc20Instance;

  const _name = 'Aave USDT insurance';
  const _symbol = 'oaUSDT';

  before('set up contracts', async () => {
    const now = (await time.latest()).toNumber();
    const expiry = now + time.duration.days(30).toNumber();
    const windowSize = expiry; // time.duration.days(1).toNumber();

    // 1. Deploy mock contracts
    // 1.1 Compound Oracle
    oracle = await MockOracle.deployed();
    // oracle = MockOracle.at()

    // 1.2 Mock aUSDT contract
    ausdt = await MockERC20.new('Aave USDC', 'aUSDC', 6);
    await ausdt.mint(creatorAddress, '1000000000'); // 1000 ausdt
    await ausdt.mint(firstOwner, '1000000000');
    await ausdt.mint(tokenHolder, '1000000000');

    // 1.3 Mock USDT contract
    usdt = await MockERC20.new('USDT', 'USDT', 6);

    // 2. Deploy the Options Factory contract and add assets to it
    optionsFactory = await OptionsFactory.deployed();

    await optionsFactory.whitelistAsset(ZERO_ADDRESS);
    await optionsFactory.whitelistAsset(ausdt.address);
    await optionsFactory.whitelistAsset(usdt.address);

    // Create the unexpired options contract
    const optionsContractResult = await optionsFactory.createOptionsContract(
      ZERO_ADDRESS,
      ausdt.address,
      usdt.address,
      -6,
      950,
      -9,
      expiry,
      windowSize,
      _name,
      _symbol,
      {from: creatorAddress}
    );

    const optionsContractAddr = optionsContractResult.logs[1].args[0];
    oaUSDT = await OTokenContract.at(optionsContractAddr);

    await reverter.snapshot();
  });

  describe('New option parameter test', () => {
    it('should have basic setting', async () => {
      await oaUSDT.setDetails(_name, _symbol, {
        from: creatorAddress
      });

      assert.equal(await oaUSDT.name(), String(_name), 'set name error');
      assert.equal(await oaUSDT.symbol(), String(_symbol), 'set symbol error');
    });

    it('should update parameters', async () => {
      // await oaUSDT.updateParameters('100', '500', 0, 16, {from: creatorAddress});
    });

    it('should open empty vault', async () => {
      await oaUSDT.openVault({
        from: creatorAddress
      });
      const vault = await oaUSDT.getVault(creatorAddress);
      assert.equal(vault[0].toString(), '0');
      assert.equal(vault[1].toString(), '0');
      assert.equal(vault[2].toString(), '0');
    });

    it('should add ETH collateral successfully', async () => {
      await oaUSDT.addETHCollateral(creatorAddress, {
        from: creatorAddress,
        value: ether('1')
      });

      // test that the vault's balances have been updated.
      const vault = await oaUSDT.getVault(creatorAddress);
      assert.equal(vault[0].toString(), ether('1'));
      assert.equal(vault[1].toString(), '0');
      assert.equal(vault[2].toString(), '0');
    });

    it('should add ETH collateral and Mint', async () => {
      await oracle.updatePrice('4000000000000000'); // eth price 250, 1 usdt = 0.004 eth
      const amountToIssue = new BigNumber(250)
        .div(new BigNumber(1.6))
        .div(new BigNumber(0.95))
        .times(new BigNumber(10).exponentiatedBy(6))
        .integerValue();
      await expectRevert(
        oaUSDT.createETHCollateralOption(
          amountToIssue.plus(1).toString(),
          firstOwner,
          {
            from: firstOwner,
            value: ether('1')
          }
        ),
        'unsafe to mint'
      );

      await oaUSDT.createETHCollateralOption(
        amountToIssue.toString(),
        firstOwner,
        {
          from: firstOwner,
          value: ether('1')
        }
      );

      // test that the vault's balances have been updated.
      const vault = await oaUSDT.getVault(firstOwner);
      assert.equal(vault[0].toString(), ether('1'));
      assert.equal(vault[1].toString(), amountToIssue.toString());
      assert.equal(vault[2].toString(), '0');
    });

    it('should not exercise without underlying allowance', async () => {
      await oaUSDT.transfer(tokenHolder, '80000000', {from: firstOwner}); // transfer 80 oaUSDT
      await oracle.updatePrice('4000000000000000'); // eth price 250, 1 usdt = 0.004 eth

      await expectRevert(
        oaUSDT.exercise('40000000', [firstOwner], {
          from: tokenHolder
        }),
        'transfer amount exceeds allowance.'
      );
    });

    it('should be able to exercise', async () => {
      const amountToExercise = '40000000';
      const underlyingRequired = (
        await oaUSDT.underlyingRequiredToExercise(amountToExercise)
      ).toString();

      await ausdt.approve(oaUSDT.address, underlyingRequired, {
        from: tokenHolder
      });

      const exerciseTx = await oaUSDT.exercise(amountToExercise, [firstOwner], {
        from: tokenHolder
      });

      expectEvent(exerciseTx, 'Exercise', {
        amtUnderlyingToPay: underlyingRequired,
        amtCollateralToPay: '152000000000000000'
      });

      // test that the vault's balances have been updated.
      const vault = await oaUSDT.getVault(firstOwner);
      assert.equal(vault[0].toString(), '848000000000000000');
      assert.equal(vault[1].toString(), '124473684');
      assert.equal(vault[2].toString(), underlyingRequired);
    });
  });
});

// // mainnet fork

// const admin = '0x9e68b67660c223b3e0634d851f5df821e0e17d84';
// const aUSDTAddress = '0x71fc860f7d3a592a4a98740e39db31d25db65ae8';
// const USDTAddress = '0xdac17f958d2ee523a2206206994597c13d831ec7';
// const USDCAddress = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';

// contract('Aave aUSDT:USDT insurance', async accounts => {
//   let oaUSDTToken: OTokenInstance;
//   let optionContract: OptionsContractInstance;
//   let oracle: OracleInstance;

//   const _name = 'Aave USDT insurance';
//   const _symbol = 'oaUSDT';

//   const now = Date.now();
//   const expiry = getUnixTime(addMonths(now, 12));
//   const windowSize = expiry;
//   before('setup transfer account asset', async () => {
//     // setup optionsContract
//     const optionFactoryContract: OptionsFactoryInstance = await OptionsFactory.at(
//       '0xcc5d905b9c2c8c9329eb4e25dc086369d6c7777c'
//     );
//     // add asset
//     if ((await optionFactoryContract.tokens('USDT')) === ZERO_ADDRESS) {
//       await optionFactoryContract.updateAsset('USDT', USDTAddress, {
//         from: admin
//       });
//     }
//     if ((await optionFactoryContract.tokens('aUSDT')) === ZERO_ADDRESS) {
//       await optionFactoryContract.updateAsset('aUSDT', aUSDTAddress, {
//         from: admin
//       });
//     }

//     if ((await optionFactoryContract.tokens('USDC')) === ZERO_ADDRESS) {
//       await optionFactoryContract.updateAsset('USDC', USDCAddress, {
//         from: admin
//       });
//     }

//     const {logs} = await optionFactoryContract.createOptionsContract(
//       'ETH',
//       -18,
//       'aUSDT',
//       -6,
//       -6,
//       1,
//       -6,
//       'USDC',
//       windowSize,
//       windowSize,
//       {from: accounts[0], gas: '4000000'}
//     );
//     const newOptionAddress = logs[1].args[0];
//     console.log(`newOptionAddr`, newOptionAddress);

//     optionContract = await OptionsContract.at(newOptionAddress);
//     oaUSDTToken = await OTokenContract.at(newOptionAddress);

//     await oaUSDTToken.setDetails(_name, _symbol, {
//       from: admin
//     });
//   });

//   it('should have basic setting', async () => {
//     assert.equal(
//       await oaUSDTToken.name(),
//       String(_name),
//       'invalid strike price'
//     );

//     assert.equal(
//       await oaUSDTToken.symbol(),
//       String(_symbol),
//       'invalid strike price'
//     );
//   });

//   it('should be able to open empty vault', async () => {
//     // const name = await optionContract.name();
//     await oaUSDTToken.openVault({from: accounts[0]});
//     const vault = await oaUSDTToken.getVault(accounts[0]);
//     assert.equal(vault[0].toString(), '0');
//     assert.equal(vault[1].toString(), '0');
//     assert.equal(vault[2].toString(), '0');
//   });

//   it('should be able to open vault and add collateral', async () => {
//     const user = accounts[1];
//     const amountToIssue = '100000000';
//     await oaUSDTToken.createETHCollateralOption(amountToIssue, user, {
//       from: user,
//       value: ether('1')
//     });
//     const vault = await oaUSDTToken.getVault(user);
//     assert.equal(vault[0].toString(), ether('1'));
//     assert.equal(vault[1].toString(), amountToIssue);
//     assert.equal(vault[2].toString(), '0');
//   });
// });

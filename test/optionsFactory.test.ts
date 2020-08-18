import {expect} from 'chai';
import {OptionsFactoryInstance} from '../build/types/truffle-types';

const Web3Utils = require('web3-utils');
const OptionsFactory = artifacts.require('OptionsFactory');
const OptionsContract = artifacts.require('OptionsContract');

import {getUnixTime, addSeconds, fromUnixTime} from 'date-fns';

const {expectRevert, expectEvent, time} = require('@openzeppelin/test-helpers');

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

contract(
  'OptionsFactory',
  ([
    creatorAddress,
    firstOwnerAddress,
    DAIAddress,
    BATAddress,
    BATAddress2,
    USDCAddress,
    WEIRDToken,
    random
  ]) => {
    let optionsFactory: OptionsFactoryInstance;

    let expiry: number;
    let windowSize: number;

    before(async () => {
      const now = (await time.latest()).toNumber();
      expiry = now + time.duration.days(30).toNumber();
      windowSize = expiry;
      optionsFactory = await OptionsFactory.deployed();
      // 1. Deploy our contracts
      // deploys the Options Exhange contract

      // Deploy the Options Factory contract and add assets to it
      optionsFactory = await OptionsFactory.deployed();
    });

    describe('#updateAsset()', () => {
      it('should add an asset correctly', async () => {
        const txInfo = await optionsFactory.updateAsset('DAI', DAIAddress);
        expectEvent(txInfo, 'AssetUpdated', {
          asset: Web3Utils.keccak256('DAI'),
          newAddr: DAIAddress
        });
        const supported = await optionsFactory.supportsAsset('DAI');

        expect(supported).to.be.true;
      });

      it('should add a second asset', async () => {
        const txInfo = await optionsFactory.updateAsset('BAT', BATAddress);
        expectEvent(txInfo, 'AssetUpdated', {
          asset: Web3Utils.keccak256('BAT'),
          newAddr: BATAddress
        });
        const supported = await optionsFactory.supportsAsset('BAT');

        expect(supported).to.be.true;
      });

      it('should fails if anyone but owner tries to add asset', async () => {
        await expectRevert(
          optionsFactory.updateAsset(
            'ETH',
            '0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359',
            {from: random}
          ),
          'Ownable: caller is not the owner'
        );
      });
    });

    describe('#updateAsset()', () => {
      it('should change an asset that exists correctly', async () => {
        const txInfo = await optionsFactory.updateAsset('BAT', BATAddress2);
        expectEvent(txInfo, 'AssetUpdated', {
          asset: Web3Utils.keccak256('BAT'),
          newAddr: BATAddress2
        });
      });

      it('should revert if anyone but owner tries to change asset', async () => {
        await expectRevert(
          optionsFactory.updateAsset('BAT', BATAddress, {from: random}), // try change it back to BATAddr
          'Ownable: caller is not the owner'
        );
      });
    });

    describe('#createOptionsContract()', () => {
      it('should not allow to create an expired new options contract', async () => {
        const expiredExpiry = '660009600'; // 1990/12/01

        await expectRevert(
          optionsFactory.createOptionsContract(
            'ETH',
            -'18',
            'ETH',
            -'18',
            -'17',
            '90',
            -'18',
            'ETH',
            expiredExpiry,
            expiredExpiry,
            {from: creatorAddress}
          ),
          'Cannot create an expired option'
        );
      });

      it('should not allow to create a new options contract where windowSize is bigger than expiry', async () => {
        const bigWindowSize = getUnixTime(addSeconds(fromUnixTime(expiry), 1));

        await expectRevert(
          optionsFactory.createOptionsContract(
            'ETH',
            -'18',
            'ETH',
            -'18',
            -'17',
            '90',
            -'18',
            'ETH',
            expiry,
            bigWindowSize,
            {from: creatorAddress}
          ),
          'Invalid _windowSize'
        );
      });

      it('should not allow to create a new options with unsupported collateral', async () => {
        await expectRevert(
          optionsFactory.createOptionsContract(
            'WRONG',
            -'18',
            'ETH',
            -'18',
            -'17',
            '90',
            -'18',
            'ETH',
            expiry,
            expiry,
            {from: creatorAddress}
          ),
          'Collateral type not supported'
        );
      });

      it('should not allow to create a new options with unsupported underlying', async () => {
        await expectRevert(
          optionsFactory.createOptionsContract(
            'ETH',
            -'18',
            'WRONG',
            -'18',
            -'17',
            '90',
            -'18',
            'ETH',
            expiry,
            expiry,
            {from: creatorAddress}
          ),
          'Underlying type not supported'
        );
      });

      it('should not allow to create a new options with unsupported strike', async () => {
        await expectRevert(
          optionsFactory.createOptionsContract(
            'ETH',
            -'18',
            'ETH',
            -'18',
            -'17',
            '90',
            -'18',
            'WRONG',
            expiry,
            expiry,
            {from: creatorAddress}
          ),
          'Strike asset type not supported'
        );
      });

      it('should create a new options contract correctly', async () => {
        const txInfo = await optionsFactory.createOptionsContract(
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

        // Test that the Factory stores addresses of any new options contract added.
        const index = (
          await optionsFactory.getNumberOfOptionsContracts()
        ).toNumber();
        const lastAdded = await optionsFactory.optionsContracts(index - 1);
        expectEvent(txInfo, 'OptionsContractCreated', {
          addr: lastAdded
        });
      });
      it('anyone else should be able to create a second options contract correctly', async () => {
        const txInfo = await optionsFactory.createOptionsContract(
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
          {from: firstOwnerAddress}
        );

        // Test that the Factory stores addresses of any new options contract added.
        const index = (
          await optionsFactory.getNumberOfOptionsContracts()
        ).toNumber();
        const lastAdded = await optionsFactory.optionsContracts(index - 1);

        expectEvent(txInfo, 'OptionsContractCreated', {
          addr: lastAdded
        });

        // Check the ownership
        const ownerFactory = await optionsFactory.owner();
        expect(ownerFactory).to.equal(creatorAddress);

        // TODO: check that the ownership of the options contract is the creator address
        // const optionsContractAddr = result.logs[1].args[0];
        const optionContract = await OptionsContract.at(lastAdded);

        const optionContractOwner = await optionContract.owner();
        expect(optionContractOwner).to.equal(creatorAddress);
      });
    });
  }
);

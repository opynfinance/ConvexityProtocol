import {expect} from 'chai';
import {
  OptionsFactoryInstance,
  MockErc20Instance
} from '../build/types/truffle-types';

const OptionsFactory = artifacts.require('OptionsFactory');
const OptionsContract = artifacts.require('OptionsContract');
const MockERC20 = artifacts.require('MockERC20');

import {getUnixTime, addSeconds, fromUnixTime} from 'date-fns';

const {expectRevert, expectEvent, time} = require('@openzeppelin/test-helpers');

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

contract('OptionsFactory', ([creatorAddress, firstOwnerAddress, random]) => {
  let optionsFactory: OptionsFactoryInstance;

  let expiry: number;
  let windowSize: number;
  let dai: MockErc20Instance;

  before(async () => {
    const now = (await time.latest()).toNumber();
    expiry = now + time.duration.days(30).toNumber();
    windowSize = expiry;
    optionsFactory = await OptionsFactory.deployed();
    dai = await MockERC20.new('DAI', 'DAI', 18);
  });

  describe('#createOptionsContract()', () => {
    it('should not allow to create an expired new options contract', async () => {
      const expiredExpiry = '660009600'; // 1990/12/01

      await expectRevert(
        optionsFactory.createOptionsContract(
          ZERO_ADDRESS,
          ZERO_ADDRESS,
          ZERO_ADDRESS,
          -'17',
          '90',
          -'18',
          expiredExpiry,
          expiredExpiry,
          'Opyn Token',
          'oETH',
          {from: creatorAddress}
        ),
        'Cannot create an expired option'
      );
    });

    it('should not allow to create a new options contract where windowSize is bigger than expiry', async () => {
      const bigWindowSize = getUnixTime(addSeconds(fromUnixTime(expiry), 1));

      await expectRevert(
        optionsFactory.createOptionsContract(
          ZERO_ADDRESS,
          ZERO_ADDRESS,
          ZERO_ADDRESS,
          -'17',
          '90',
          -'18',
          expiry,
          bigWindowSize,
          'Opyn Token',
          'oETH',
          {from: creatorAddress}
        ),
        'Invalid _windowSize'
      );
    });

    it('should create a new options contract correctly', async () => {
      const txInfo = await optionsFactory.createOptionsContract(
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
        ZERO_ADDRESS,
        dai.address,
        ZERO_ADDRESS,
        -'18',
        '90',
        -'18',
        expiry,
        windowSize,
        'Opyn Token',
        'oDAI',
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

      // TODO: check that the ownership of the options contract is the creator address
      // const optionsContractAddr = result.logs[0].args[0];
      const optionContract = await OptionsContract.at(lastAdded);

      // Check the ownership

      const optionContractOwner = await optionContract.owner();
      expect(optionContractOwner).to.equal(firstOwnerAddress);
    });
  });
});

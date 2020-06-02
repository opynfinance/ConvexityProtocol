import {
  ERC20MintableInstance,
  // MockCompoundOracleInstance,
  OptionsContractInstance,
  // OptionsExchangeInstance,
  OptionsFactoryInstance
} from '../build/types/truffle-types';

import BigNumber from 'bignumber.js';
import {getUnixTime, addMonths} from 'date-fns';

const OptionsContract = artifacts.require('OptionsContract');
const OptionsFactory = artifacts.require('OptionsFactory');
// const OptionsExchange = artifacts.require('OptionsExchange');
// const MockCompoundOracle = artifacts.require('MockCompoundOracle');
const MintableToken = artifacts.require('ERC20Mintable');

const {expectRevert, ether, time} = require('@openzeppelin/test-helpers');

function calculateMaxOptionsToCreate(
  collateral: number,
  collateralToStrikePrice: number,
  minminCollateralizationRatio: number,
  strikePrice: number
): number {
  return Math.floor(
    (collateral * collateralToStrikePrice) /
      (minminCollateralizationRatio * strikePrice)
  );
}

// function calculateCollateralToPay(
//   proportion: number,
//   strikePrice: number,
//   strikeToCollateralPrice: number,
//   oTokens: number
// ): number {
//   return Math.floor(
//     (proportion * strikePrice * strikeToCollateralPrice * oTokens) / 10 ** 27
//   );
// }

contract(
  'ETH Call Option',
  ([
    opynDeployer,
    vaultOwner1,
    vaultOwner2,
    vaultOwner3,
    buyer1,
    buyer2,
    random
  ]) => {
    let optionContract: OptionsContractInstance;
    let optionsFactory: OptionsFactoryInstance;
    // let optionsExchange: OptionsExchangeInstance;
    // let compoundOracle: MockCompoundOracleInstance;
    let usdc: ERC20MintableInstance;

    const _name = 'test call option $200';
    const _symbol = 'test oETH $200';
    const _collateralType = 'ETH';
    const _collateralExp = -18;
    const _underlyingType = 'USDC';
    const _underlyingExp = -6;
    const _oTokenExchangeExp = -6;
    const _strikePrice = 5;
    const _strikeExp = -9;
    const _strikeAsset = 'ETH';
    const now = Date.now();

    const _expiry = getUnixTime(addMonths(now, 1));
    const _windowSize = _expiry;
    const _liquidationIncentiveValue = 0;
    //const _liquidationIncentiveExp = -3;
    const _liquidationFactorValue = 0;
    //const _liquidationFactorExp = -3;
    const _transactionFeeValue = 0;
    //const _transactionFeeExp = -3;
    const _minCollateralizationRatioValue = 10;
    const _minCollateralizationRatioExp = -1;

    const mintedAmount = ether('500');
    const ethCollateralToAdd = ether('10');

    before('set up contracts', async () => {
      // deploy compound oracle mock
      // compoundOracle = await MockCompoundOracle.deployed();

      // usdc token
      usdc = await MintableToken.new();

      // get deployed opyn protocol contracts

      // Options Exhange contract
      // optionsExchange = await OptionsExchange.deployed();

      // Options Factory contract and add assets to it
      optionsFactory = await OptionsFactory.deployed();

      // add assets to the factory
      await optionsFactory.addAsset('USDC', usdc.address, {from: opynDeployer});

      // create ETH call option
      const optionsContractResult = await optionsFactory.createOptionsContract(
        _collateralType,
        _collateralExp,
        _underlyingType,
        _underlyingExp,
        _oTokenExchangeExp,
        _strikePrice,
        _strikeExp,
        _strikeAsset,
        _expiry,
        _windowSize,
        {from: opynDeployer}
      );

      optionContract = await OptionsContract.at(
        optionsContractResult.logs[1].args[0]
      );

      // set option details
      await optionContract.setDetails(_name, _symbol, {from: opynDeployer});

      // set option params
      await optionContract.updateParameters(
        _liquidationIncentiveValue,
        _liquidationFactorValue,
        _transactionFeeValue,
        _minCollateralizationRatioValue,
        {from: opynDeployer}
      );

      // mint money for everyone
      await usdc.mint(opynDeployer, mintedAmount);
      await usdc.mint(vaultOwner1, mintedAmount);
      await usdc.mint(vaultOwner2, mintedAmount);
      await usdc.mint(vaultOwner3, mintedAmount);
      await usdc.mint(buyer1, mintedAmount);
      await usdc.mint(buyer2, mintedAmount);
    });

    describe('Check deployment', () => {
      it('check deployment config', async () => {
        assert.equal(await optionContract.name(), _name, 'invalid name');
        assert.equal(await optionContract.symbol(), _symbol, 'invalid symbol');
        assert.equal(
          await optionContract.collateral(),
          await optionsFactory.tokens(_collateralType),
          'invalid collateral'
        );
        assert.equal(
          (await optionContract.collateralExp()).toString(),
          String(_collateralExp),
          'invalid collateral exponent'
        );
        assert.equal(
          await optionContract.underlying(),
          await optionsFactory.tokens(_underlyingType),
          'invalid underlying'
        );
        assert.equal(
          (await optionContract.underlyingExp()).toString(),
          String(_underlyingExp),
          'invalid underlying exponent'
        );
        assert.equal(
          (await optionContract.oTokenExchangeRate())[1].toString(),
          String(_oTokenExchangeExp),
          'invalid oToken exchange rate'
        );
        assert.equal(
          (await optionContract.strikePrice())[0].toString(),
          String(_strikePrice),
          'invalid strike price'
        );
        assert.equal(
          (await optionContract.strikePrice())[1].toString(),
          String(_strikeExp),
          'invalid strike exponent'
        );
        assert.equal(
          await optionContract.strike(),
          await optionsFactory.tokens(_strikeAsset),
          'invalid strike asset'
        );
        assert.equal(
          (await optionContract.expiry()).toString(),
          String(_expiry),
          'invalid expiry'
        );
      });
    });

    describe('Open vault', () => {
      it('open vault', async () => {
        // owner 1
        await optionContract.openVault({
          from: vaultOwner1
        });

        // owner 2
        await optionContract.openVault({
          from: vaultOwner2
        });

        // owner 3
        await optionContract.openVault({
          from: vaultOwner3
        });

        assert.equal(
          await optionContract.hasVault(vaultOwner1),
          true,
          'error creating vault for owner1'
        );
        assert.equal(
          await optionContract.hasVault(vaultOwner2),
          true,
          'error creating vault for owner2'
        );
        assert.equal(
          await optionContract.hasVault(vaultOwner3),
          true,
          'error creating vault for owner3'
        );
        assert.equal(
          (await optionContract.getVaultOwnersLength()).toString(),
          '3',
          'vaults length mismatch'
        );
        assert.equal(
          await optionContract.vaultOwners(0),
          vaultOwner1,
          'vault owner address mismatch'
        );
        assert.equal(
          await optionContract.vaultOwners(1),
          vaultOwner2,
          'vault owner address mismatch'
        );
        assert.equal(
          await optionContract.vaultOwners(2),
          vaultOwner3,
          'vault owner address mismatch'
        );
      });

      it('should revert openning a vault for an already vault owner', async () => {
        await expectRevert(
          optionContract.openVault({
            from: vaultOwner1
          }),
          'Vault already created'
        );

        await expectRevert(
          optionContract.openVault({
            from: vaultOwner2
          }),
          'Vault already created'
        );

        await expectRevert(
          optionContract.openVault({
            from: vaultOwner2
          }),
          'Vault already created'
        );
      });
    });

    describe('Add colateral', () => {
      it('should revert adding collateral to a non existing vault', async () => {
        await expectRevert(
          optionContract.addETHCollateral(random, {
            from: random,
            value: ethCollateralToAdd
          }),
          'Vault does not exist'
        );
      });

      it('add collateral to vault', async () => {
        const vault1CollateralBefore = (
          await optionContract.getVault(vaultOwner1)
        )[0].toString();
        const vault2CollateralBefore = (
          await optionContract.getVault(vaultOwner2)
        )[0].toString();
        const vault3CollateralBefore = (
          await optionContract.getVault(vaultOwner3)
        )[0].toString();

        await optionContract.addETHCollateral(vaultOwner1, {
          from: vaultOwner1,
          value: ethCollateralToAdd
        });
        await optionContract.addETHCollateral(vaultOwner2, {
          from: vaultOwner2,
          value: ethCollateralToAdd
        });
        await optionContract.addETHCollateral(vaultOwner3, {
          from: vaultOwner3,
          value: ethCollateralToAdd
        });

        const vault1CollateralAfter = (
          await optionContract.getVault(vaultOwner1)
        )[0].toString();
        const vault2CollateralAfter = (
          await optionContract.getVault(vaultOwner2)
        )[0].toString();
        const vault3CollateralAfter = (
          await optionContract.getVault(vaultOwner3)
        )[0].toString();

        assert.equal(
          new BigNumber(vault1CollateralAfter)
            .minus(new BigNumber(vault1CollateralBefore))
            .toString(),
          ethCollateralToAdd.toString(),
          'error deposited ETH collateral'
        );
        assert.equal(
          new BigNumber(vault2CollateralAfter)
            .minus(new BigNumber(vault2CollateralBefore))
            .toString(),
          ethCollateralToAdd.toString(),
          'error deposited ETH collateral'
        );
        assert.equal(
          new BigNumber(vault3CollateralAfter)
            .minus(new BigNumber(vault3CollateralBefore))
            .toString(),
          ethCollateralToAdd.toString(),
          'error deposited ETH collateral'
        );
      });

      it('should revert adding ERC20 token as collateral', async () => {
        await expectRevert(
          optionContract.addERC20Collateral(vaultOwner1, '10', {
            from: vaultOwner1,
            value: ethCollateralToAdd
          }),
          'revert'
        );
      });
    });

    describe('Issue oToken', () => {
      it('check max oToken each vault can sell', async () => {
        const vaultsCollateral = [];

        vaultsCollateral.push(
          (await optionContract.getVault(vaultOwner1))[0].toString()
        );
        vaultsCollateral.push(
          (await optionContract.getVault(vaultOwner2))[0].toString()
        );
        vaultsCollateral.push(
          (await optionContract.getVault(vaultOwner3))[0].toString()
        );

        for (let i = 0; i <= vaultsCollateral.length; i++) {
          const _maxIssuable =
            calculateMaxOptionsToCreate(
              Number(vaultsCollateral[0]) / 10 ** 12,
              1,
              _minCollateralizationRatioValue *
                10 ** _minCollateralizationRatioExp,
              _strikePrice * 10 ** _strikeExp
            ) /
            10 ** 6;
          assert.equal(
            (
              await optionContract.maxOTokensIssuable(vaultsCollateral[0])
            ).toString(),
            String(_maxIssuable),
            'max otoken issuable mismatch'
          );
        }
      });

      it('should revert issuing oToken more than maximum', async () => {
        const vault1 = await optionContract.getVault(vaultOwner1);
        const _amountToIssue1 = await optionContract.maxOTokensIssuable(
          vault1[0]
        );

        await expectRevert(
          optionContract.issueOTokens(
            new BigNumber(_amountToIssue1).plus(1).toString(),
            vaultOwner1,
            {
              from: vaultOwner1
            }
          ),
          'unsafe to mint'
        );
      });

      it('issue oToken', async () => {
        const vault1 = await optionContract.getVault(vaultOwner1);
        const vault2 = await optionContract.getVault(vaultOwner2);
        const vault3 = await optionContract.getVault(vaultOwner3);

        const _amountToIssue1 = (
          await optionContract.maxOTokensIssuable(vault1[0])
        ).toString();
        const _amountToIssue2 = (
          await optionContract.maxOTokensIssuable(vault2[0])
        ).toString();
        const _amountToIssue3 = (
          await optionContract.maxOTokensIssuable(vault3[0])
        ).toString();

        await optionContract.issueOTokens(_amountToIssue1, vaultOwner1, {
          from: vaultOwner1
        });
        await optionContract.issueOTokens(_amountToIssue2, vaultOwner2, {
          from: vaultOwner2
        });
        await optionContract.issueOTokens(_amountToIssue3, vaultOwner3, {
          from: vaultOwner3
        });

        const vault1After = await optionContract.getVault(vaultOwner1);
        const vault2After = await optionContract.getVault(vaultOwner2);
        const vault3After = await optionContract.getVault(vaultOwner3);

        const vaultOwner1BalanceAfter = await optionContract.balanceOf(
          vaultOwner1
        );
        const vaultOwner2BalanceAfter = await optionContract.balanceOf(
          vaultOwner2
        );
        const vaultOwner3BalanceAfter = await optionContract.balanceOf(
          vaultOwner3
        );

        assert.equal(
          vault1After[1].toString(),
          vaultOwner1BalanceAfter.toString(),
          'invalid issued amount'
        );
        assert.equal(
          vault2After[1].toString(),
          vaultOwner2BalanceAfter.toString(),
          'invalid issued amount'
        );
        assert.equal(
          vault3After[1].toString(),
          vaultOwner3BalanceAfter.toString(),
          'invalid issued amount'
        );
      });
    });

    describe('Exercise USDC for ETH', async () => {
      before(async () => {
        optionContract.transfer(
          buyer1,
          await optionContract.balanceOf(vaultOwner1),
          {from: vaultOwner1}
        );

        optionContract.transfer(
          buyer1,
          await optionContract.balanceOf(vaultOwner2),
          {from: vaultOwner2}
        );
      });

      it('should revert exercising when buyer does not have enough USDC balance', async () => {
        const _amountToExercise = (
          await optionContract.balanceOf(buyer1)
        ).toString();

        await usdc.approve(optionContract.address, '500', {from: buyer1});

        await expectRevert(
          optionContract.exercise(
            _amountToExercise,
            [vaultOwner1, vaultOwner2, vaultOwner3],
            {
              from: buyer1
            }
          ),
          'revert'
        );
      });

      it('should revert exercising from an address that have no vault', async () => {
        const _amountToExercise = (
          await optionContract.balanceOf(buyer1)
        ).toString();
        const _amountUnderlyingNeeded = (
          await optionContract.underlyingRequiredToExercise(_amountToExercise)
        ).toString();

        // mint needed underlying balance
        await usdc.mint(buyer1, _amountUnderlyingNeeded);

        await usdc.approve(optionContract.address, _amountUnderlyingNeeded, {
          from: buyer1
        });

        await expectRevert(
          optionContract.exercise(_amountToExercise, [vaultOwner1, random], {
            from: buyer1
          }),
          'revert'
        );
      });

      it('exercise USDC+oToken to get 20ETH', async () => {
        const buyerTokenBalanceBefore = (
          await optionContract.balanceOf(buyer1)
        ).toString();
        const buyerETHBalanceBefore = await web3.eth.getBalance(buyer1);
        const vault1Before = await optionContract.getVault(vaultOwner1);
        const vault2Before = await optionContract.getVault(vaultOwner2);
        const vault3Before = await optionContract.getVault(vaultOwner3);

        const _amountUnderlyingNeeded = (
          await optionContract.underlyingRequiredToExercise(
            buyerTokenBalanceBefore
          )
        ).toString();

        const _collateralToPayOut = new BigNumber(vault1Before[0]).plus(
          new BigNumber(vault2Before[0])
        );

        const tx1 = await usdc.approve(
          optionContract.address,
          _amountUnderlyingNeeded,
          {from: buyer1}
        );

        const tx2 = await optionContract.exercise(
          buyerTokenBalanceBefore,
          [vaultOwner1, vaultOwner2, vaultOwner3],
          {
            from: buyer1
          }
        );

        const tx1GasUsed = new BigNumber(tx1.receipt.gasUsed);
        const tx1GasPrice = new BigNumber(
          (await web3.eth.getTransaction(tx1.tx)).gasPrice
        );
        const tx2GasUsed = new BigNumber(tx2.receipt.gasUsed);
        const tx2GasPrice = new BigNumber(
          (await web3.eth.getTransaction(tx2.tx)).gasPrice
        );
        const gasUsed = tx1GasUsed
          .multipliedBy(tx1GasPrice)
          .plus(tx2GasUsed.multipliedBy(tx2GasPrice));

        const buyerTokenBalanceAfter = (
          await optionContract.balanceOf(buyer1)
        ).toString();
        const buyerETHBalanceAfter = await web3.eth.getBalance(buyer1);
        const vault1After = await optionContract.getVault(vaultOwner1);
        const vault2After = await optionContract.getVault(vaultOwner2);
        const vault3After = await optionContract.getVault(vaultOwner3);

        assert.equal(
          vault1After[0].toString(),
          '0',
          'vault1 collateral mismatch'
        );
        assert.equal(
          vault1After[2].toString(),
          new BigNumber(buyerTokenBalanceBefore).dividedBy(2).toString(),
          'vault1 underlying mismatch'
        );
        assert.equal(
          vault2After[0].toString(),
          '0',
          'vault2 collateral mismatch'
        );
        assert.equal(
          vault2After[2].toString(),
          new BigNumber(buyerTokenBalanceBefore).dividedBy(2).toString(),
          'vault2 underlying mismatch'
        );
        assert.equal(
          vault3After[0].toString(),
          vault3Before[0].toString(),
          'vault3 collateral mismatch'
        );
        assert.equal(
          vault3After[2].toString(),
          vault3Before[2].toString(),
          'vault3 undelrying mismatch'
        );
        assert.equal(
          new BigNumber(buyerTokenBalanceBefore)
            .minus(new BigNumber(_amountUnderlyingNeeded))
            .toString(),
          buyerTokenBalanceAfter,
          'buyer1 oToken balance mismatch'
        );
        assert.equal(
          new BigNumber(buyerETHBalanceBefore).toString(),
          new BigNumber(buyerETHBalanceAfter)
            .minus(_collateralToPayOut)
            .plus(gasUsed)
            .toString(),
          'buyer1 ETH balance mismatch'
        );
      });
    });

    describe('Remove collateral', () => {
      it('should revert removing collateral from unsafe vault', async () => {
        const vault3 = await optionContract.getVault(vaultOwner3);

        await expectRevert(
          optionContract.removeCollateral(vault3[0].toString(), {
            from: vaultOwner3
          }),
          'revert'
        );
      });

      it('burn issued tokens before expiry', async () => {
        const vault3 = await optionContract.getVault(vaultOwner3);

        await optionContract.burnOTokens(vault3[1].toString(), {
          from: vaultOwner3
        });

        const vault3TokensAfter = (
          await optionContract.getVault(vaultOwner3)
        )[1];

        assert.equal(
          vault3TokensAfter.toString(),
          '0',
          'vault3 oToken issued mismatch'
        );
      });

      it('remove collateral from vault before expiry', async () => {
        const vault3 = await optionContract.getVault(vaultOwner3);

        await optionContract.removeCollateral(vault3[0].toString(), {
          from: vaultOwner3
        });

        const vault3CollateralAfter = (
          await optionContract.getVault(vaultOwner3)
        )[0];

        assert.equal(
          vault3CollateralAfter.toString(),
          '0',
          'vault3 collateral mismatch'
        );
      });
    });

    describe('Redeem vault', () => {
      before(async () => {
        await time.increaseTo(_windowSize + 2);
      });

      it('redeem vault balance', async () => {
        await optionContract.redeemVaultBalance({from: vaultOwner1});
        await optionContract.redeemVaultBalance({from: vaultOwner2});

        const vault1After = await optionContract.getVault(vaultOwner1);
        const vault2After = await optionContract.getVault(vaultOwner2);

        assert.equal(vault1After[0].toString(), '0', 'collateral mismatch');
        assert.equal(vault1After[1].toString(), '0', 'oToken issued mismatch');
        assert.equal(vault1After[2].toString(), '0', 'underlying mismatch');
        assert.equal(vault2After[0].toString(), '0', 'collateral mismatch');
        assert.equal(vault2After[1].toString(), '0', 'oToken issued mismatch');
        assert.equal(vault2After[2].toString(), '0', 'underlying mismatch');
      });
    });
  }
);

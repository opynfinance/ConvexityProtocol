# EchidnaOptionsContract.sol

View Source: [contracts/echidna/EchidnaOptionsContract.sol](../contracts/echidna/EchidnaOptionsContract.sol)

**↗ Extends: [TestOptionsContract](TestOptionsContract.md)**

**EchidnaOptionsContract**

## Functions

- [echidna_windowsize_lessthan_equal_expiry()](#echidna_windowsize_lessthan_equal_expiry)
- [echidna_collateral_exponent_withen_exponent_range()](#echidna_collateral_exponent_withen_exponent_range)
- [echidna_underlying_exponent_withen_exponent_range()](#echidna_underlying_exponent_withen_exponent_range)
- [echidna_strike_exponent_withen_exponent_range()](#echidna_strike_exponent_withen_exponent_range)
- [echidna_exchange_rate_exponent_withen_exponent_range()](#echidna_exchange_rate_exponent_withen_exponent_range)
- [echidna_liquiadtion_incentive_lessthan_equal_20percent()](#echidna_liquiadtion_incentive_lessthan_equal_20percent)
- [echidna_liquiadtion_factor_lessthan_equal_100percent()](#echidna_liquiadtion_factor_lessthan_equal_100percent)
- [echidna_transaction_fee_lessthan_equal_10percent()](#echidna_transaction_fee_lessthan_equal_10percent)
- [echidna_min_collateralization_ration_greaterthan_equal_1()](#echidna_min_collateralization_ration_greaterthan_equal_1)

### echidna_windowsize_lessthan_equal_expiry

```js
function echidna_windowsize_lessthan_equal_expiry() public view
returns(bool)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

### echidna_collateral_exponent_withen_exponent_range

```js
function echidna_collateral_exponent_withen_exponent_range() public view
returns(bool)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

### echidna_underlying_exponent_withen_exponent_range

```js
function echidna_underlying_exponent_withen_exponent_range() public view
returns(bool)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

### echidna_strike_exponent_withen_exponent_range

```js
function echidna_strike_exponent_withen_exponent_range() public view
returns(bool)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

### echidna_exchange_rate_exponent_withen_exponent_range

```js
function echidna_exchange_rate_exponent_withen_exponent_range() public view
returns(bool)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

### echidna_liquiadtion_incentive_lessthan_equal_20percent

```js
function echidna_liquiadtion_incentive_lessthan_equal_20percent() public view
returns(bool)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

### echidna_liquiadtion_factor_lessthan_equal_100percent

```js
function echidna_liquiadtion_factor_lessthan_equal_100percent() public view
returns(bool)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

### echidna_transaction_fee_lessthan_equal_10percent

```js
function echidna_transaction_fee_lessthan_equal_10percent() public view
returns(bool)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

### echidna_min_collateralization_ration_greaterthan_equal_1

```js
function echidna_min_collateralization_ration_greaterthan_equal_1() public view
returns(bool)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

## Contracts

* [CompoundOracleInterface](CompoundOracleInterface.md)
* [Context](Context.md)
* [CTokenInterface](CTokenInterface.md)
* [EchidnaOptionsContract](EchidnaOptionsContract.md)
* [ERC20](ERC20.md)
* [ERC20Detailed](ERC20Detailed.md)
* [ERC20Mintable](ERC20Mintable.md)
* [IERC20](IERC20.md)
* [Initializable](Initializable.md)
* [InitializedOwnable](InitializedOwnable.md)
* [Migrations](Migrations.md)
* [MinterRole](MinterRole.md)
* [MockCompoundOracle](MockCompoundOracle.md)
* [MockCtoken](MockCtoken.md)
* [MockERC20](MockERC20.md)
* [MockOracle](MockOracle.md)
* [MockOtokensExchange](MockOtokensExchange.md)
* [MockUniswapFactory](MockUniswapFactory.md)
* [OptionsContract](OptionsContract.md)
* [OptionsExchange](OptionsExchange.md)
* [OptionsFactory](OptionsFactory.md)
* [Oracle](Oracle.md)
* [OracleInterface](OracleInterface.md)
* [oToken](oToken.md)
* [OTokenInterface](OTokenInterface.md)
* [Ownable](Ownable.md)
* [Roles](Roles.md)
* [SafeMath](SafeMath.md)
* [Spawn](Spawn.md)
* [Spawner](Spawner.md)
* [StringComparator](StringComparator.md)
* [TestOptionsContract](TestOptionsContract.md)
* [TestOptionsExchange](TestOptionsExchange.md)
* [UniswapExchangeInterface](UniswapExchangeInterface.md)
* [UniswapFactoryInterface](UniswapFactoryInterface.md)

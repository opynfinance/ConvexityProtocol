# CTokenInterface.sol

View Source: [contracts/interfaces/CTokenInterface.sol](../contracts/interfaces/CTokenInterface.sol)

**CTokenInterface**

## Contract Members
**Constants & Variables**

```js
address public underlying;
uint256 public initialExchangeRateMantissa;

```

## Functions

- [transfer(address dst, uint256 amount)](#transfer)
- [transferFrom(address src, address dst, uint256 amount)](#transferfrom)
- [approve(address spender, uint256 amount)](#approve)
- [allowance(address owner, address spender)](#allowance)
- [balanceOf(address owner)](#balanceof)
- [balanceOfUnderlying(address owner)](#balanceofunderlying)
- [getAccountSnapshot(address account)](#getaccountsnapshot)
- [borrowRatePerBlock()](#borrowrateperblock)
- [supplyRatePerBlock()](#supplyrateperblock)
- [totalBorrowsCurrent()](#totalborrowscurrent)
- [borrowBalanceCurrent(address account)](#borrowbalancecurrent)
- [borrowBalanceStored(address account)](#borrowbalancestored)
- [exchangeRateCurrent()](#exchangeratecurrent)
- [exchangeRateStored()](#exchangeratestored)
- [getCash()](#getcash)
- [accrueInterest()](#accrueinterest)
- [seize(address liquidator, address borrower, uint256 seizeTokens)](#seize)

### transfer

```js
function transfer(address dst, uint256 amount) external nonpayable
returns(bool)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| dst | address |  | 
| amount | uint256 |  | 

### transferFrom

```js
function transferFrom(address src, address dst, uint256 amount) external nonpayable
returns(bool)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| src | address |  | 
| dst | address |  | 
| amount | uint256 |  | 

### approve

```js
function approve(address spender, uint256 amount) external nonpayable
returns(bool)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| spender | address |  | 
| amount | uint256 |  | 

### allowance

```js
function allowance(address owner, address spender) external view
returns(uint256)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| owner | address |  | 
| spender | address |  | 

### balanceOf

```js
function balanceOf(address owner) external view
returns(uint256)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| owner | address |  | 

### balanceOfUnderlying

```js
function balanceOfUnderlying(address owner) external nonpayable
returns(uint256)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| owner | address |  | 

### getAccountSnapshot

```js
function getAccountSnapshot(address account) external view
returns(uint256, uint256, uint256, uint256)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| account | address |  | 

### borrowRatePerBlock

```js
function borrowRatePerBlock() external view
returns(uint256)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

### supplyRatePerBlock

```js
function supplyRatePerBlock() external view
returns(uint256)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

### totalBorrowsCurrent

```js
function totalBorrowsCurrent() external nonpayable
returns(uint256)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

### borrowBalanceCurrent

```js
function borrowBalanceCurrent(address account) external nonpayable
returns(uint256)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| account | address |  | 

### borrowBalanceStored

```js
function borrowBalanceStored(address account) external view
returns(uint256)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| account | address |  | 

### exchangeRateCurrent

```js
function exchangeRateCurrent() external nonpayable
returns(uint256)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

### exchangeRateStored

```js
function exchangeRateStored() external view
returns(uint256)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

### getCash

```js
function getCash() external view
returns(uint256)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

### accrueInterest

```js
function accrueInterest() external nonpayable
returns(uint256)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

### seize

```js
function seize(address liquidator, address borrower, uint256 seizeTokens) external nonpayable
returns(uint256)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| liquidator | address |  | 
| borrower | address |  | 
| seizeTokens | uint256 |  | 

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

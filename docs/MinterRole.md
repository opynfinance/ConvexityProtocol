# MinterRole.sol

View Source: [contracts/packages/MinterRole.sol](../contracts/packages/MinterRole.sol)

**↗ Extends: [Context](Context.md)**
**↘ Derived Contracts: [ERC20Mintable](ERC20Mintable.md)**

**MinterRole**

## Contract Members
**Constants & Variables**

```js
struct Roles.Role private _minters;

```

**Events**

```js
event MinterAdded(address indexed account);
event MinterRemoved(address indexed account);
```

## Modifiers

- [onlyMinter](#onlyminter)

### onlyMinter

```js
modifier onlyMinter() internal
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

## Functions

- [()](#)
- [isMinter(address account)](#isminter)
- [addMinter(address account)](#addminter)
- [renounceMinter()](#renounceminter)
- [_addMinter(address account)](#_addminter)
- [_removeMinter(address account)](#_removeminter)

### 

```js
function () internal nonpayable
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

### isMinter

```js
function isMinter(address account) public view
returns(bool)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| account | address |  | 

### addMinter

```js
function addMinter(address account) public nonpayable onlyMinter 
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| account | address |  | 

### renounceMinter

```js
function renounceMinter() public nonpayable
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

### _addMinter

```js
function _addMinter(address account) internal nonpayable
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| account | address |  | 

### _removeMinter

```js
function _removeMinter(address account) internal nonpayable
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| account | address |  | 

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

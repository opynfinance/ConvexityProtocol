# MinterRole.sol

View Source: [@openzeppelin/contracts/access/roles/MinterRole.sol](../@openzeppelin/contracts/access/roles/MinterRole.sol)

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
* [Dai](Dai.md)
* [ERC20](ERC20.md)
* [ERC20Detailed](ERC20Detailed.md)
* [ERC20Mintable](ERC20Mintable.md)
* [IERC20](IERC20.md)
* [IOptionsExchange](IOptionsExchange.md)
* [LibNote](LibNote.md)
* [Migrations](Migrations.md)
* [MinterRole](MinterRole.md)
* [MockCompoundOracle](MockCompoundOracle.md)
* [MockUniswapFactory](MockUniswapFactory.md)
* [OptionsContract](OptionsContract.md)
* [OptionsExchange](OptionsExchange.md)
* [OptionsFactory](OptionsFactory.md)
* [OptionsUtils](OptionsUtils.md)
* [Oracle](Oracle.md)
* [oToken](oToken.md)
* [Ownable](Ownable.md)
* [Roles](Roles.md)
* [SafeMath](SafeMath.md)
* [StringComparator](StringComparator.md)
* [TestImports](TestImports.md)
* [UniswapExchangeInterface](UniswapExchangeInterface.md)
* [UniswapFactoryInterface](UniswapFactoryInterface.md)

# OptionsFactory.sol

View Source: [contracts/OptionsFactory.sol](../contracts/OptionsFactory.sol)

**↗ Extends: [Ownable](Ownable.md)**

**OptionsFactory**

## Contract Members
**Constants & Variables**

```js
mapping(string => contract IERC20) public tokens;
address[] public optionsContracts;
contract OptionsExchange public optionsExchange;
address public oracleAddress;

```

**Events**

```js
event OptionsContractCreated(address  addr);
event AssetAdded(string indexed asset, address indexed addr);
event AssetChanged(string indexed asset, address indexed addr);
event AssetDeleted(string indexed asset);
```

## Functions

- [(OptionsExchange _optionsExchangeAddr, address _oracleAddress)](#)
- [createOptionsContract(string _collateralType, int32 _collateralExp, string _underlyingType, int32 _underlyingExp, int32 _oTokenExchangeExp, uint256 _strikePrice, int32 _strikeExp, string _strikeAsset, uint256 _expiry, uint256 _windowSize)](#createoptionscontract)
- [getNumberOfOptionsContracts()](#getnumberofoptionscontracts)
- [addAsset(string _asset, address _addr)](#addasset)
- [changeAsset(string _asset, address _addr)](#changeasset)
- [deleteAsset(string _asset)](#deleteasset)
- [supportsAsset(string _asset)](#supportsasset)

### 

```js
function (OptionsExchange _optionsExchangeAddr, address _oracleAddress) public nonpayable
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _optionsExchangeAddr | OptionsExchange | : The contract which interfaces with the exchange | 
| _oracleAddress | address | Address of the oracle | 

### createOptionsContract

creates a new Option Contract

```js
function createOptionsContract(string _collateralType, int32 _collateralExp, string _underlyingType, int32 _underlyingExp, int32 _oTokenExchangeExp, uint256 _strikePrice, int32 _strikeExp, string _strikeAsset, uint256 _expiry, uint256 _windowSize) public nonpayable
returns(address)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _collateralType | string | The collateral asset. Eg. "ETH" | 
| _collateralExp | int32 | The number of decimals the collateral asset has | 
| _underlyingType | string | The underlying asset. Eg. "DAI" | 
| _underlyingExp | int32 | The precision of the underlying asset. Eg. (-18 if Dai) | 
| _oTokenExchangeExp | int32 | Units of underlying that 1 oToken protects | 
| _strikePrice | uint256 | The amount of strike asset that will be paid out | 
| _strikeExp | int32 | The precision of the strike Price | 
| _strikeAsset | string | The asset in which the insurance is calculated | 
| _expiry | uint256 | The time at which the insurance expires | 
| _windowSize | uint256 | UNIX time. Exercise window is from `expiry - _windowSize` to `expiry`. | 

### getNumberOfOptionsContracts

The number of Option Contracts that the Factory contract has stored

```js
function getNumberOfOptionsContracts() public view
returns(uint256)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

### addAsset

The owner of the Factory Contract can add a new asset to be supported

```js
function addAsset(string _asset, address _addr) public nonpayable onlyOwner 
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _asset | string | The ticker symbol for the asset | 
| _addr | address | The address of the asset | 

### changeAsset

The owner of the Factory Contract can change an existing asset's address

```js
function changeAsset(string _asset, address _addr) public nonpayable onlyOwner 
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _asset | string | The ticker symbol for the asset | 
| _addr | address | The address of the asset | 

### deleteAsset

The owner of the Factory Contract can delete an existing asset's address

```js
function deleteAsset(string _asset) public nonpayable onlyOwner 
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _asset | string | The ticker symbol for the asset | 

### supportsAsset

Check if the Factory contract supports a specific asset

```js
function supportsAsset(string _asset) public view
returns(bool)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _asset | string | The ticker symbol for the asset | 

## Contracts

* [CompoundOracleInterface](CompoundOracleInterface.md)
* [Context](Context.md)
* [CTokenInterface](CTokenInterface.md)
* [Dai](Dai.md)
* [ERC20](ERC20.md)
* [ERC20Detailed](ERC20Detailed.md)
* [ERC20Mintable](ERC20Mintable.md)
* [IERC20](IERC20.md)
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

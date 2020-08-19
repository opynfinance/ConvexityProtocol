# OptionsFactory.sol

View Source: [contracts/OptionsFactory.sol](../contracts/OptionsFactory.sol)

**↗ Extends: [Ownable](Ownable.md)**

**OptionsFactory**

## Contract Members
**Constants & Variables**

```js
mapping(address => bool) public whitelisted;
address[] public optionsContracts;
contract OptionsExchange public optionsExchange;
address public oracleAddress;

```

**Events**

```js
event OptionsContractCreated(address  addr);
event AssetWhitelisted(address indexed asset);
```

## Functions

- [(OptionsExchange _optionsExchangeAddr, address _oracleAddress)](#)
- [createOptionsContract(address _collateral, address _underlying, address _strike, int32 _oTokenExchangeExp, uint256 _strikePrice, int32 _strikeExp, uint256 _expiry, uint256 _windowSize, string _name, string _symbol)](#createoptionscontract)
- [getNumberOfOptionsContracts()](#getnumberofoptionscontracts)
- [whitelistAsset(address _asset)](#whitelistasset)

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
function createOptionsContract(address _collateral, address _underlying, address _strike, int32 _oTokenExchangeExp, uint256 _strikePrice, int32 _strikeExp, uint256 _expiry, uint256 _windowSize, string _name, string _symbol) external nonpayable
returns(address)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _collateral | address | The collateral asset. Eg. "ETH" | 
| _underlying | address | The underlying asset. Eg. "DAI" | 
| _strike | address | Price The amount of strike asset that will be paid out | 
| _oTokenExchangeExp | int32 | Units of underlying that 1 oToken protects | 
| _strikePrice | uint256 | The amount of strike asset that will be paid out | 
| _strikeExp | int32 | The precision of the strike Price | 
| _expiry | uint256 | The time at which the insurance expires | 
| _windowSize | uint256 | UNIX time. Exercise window is from `expiry - _windowSize` to `expiry`. | 
| _name | string |  | 
| _symbol | string |  | 

### getNumberOfOptionsContracts

The number of Option Contracts that the Factory contract has stored

```js
function getNumberOfOptionsContracts() external view
returns(uint256)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

### whitelistAsset

The owner of the Factory Contract can update an asset's address, by adding it, changing the address or removing the asset

```js
function whitelistAsset(address _asset) external nonpayable onlyOwner 
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _asset | address | The address for the asset | 

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

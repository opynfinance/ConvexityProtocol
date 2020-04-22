# Oracle.sol

View Source: [contracts/Oracle.sol](../contracts/Oracle.sol)

**Oracle**

## Contract Members
**Constants & Variables**

```js
//internal members
mapping(address => bool) internal isCToken;
mapping(address => address) internal assetToCTokens;
address internal cETH;

//public members
contract CompoundOracleInterface public PriceOracle;

```

## Functions

- [(address _oracleAddress)](#)
- [isCETH(address asset)](#isceth)
- [getPrice(address asset)](#getprice)
- [getPriceUnderlying(address asset)](#getpriceunderlying)

### 

```js
function (address _oracleAddress) public nonpayable
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _oracleAddress | address |  | 

### isCETH

```js
function isCETH(address asset) public view
returns(bool)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| asset | address |  | 

### getPrice

```js
function getPrice(address asset) public view
returns(uint256)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| asset | address |  | 

### getPriceUnderlying

```js
function getPriceUnderlying(address asset) internal view
returns(uint256)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| asset | address |  | 

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

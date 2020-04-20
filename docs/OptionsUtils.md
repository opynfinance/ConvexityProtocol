# OptionsUtils.sol

View Source: [contracts/OptionsUtils.sol](../contracts/OptionsUtils.sol)

**OptionsUtils**

## Contract Members
**Constants & Variables**

```js
contract UniswapFactoryInterface public UNISWAP_FACTORY;
contract CompoundOracleInterface public COMPOUND_ORACLE;

```

## Functions

- [(address _uniswapFactory, address _compoundOracle)](#)
- [getExchange(address _token)](#getexchange)
- [isETH(IERC20 _ierc20)](#iseth)

### 

```js
function (address _uniswapFactory, address _compoundOracle) public nonpayable
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _uniswapFactory | address |  | 
| _compoundOracle | address |  | 

### getExchange

```js
function getExchange(address _token) public view
returns(contract UniswapExchangeInterface)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _token | address |  | 

### isETH

```js
function isETH(IERC20 _ierc20) public pure
returns(bool)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _ierc20 | IERC20 |  | 

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

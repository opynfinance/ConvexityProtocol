# MockUniswapFactory.sol

View Source: [contracts/lib/MockUniswapFactory.sol](../contracts/lib/MockUniswapFactory.sol)

**MockUniswapFactory**

## Contract Members
**Constants & Variables**

```js
address public exchangeTemplate;
uint256 public tokenCount;

```

## Functions

- [()](#)
- [createExchange(address token)](#createexchange)
- [getExchange(address token)](#getexchange)
- [getToken(address exchange)](#gettoken)
- [getTokenWithId(uint256 tokenId)](#gettokenwithid)
- [initializeFactory(address template)](#initializefactory)

### 

```js
function () public nonpayable
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

### createExchange

```js
function createExchange(address token) external pure
returns(exchange address)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| token | address |  | 

### getExchange

```js
function getExchange(address token) external pure
returns(exchange address)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| token | address |  | 

### getToken

```js
function getToken(address exchange) external pure
returns(token address)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| exchange | address |  | 

### getTokenWithId

```js
function getTokenWithId(uint256 tokenId) external pure
returns(token address)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| tokenId | uint256 |  | 

### initializeFactory

```js
function initializeFactory(address template) external nonpayable
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| template | address |  | 

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

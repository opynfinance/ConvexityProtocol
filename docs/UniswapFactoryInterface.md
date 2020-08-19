# UniswapFactoryInterface.sol

View Source: [contracts/interfaces/UniswapFactoryInterface.sol](../contracts/interfaces/UniswapFactoryInterface.sol)

**UniswapFactoryInterface**

## Contract Members
**Constants & Variables**

```js
address public exchangeTemplate;
uint256 public tokenCount;

```

## Functions

- [createExchange(address token)](#createexchange)
- [getExchange(address token)](#getexchange)
- [getToken(address exchange)](#gettoken)
- [getTokenWithId(uint256 tokenId)](#gettokenwithid)
- [initializeFactory(address template)](#initializefactory)

### createExchange

```js
function createExchange(address token) external nonpayable
returns(exchange address)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| token | address |  | 

### getExchange

```js
function getExchange(address token) external view
returns(exchange address)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| token | address |  | 

### getToken

```js
function getToken(address exchange) external view
returns(token address)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| exchange | address |  | 

### getTokenWithId

```js
function getTokenWithId(uint256 tokenId) external view
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

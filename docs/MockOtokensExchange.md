# MockOtokensExchange.sol

View Source: [contracts/mocks/MockOtokensExchange.sol](../contracts/mocks/MockOtokensExchange.sol)

**MockOtokensExchange**

## Contract Members
**Constants & Variables**

```js
uint256 public price;

```

## Functions

- [sellOTokens(address payable receiver, address tokenIn, address tokenOut, uint256 inAmount)](#sellotokens)
- [premiumReceived(address oTokenAddress, address payoutTokenAddress, uint256 oTokensToSell)](#premiumreceived)
- [setPrice(uint256 _price)](#setprice)
- [pullToken(address _from, address _token, uint256 _amount)](#pulltoken)
- [pushToken(address payable _to, address _token, uint256 _amount)](#pushtoken)
- [()](#)

### sellOTokens

```js
function sellOTokens(address payable receiver, address tokenIn, address tokenOut, uint256 inAmount) external nonpayable
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| receiver | address payable |  | 
| tokenIn | address |  | 
| tokenOut | address |  | 
| inAmount | uint256 |  | 

### premiumReceived

```js
function premiumReceived(address oTokenAddress, address payoutTokenAddress, uint256 oTokensToSell) external view
returns(uint256)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| oTokenAddress | address |  | 
| payoutTokenAddress | address |  | 
| oTokensToSell | uint256 |  | 

### setPrice

```js
function setPrice(uint256 _price) external nonpayable
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _price | uint256 |  | 

### pullToken

```js
function pullToken(address _from, address _token, uint256 _amount) internal nonpayable
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _from | address |  | 
| _token | address |  | 
| _amount | uint256 |  | 

### pushToken

```js
function pushToken(address payable _to, address _token, uint256 _amount) internal nonpayable
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _to | address payable |  | 
| _token | address |  | 
| _amount | uint256 |  | 

### 

```js
function () external payable
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

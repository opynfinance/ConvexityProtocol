# OptionsExchange.sol

View Source: [contracts/OptionsExchange.sol](../contracts/OptionsExchange.sol)

**OptionsExchange**

## Contract Members
**Constants & Variables**

```js
//internal members
uint256 internal constant LARGE_BLOCK_SIZE;
uint256 internal constant LARGE_APPROVAL_NUMBER;

//public members
contract UniswapFactoryInterface public uniswapFactory;

```

**Events**

```js
event SellOTokens(address  seller, address payable  receiver, address  oTokenAddress, address  payoutTokenAddress, uint256  oTokensToSell, uint256  payoutTokensReceived);
event BuyOTokens(address  buyer, address payable  receiver, address  oTokenAddress, address  paymentTokenAddress, uint256  oTokensToBuy, uint256  premiumPaid);
```

## Functions

- [(address _uniswapFactory)](#)
- [sellOTokens(address payable receiver, address oTokenAddress, address payoutTokenAddress, uint256 oTokensToSell)](#sellotokens)
- [buyOTokens(address payable receiver, address oTokenAddress, address paymentTokenAddress, uint256 oTokensToBuy)](#buyotokens)
- [premiumReceived(address oTokenAddress, address payoutTokenAddress, uint256 oTokensToSell)](#premiumreceived)
- [premiumToPay(address oTokenAddress, address paymentTokenAddress, uint256 oTokensToBuy)](#premiumtopay)
- [uniswapSellOToken(IERC20 oToken, IERC20 payoutToken, uint256 _amt, address payable _transferTo)](#uniswapsellotoken)
- [uniswapBuyOToken(IERC20 paymentToken, IERC20 oToken, uint256 _amt, address payable _transferTo)](#uniswapbuyotoken)
- [getExchange(address _token)](#getexchange)
- [isETH(IERC20 _ierc20)](#iseth)
- [()](#)

### 

```js
function (address _uniswapFactory) public nonpayable
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _uniswapFactory | address |  | 

### sellOTokens

This function sells oTokens on Uniswap and sends back payoutTokens to the receiver

```js
function sellOTokens(address payable receiver, address oTokenAddress, address payoutTokenAddress, uint256 oTokensToSell) external nonpayable
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| receiver | address payable | The address to send the payout tokens back to | 
| oTokenAddress | address | The address of the oToken to sell | 
| payoutTokenAddress | address | The address of the token to receive the premiums in | 
| oTokensToSell | uint256 | The number of oTokens to sell | 

### buyOTokens

This function buys oTokens on Uniswap and using paymentTokens from the receiver

```js
function buyOTokens(address payable receiver, address oTokenAddress, address paymentTokenAddress, uint256 oTokensToBuy) external payable
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| receiver | address payable | The address to send the oTokens back to | 
| oTokenAddress | address | The address of the oToken to buy | 
| paymentTokenAddress | address | The address of the token to pay the premiums in | 
| oTokensToBuy | uint256 | The number of oTokens to buy | 

### premiumReceived

This function calculates the amount of premiums that the seller
will receive if they sold oTokens on Uniswap

```js
function premiumReceived(address oTokenAddress, address payoutTokenAddress, uint256 oTokensToSell) external view
returns(uint256)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| oTokenAddress | address | The address of the oToken to sell | 
| payoutTokenAddress | address | The address of the token to receive the premiums in | 
| oTokensToSell | uint256 | The number of oTokens to sell | 

### premiumToPay

This function calculates the premiums to be paid if a buyer wants to
buy oTokens on Uniswap

```js
function premiumToPay(address oTokenAddress, address paymentTokenAddress, uint256 oTokensToBuy) public view
returns(uint256)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| oTokenAddress | address | The address of the oToken to buy | 
| paymentTokenAddress | address | The address of the token to pay the premiums in | 
| oTokensToBuy | uint256 | The number of oTokens to buy | 

### uniswapSellOToken

```js
function uniswapSellOToken(IERC20 oToken, IERC20 payoutToken, uint256 _amt, address payable _transferTo) internal nonpayable
returns(uint256)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| oToken | IERC20 |  | 
| payoutToken | IERC20 |  | 
| _amt | uint256 |  | 
| _transferTo | address payable |  | 

### uniswapBuyOToken

```js
function uniswapBuyOToken(IERC20 paymentToken, IERC20 oToken, uint256 _amt, address payable _transferTo) public nonpayable
returns(uint256)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| paymentToken | IERC20 |  | 
| oToken | IERC20 |  | 
| _amt | uint256 |  | 
| _transferTo | address payable |  | 

### getExchange

```js
function getExchange(address _token) internal view
returns(contract UniswapExchangeInterface)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _token | address |  | 

### isETH

```js
function isETH(IERC20 _ierc20) internal pure
returns(bool)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _ierc20 | IERC20 |  | 

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
* [Dai](Dai.md)
* [ERC20](ERC20.md)
* [ERC20Detailed](ERC20Detailed.md)
* [ERC20Mintable](ERC20Mintable.md)
* [FixedPointUint256](FixedPointUint256.md)
* [IERC20](IERC20.md)
* [LibNote](LibNote.md)
* [Migrations](Migrations.md)
* [MinterRole](MinterRole.md)
* [MockCompoundOracle](MockCompoundOracle.md)
* [MockOtokensExchange](MockOtokensExchange.md)
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

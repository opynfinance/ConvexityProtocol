# UniswapExchangeInterface.sol

View Source: [contracts/interfaces/UniswapExchangeInterface.sol](../contracts/interfaces/UniswapExchangeInterface.sol)

**UniswapExchangeInterface**

## Contract Members
**Constants & Variables**

```js
bytes32 public name;
bytes32 public symbol;
uint256 public decimals;

```

## Functions

- [tokenAddress()](#tokenaddress)
- [factoryAddress()](#factoryaddress)
- [addLiquidity(uint256 min_liquidity, uint256 max_tokens, uint256 deadline)](#addliquidity)
- [removeLiquidity(uint256 amount, uint256 min_eth, uint256 min_tokens, uint256 deadline)](#removeliquidity)
- [getEthToTokenInputPrice(uint256 eth_sold)](#getethtotokeninputprice)
- [getEthToTokenOutputPrice(uint256 tokens_bought)](#getethtotokenoutputprice)
- [getTokenToEthInputPrice(uint256 tokens_sold)](#gettokentoethinputprice)
- [getTokenToEthOutputPrice(uint256 eth_bought)](#gettokentoethoutputprice)
- [ethToTokenSwapInput(uint256 min_tokens, uint256 deadline)](#ethtotokenswapinput)
- [ethToTokenTransferInput(uint256 min_tokens, uint256 deadline, address recipient)](#ethtotokentransferinput)
- [ethToTokenSwapOutput(uint256 tokens_bought, uint256 deadline)](#ethtotokenswapoutput)
- [ethToTokenTransferOutput(uint256 tokens_bought, uint256 deadline, address recipient)](#ethtotokentransferoutput)
- [tokenToEthSwapInput(uint256 tokens_sold, uint256 min_eth, uint256 deadline)](#tokentoethswapinput)
- [tokenToEthTransferInput(uint256 tokens_sold, uint256 min_eth, uint256 deadline, address recipient)](#tokentoethtransferinput)
- [tokenToEthSwapOutput(uint256 eth_bought, uint256 max_tokens, uint256 deadline)](#tokentoethswapoutput)
- [tokenToEthTransferOutput(uint256 eth_bought, uint256 max_tokens, uint256 deadline, address recipient)](#tokentoethtransferoutput)
- [tokenToTokenSwapInput(uint256 tokens_sold, uint256 min_tokens_bought, uint256 min_eth_bought, uint256 deadline, address token_addr)](#tokentotokenswapinput)
- [tokenToTokenTransferInput(uint256 tokens_sold, uint256 min_tokens_bought, uint256 min_eth_bought, uint256 deadline, address recipient, address token_addr)](#tokentotokentransferinput)
- [tokenToTokenSwapOutput(uint256 tokens_bought, uint256 max_tokens_sold, uint256 max_eth_sold, uint256 deadline, address token_addr)](#tokentotokenswapoutput)
- [tokenToTokenTransferOutput(uint256 tokens_bought, uint256 max_tokens_sold, uint256 max_eth_sold, uint256 deadline, address recipient, address token_addr)](#tokentotokentransferoutput)
- [tokenToExchangeSwapInput(uint256 tokens_sold, uint256 min_tokens_bought, uint256 min_eth_bought, uint256 deadline, address exchange_addr)](#tokentoexchangeswapinput)
- [tokenToExchangeTransferInput(uint256 tokens_sold, uint256 min_tokens_bought, uint256 min_eth_bought, uint256 deadline, address recipient, address exchange_addr)](#tokentoexchangetransferinput)
- [tokenToExchangeSwapOutput(uint256 tokens_bought, uint256 max_tokens_sold, uint256 max_eth_sold, uint256 deadline, address exchange_addr)](#tokentoexchangeswapoutput)
- [tokenToExchangeTransferOutput(uint256 tokens_bought, uint256 max_tokens_sold, uint256 max_eth_sold, uint256 deadline, address recipient, address exchange_addr)](#tokentoexchangetransferoutput)
- [transfer(address _to, uint256 _value)](#transfer)
- [transferFrom(address _from, address _to, uint256 value)](#transferfrom)
- [approve(address _spender, uint256 _value)](#approve)
- [allowance(address _owner, address _spender)](#allowance)
- [balanceOf(address _owner)](#balanceof)
- [totalSupply()](#totalsupply)
- [setup(address token_addr)](#setup)

### tokenAddress

```js
function tokenAddress() external view
returns(token address)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

### factoryAddress

```js
function factoryAddress() external view
returns(factory address)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

### addLiquidity

```js
function addLiquidity(uint256 min_liquidity, uint256 max_tokens, uint256 deadline) external payable
returns(uint256)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| min_liquidity | uint256 |  | 
| max_tokens | uint256 |  | 
| deadline | uint256 |  | 

### removeLiquidity

```js
function removeLiquidity(uint256 amount, uint256 min_eth, uint256 min_tokens, uint256 deadline) external nonpayable
returns(uint256, uint256)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| amount | uint256 |  | 
| min_eth | uint256 |  | 
| min_tokens | uint256 |  | 
| deadline | uint256 |  | 

### getEthToTokenInputPrice

```js
function getEthToTokenInputPrice(uint256 eth_sold) external view
returns(tokens_bought uint256)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| eth_sold | uint256 |  | 

### getEthToTokenOutputPrice

```js
function getEthToTokenOutputPrice(uint256 tokens_bought) external view
returns(eth_sold uint256)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| tokens_bought | uint256 |  | 

### getTokenToEthInputPrice

```js
function getTokenToEthInputPrice(uint256 tokens_sold) external view
returns(eth_bought uint256)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| tokens_sold | uint256 |  | 

### getTokenToEthOutputPrice

```js
function getTokenToEthOutputPrice(uint256 eth_bought) external view
returns(tokens_sold uint256)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| eth_bought | uint256 |  | 

### ethToTokenSwapInput

```js
function ethToTokenSwapInput(uint256 min_tokens, uint256 deadline) external payable
returns(tokens_bought uint256)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| min_tokens | uint256 |  | 
| deadline | uint256 |  | 

### ethToTokenTransferInput

```js
function ethToTokenTransferInput(uint256 min_tokens, uint256 deadline, address recipient) external payable
returns(tokens_bought uint256)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| min_tokens | uint256 |  | 
| deadline | uint256 |  | 
| recipient | address |  | 

### ethToTokenSwapOutput

```js
function ethToTokenSwapOutput(uint256 tokens_bought, uint256 deadline) external payable
returns(eth_sold uint256)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| tokens_bought | uint256 |  | 
| deadline | uint256 |  | 

### ethToTokenTransferOutput

```js
function ethToTokenTransferOutput(uint256 tokens_bought, uint256 deadline, address recipient) external payable
returns(eth_sold uint256)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| tokens_bought | uint256 |  | 
| deadline | uint256 |  | 
| recipient | address |  | 

### tokenToEthSwapInput

```js
function tokenToEthSwapInput(uint256 tokens_sold, uint256 min_eth, uint256 deadline) external nonpayable
returns(eth_bought uint256)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| tokens_sold | uint256 |  | 
| min_eth | uint256 |  | 
| deadline | uint256 |  | 

### tokenToEthTransferInput

```js
function tokenToEthTransferInput(uint256 tokens_sold, uint256 min_eth, uint256 deadline, address recipient) external nonpayable
returns(eth_bought uint256)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| tokens_sold | uint256 |  | 
| min_eth | uint256 |  | 
| deadline | uint256 |  | 
| recipient | address |  | 

### tokenToEthSwapOutput

```js
function tokenToEthSwapOutput(uint256 eth_bought, uint256 max_tokens, uint256 deadline) external nonpayable
returns(tokens_sold uint256)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| eth_bought | uint256 |  | 
| max_tokens | uint256 |  | 
| deadline | uint256 |  | 

### tokenToEthTransferOutput

```js
function tokenToEthTransferOutput(uint256 eth_bought, uint256 max_tokens, uint256 deadline, address recipient) external nonpayable
returns(tokens_sold uint256)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| eth_bought | uint256 |  | 
| max_tokens | uint256 |  | 
| deadline | uint256 |  | 
| recipient | address |  | 

### tokenToTokenSwapInput

```js
function tokenToTokenSwapInput(uint256 tokens_sold, uint256 min_tokens_bought, uint256 min_eth_bought, uint256 deadline, address token_addr) external nonpayable
returns(tokens_bought uint256)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| tokens_sold | uint256 |  | 
| min_tokens_bought | uint256 |  | 
| min_eth_bought | uint256 |  | 
| deadline | uint256 |  | 
| token_addr | address |  | 

### tokenToTokenTransferInput

```js
function tokenToTokenTransferInput(uint256 tokens_sold, uint256 min_tokens_bought, uint256 min_eth_bought, uint256 deadline, address recipient, address token_addr) external nonpayable
returns(tokens_bought uint256)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| tokens_sold | uint256 |  | 
| min_tokens_bought | uint256 |  | 
| min_eth_bought | uint256 |  | 
| deadline | uint256 |  | 
| recipient | address |  | 
| token_addr | address |  | 

### tokenToTokenSwapOutput

```js
function tokenToTokenSwapOutput(uint256 tokens_bought, uint256 max_tokens_sold, uint256 max_eth_sold, uint256 deadline, address token_addr) external nonpayable
returns(tokens_sold uint256)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| tokens_bought | uint256 |  | 
| max_tokens_sold | uint256 |  | 
| max_eth_sold | uint256 |  | 
| deadline | uint256 |  | 
| token_addr | address |  | 

### tokenToTokenTransferOutput

```js
function tokenToTokenTransferOutput(uint256 tokens_bought, uint256 max_tokens_sold, uint256 max_eth_sold, uint256 deadline, address recipient, address token_addr) external nonpayable
returns(tokens_sold uint256)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| tokens_bought | uint256 |  | 
| max_tokens_sold | uint256 |  | 
| max_eth_sold | uint256 |  | 
| deadline | uint256 |  | 
| recipient | address |  | 
| token_addr | address |  | 

### tokenToExchangeSwapInput

```js
function tokenToExchangeSwapInput(uint256 tokens_sold, uint256 min_tokens_bought, uint256 min_eth_bought, uint256 deadline, address exchange_addr) external nonpayable
returns(tokens_bought uint256)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| tokens_sold | uint256 |  | 
| min_tokens_bought | uint256 |  | 
| min_eth_bought | uint256 |  | 
| deadline | uint256 |  | 
| exchange_addr | address |  | 

### tokenToExchangeTransferInput

```js
function tokenToExchangeTransferInput(uint256 tokens_sold, uint256 min_tokens_bought, uint256 min_eth_bought, uint256 deadline, address recipient, address exchange_addr) external nonpayable
returns(tokens_bought uint256)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| tokens_sold | uint256 |  | 
| min_tokens_bought | uint256 |  | 
| min_eth_bought | uint256 |  | 
| deadline | uint256 |  | 
| recipient | address |  | 
| exchange_addr | address |  | 

### tokenToExchangeSwapOutput

```js
function tokenToExchangeSwapOutput(uint256 tokens_bought, uint256 max_tokens_sold, uint256 max_eth_sold, uint256 deadline, address exchange_addr) external nonpayable
returns(tokens_sold uint256)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| tokens_bought | uint256 |  | 
| max_tokens_sold | uint256 |  | 
| max_eth_sold | uint256 |  | 
| deadline | uint256 |  | 
| exchange_addr | address |  | 

### tokenToExchangeTransferOutput

```js
function tokenToExchangeTransferOutput(uint256 tokens_bought, uint256 max_tokens_sold, uint256 max_eth_sold, uint256 deadline, address recipient, address exchange_addr) external nonpayable
returns(tokens_sold uint256)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| tokens_bought | uint256 |  | 
| max_tokens_sold | uint256 |  | 
| max_eth_sold | uint256 |  | 
| deadline | uint256 |  | 
| recipient | address |  | 
| exchange_addr | address |  | 

### transfer

```js
function transfer(address _to, uint256 _value) external nonpayable
returns(bool)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _to | address |  | 
| _value | uint256 |  | 

### transferFrom

```js
function transferFrom(address _from, address _to, uint256 value) external nonpayable
returns(bool)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _from | address |  | 
| _to | address |  | 
| value | uint256 |  | 

### approve

```js
function approve(address _spender, uint256 _value) external nonpayable
returns(bool)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _spender | address |  | 
| _value | uint256 |  | 

### allowance

```js
function allowance(address _owner, address _spender) external view
returns(uint256)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _owner | address |  | 
| _spender | address |  | 

### balanceOf

```js
function balanceOf(address _owner) external view
returns(uint256)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _owner | address |  | 

### totalSupply

```js
function totalSupply() external view
returns(uint256)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

### setup

```js
function setup(address token_addr) external nonpayable
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| token_addr | address |  | 

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

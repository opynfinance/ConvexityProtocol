# Opyn's Options Contract (oToken.sol)

View Source: [contracts/oToken.sol](../contracts/oToken.sol)

**↗ Extends: [OptionsContract](OptionsContract.md)**

**oToken**

## Functions

- [(IERC20 _collateral, int32 _collExp, IERC20 _underlying, int32 _underlyingExp, int32 _oTokenExchangeExp, uint256 _strikePrice, int32 _strikeExp, IERC20 _strike, uint256 _expiry, OptionsExchange _optionsExchange, address _oracleAddress, uint256 _windowSize)](#)
- [createETHCollateralOption(uint256 amtToCreate, address receiver)](#createethcollateraloption)
- [addETHCollateralOption(uint256 amtToCreate, address receiver)](#addethcollateraloption)
- [createAndSellETHCollateralOption(uint256 amtToCreate, address payable receiver)](#createandsellethcollateraloption)
- [addAndSellETHCollateralOption(uint256 amtToCreate, address payable receiver)](#addandsellethcollateraloption)
- [createERC20CollateralOption(uint256 amtToCreate, uint256 amtCollateral, address receiver)](#createerc20collateraloption)
- [addERC20CollateralOption(uint256 amtToCreate, uint256 amtCollateral, address receiver)](#adderc20collateraloption)
- [createAndSellERC20CollateralOption(uint256 amtToCreate, uint256 amtCollateral, address payable receiver)](#createandsellerc20collateraloption)
- [addAndSellERC20CollateralOption(uint256 amtToCreate, uint256 amtCollateral, address payable receiver)](#addandsellerc20collateraloption)

### 

```js
function (IERC20 _collateral, int32 _collExp, IERC20 _underlying, int32 _underlyingExp, int32 _oTokenExchangeExp, uint256 _strikePrice, int32 _strikeExp, IERC20 _strike, uint256 _expiry, OptionsExchange _optionsExchange, address _oracleAddress, uint256 _windowSize) public nonpayable OptionsContract 
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _collateral | IERC20 | The collateral asset | 
| _collExp | int32 | The precision of the collateral (-18 if ETH) | 
| _underlying | IERC20 | The asset that is being protected | 
| _underlyingExp | int32 | The precision of the underlying asset | 
| _oTokenExchangeExp | int32 | The precision of the `amount of underlying` that 1 oToken protects | 
| _strikePrice | uint256 | The amount of strike asset that will be paid out | 
| _strikeExp | int32 | The precision of the strike asset (-18 if ETH) | 
| _strike | IERC20 | Price The amount of strike asset that will be paid out | 
| _expiry | uint256 | The time at which the insurance expires | 
| _optionsExchange | OptionsExchange | The contract which interfaces with the exchange + oracle | 
| _oracleAddress | address | The address of the oracle | 
| _windowSize | uint256 | UNIX time. Exercise window is from `expiry - _windowSize` to `expiry`. | 

### createETHCollateralOption

opens a Vault, adds ETH collateral, and mints new oTokens in one step
Remember that creating oTokens can put the owner at a risk of losing the collateral
if an exercise event happens.
The sell function provides the owner a chance to earn premiums.
Ensure that you create and immediately sell oTokens atmoically.

```js
function createETHCollateralOption(uint256 amtToCreate, address receiver) external payable
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| amtToCreate | uint256 | number of oTokens to create | 
| receiver | address | address to send the Options to | 

### addETHCollateralOption

adds ETH collateral, and mints new oTokens in one step to an existing Vault
Remember that creating oTokens can put the owner at a risk of losing the collateral
if an exercise event happens.
The sell function provides the owner a chance to earn premiums.
Ensure that you create and immediately sell oTokens atmoically.

```js
function addETHCollateralOption(uint256 amtToCreate, address receiver) public payable
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| amtToCreate | uint256 | number of oTokens to create | 
| receiver | address | address to send the Options to | 

### createAndSellETHCollateralOption

opens a Vault, adds ETH collateral, mints new oTokens and sell in one step

```js
function createAndSellETHCollateralOption(uint256 amtToCreate, address payable receiver) external payable
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| amtToCreate | uint256 | number of oTokens to create | 
| receiver | address payable | address to receive the premiums | 

### addAndSellETHCollateralOption

adds ETH collateral to an existing Vault, and mints new oTokens and sells the oTokens in one step

```js
function addAndSellETHCollateralOption(uint256 amtToCreate, address payable receiver) public payable
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| amtToCreate | uint256 | number of oTokens to create | 
| receiver | address payable | address to send the Options to | 

### createERC20CollateralOption

opens a Vault, adds ERC20 collateral, and mints new oTokens in one step
Remember that creating oTokens can put the owner at a risk of losing the collateral
if an exercise event happens.
The sell function provides the owner a chance to earn premiums.
Ensure that you create and immediately sell oTokens atmoically.

```js
function createERC20CollateralOption(uint256 amtToCreate, uint256 amtCollateral, address receiver) external nonpayable
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| amtToCreate | uint256 | number of oTokens to create | 
| amtCollateral | uint256 | amount of collateral added | 
| receiver | address | address to send the Options to | 

### addERC20CollateralOption

adds ERC20 collateral, and mints new oTokens in one step
Remember that creating oTokens can put the owner at a risk of losing the collateral
if an exercise event happens.
The sell function provides the owner a chance to earn premiums.
Ensure that you create and immediately sell oTokens atmoically.

```js
function addERC20CollateralOption(uint256 amtToCreate, uint256 amtCollateral, address receiver) public nonpayable
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| amtToCreate | uint256 | number of oTokens to create | 
| amtCollateral | uint256 | amount of collateral added | 
| receiver | address | address to send the Options to | 

### createAndSellERC20CollateralOption

opens a Vault, adds ERC20 collateral, mints new oTokens and sells the oTokens in one step

```js
function createAndSellERC20CollateralOption(uint256 amtToCreate, uint256 amtCollateral, address payable receiver) external nonpayable
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| amtToCreate | uint256 | number of oTokens to create | 
| amtCollateral | uint256 | amount of collateral added | 
| receiver | address payable | address to send the Options to | 

### addAndSellERC20CollateralOption

adds ERC20 collateral, mints new oTokens and sells the oTokens in one step

```js
function addAndSellERC20CollateralOption(uint256 amtToCreate, uint256 amtCollateral, address payable receiver) public nonpayable
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| amtToCreate | uint256 | number of oTokens to create | 
| amtCollateral | uint256 | amount of collateral added | 
| receiver | address payable | address to send the Options to | 

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

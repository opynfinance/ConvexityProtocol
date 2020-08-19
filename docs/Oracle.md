# Oracle.sol

View Source: [contracts/Oracle.sol](../contracts/Oracle.sol)

**↗ Extends: [Ownable](Ownable.md)**

**Oracle**

## Contract Members
**Constants & Variables**

```js
//internal members
address internal cEth;
address internal cBat;
address internal cDai;
address internal cRep;
address internal cUsdc;
address internal cWbtc;
address internal cZrx;
address internal bat;
address internal dai;
address internal rep;
address internal usdc;
address internal wbtc;
address internal zrx;

//public members
mapping(address => bool) public isCtoken;
mapping(address => address) public assetToCtokens;
contract CompoundOracleInterface public priceOracle;

```

**Events**

```js
event CtokenUpdated(address indexed ctoken, bool  isCtoken);
event AssetToCtokenUpdated(address indexed asset, address  ctoken);
```

## Functions

- [(address _oracleAddress)](#)
- [iscEth(address asset)](#isceth)
- [getPrice(address asset)](#getprice)
- [getcEth()](#getceth)
- [getcBat()](#getcbat)
- [getcDai()](#getcdai)
- [getcRep()](#getcrep)
- [getcUsdc()](#getcusdc)
- [getcWbtc()](#getcwbtc)
- [getcZrx()](#getczrx)
- [getBat()](#getbat)
- [getDai()](#getdai)
- [getRep()](#getrep)
- [getUsdc()](#getusdc)
- [getWbtc()](#getwbtc)
- [getZrx()](#getzrx)
- [setPriceOracle(address _oracle)](#setpriceoracle)
- [setCeth(address _cEth)](#setceth)
- [setCbat(address _cBat)](#setcbat)
- [setCdai(address _cDai)](#setcdai)
- [setCrep(address _cRep)](#setcrep)
- [setCusdc(address _cUsdc)](#setcusdc)
- [setCwbtc(address _cWbtc)](#setcwbtc)
- [setCzrx(address _cZrx)](#setczrx)
- [setBat(address _bat)](#setbat)
- [setDai(address _dai)](#setdai)
- [setRep(address _rep)](#setrep)
- [setUsdc(address _usdc)](#setusdc)
- [setWbtc(address _wbtc)](#setwbtc)
- [setZrx(address _zrx)](#setzrx)
- [setIsCtoken(address _ctoken, bool _isCtoken)](#setisctoken)
- [setAssetToCtoken(address _asset, address _ctoken)](#setassettoctoken)
- [getPriceUnderlying(address asset)](#getpriceunderlying)

### 

```js
function (address _oracleAddress) public nonpayable
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _oracleAddress | address |  | 

### iscEth

```js
function iscEth(address asset) public view
returns(bool)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| asset | address |  | 

### getPrice

get an asset's price in wei
For ETH: return 1e18 because 1 eth = 1e18 wei
For other assets: ex: USDC: return 2349016936412111
 => 1 USDC = 2349016936412111 wei
 => 1 ETH = 1e18 / 2349016936412111 USDC = 425.71 USDC

```js
function getPrice(address asset) external view
returns(uint256)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| asset | address |  | 

### getcEth

```js
function getcEth() external view
returns(address)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

### getcBat

```js
function getcBat() external view
returns(address)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

### getcDai

```js
function getcDai() external view
returns(address)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

### getcRep

```js
function getcRep() external view
returns(address)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

### getcUsdc

```js
function getcUsdc() external view
returns(address)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

### getcWbtc

```js
function getcWbtc() external view
returns(address)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

### getcZrx

```js
function getcZrx() external view
returns(address)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

### getBat

```js
function getBat() external view
returns(address)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

### getDai

```js
function getDai() external view
returns(address)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

### getRep

```js
function getRep() external view
returns(address)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

### getUsdc

```js
function getUsdc() external view
returns(address)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

### getWbtc

```js
function getWbtc() external view
returns(address)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

### getZrx

```js
function getZrx() external view
returns(address)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

### setPriceOracle

```js
function setPriceOracle(address _oracle) external nonpayable onlyOwner 
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _oracle | address |  | 

### setCeth

```js
function setCeth(address _cEth) external nonpayable onlyOwner 
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _cEth | address |  | 

### setCbat

```js
function setCbat(address _cBat) external nonpayable onlyOwner 
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _cBat | address |  | 

### setCdai

```js
function setCdai(address _cDai) external nonpayable onlyOwner 
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _cDai | address |  | 

### setCrep

```js
function setCrep(address _cRep) external nonpayable onlyOwner 
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _cRep | address |  | 

### setCusdc

```js
function setCusdc(address _cUsdc) external nonpayable onlyOwner 
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _cUsdc | address |  | 

### setCwbtc

```js
function setCwbtc(address _cWbtc) external nonpayable onlyOwner 
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _cWbtc | address |  | 

### setCzrx

```js
function setCzrx(address _cZrx) external nonpayable onlyOwner 
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _cZrx | address |  | 

### setBat

```js
function setBat(address _bat) external nonpayable onlyOwner 
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _bat | address |  | 

### setDai

```js
function setDai(address _dai) external nonpayable onlyOwner 
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _dai | address |  | 

### setRep

```js
function setRep(address _rep) external nonpayable onlyOwner 
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _rep | address |  | 

### setUsdc

```js
function setUsdc(address _usdc) external nonpayable onlyOwner 
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _usdc | address |  | 

### setWbtc

```js
function setWbtc(address _wbtc) external nonpayable onlyOwner 
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _wbtc | address |  | 

### setZrx

```js
function setZrx(address _zrx) external nonpayable onlyOwner 
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _zrx | address |  | 

### setIsCtoken

```js
function setIsCtoken(address _ctoken, bool _isCtoken) external nonpayable onlyOwner 
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _ctoken | address |  | 
| _isCtoken | bool |  | 

### setAssetToCtoken

```js
function setAssetToCtoken(address _asset, address _ctoken) external nonpayable onlyOwner 
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _asset | address |  | 
| _ctoken | address |  | 

### getPriceUnderlying

get asset price from Compound's oracle.

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

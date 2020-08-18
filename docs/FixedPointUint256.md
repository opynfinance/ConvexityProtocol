# FixedPointUint256.sol

View Source: [contracts/FixedPointUint256.sol](../contracts/FixedPointUint256.sol)

**FixedPointUint256**

## Contract Members
**Constants & Variables**

```js
uint256 private constant SCALING_FACTOR;

```

## Functions

- [fadd(uint256 a, uint256 b)](#fadd)
- [fsub(uint256 a, uint256 b)](#fsub)
- [fmul(uint256 a, uint256 b)](#fmul)
- [fdiv(uint256 a, uint256 b)](#fdiv)
- [min(uint256 a, uint256 b)](#min)
- [max(uint256 a, uint256 b)](#max)
- [isEqual(uint256 a, uint256 b)](#isequal)
- [isGreaterThan(uint256 a, uint256 b)](#isgreaterthan)
- [isGreaterThanOrEqual(uint256 a, uint256 b)](#isgreaterthanorequal)
- [isLessThan(uint256 a, uint256 b)](#islessthan)
- [isLessThanOrEqual(uint256 a, uint256 b)](#islessthanorequal)

### fadd

return the sum of two unsigned integer

```js
function fadd(uint256 a, uint256 b) internal pure
returns(uint256)
```

**Returns**

sum of two unsigned integer

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| a | uint256 | unsigned integer | 
| b | uint256 | unsigned integer | 

### fsub

return the difference of two unsigned integer

```js
function fsub(uint256 a, uint256 b) internal pure
returns(uint256)
```

**Returns**

difference of two unsigned integer

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| a | uint256 | unsigned integer | 
| b | uint256 | unsigned integer | 

### fmul

multiply two unsigned integer

```js
function fmul(uint256 a, uint256 b) internal pure
returns(uint256)
```

**Returns**

mul of two unsigned integer

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| a | uint256 | unsigned integer | 
| b | uint256 | unsigned integer | 

### fdiv

divide two unsigned integer

```js
function fdiv(uint256 a, uint256 b) internal pure
returns(uint256)
```

**Returns**

div of two unsigned integer

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| a | uint256 | unsigned integer | 
| b | uint256 | unsigned integer | 

### min

the minimum between a and b

```js
function min(uint256 a, uint256 b) internal pure
returns(uint256)
```

**Returns**

min of two unsigned integer

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| a | uint256 | unsigned integer | 
| b | uint256 | unsigned integer | 

### max

the maximum between a and b

```js
function max(uint256 a, uint256 b) internal pure
returns(uint256)
```

**Returns**

max of two unsigned integer

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| a | uint256 | unsigned integer | 
| b | uint256 | unsigned integer | 

### isEqual

Whether `a` is equal to `b`.

```js
function isEqual(uint256 a, uint256 b) internal pure
returns(bool)
```

**Returns**

True if equal, or False.

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| a | uint256 | a unsigned integer | 
| b | uint256 | a unsigned integer | 

### isGreaterThan

Whether `a` is greater than `b`.

```js
function isGreaterThan(uint256 a, uint256 b) internal pure
returns(bool)
```

**Returns**

True if `a > b`, or False.

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| a | uint256 | a unsigned integer | 
| b | uint256 | a unsigned integer | 

### isGreaterThanOrEqual

Whether `a` is greater than or equal to `b`.

```js
function isGreaterThanOrEqual(uint256 a, uint256 b) internal pure
returns(bool)
```

**Returns**

True if `a >= b`, or False.

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| a | uint256 | a unsigned integer | 
| b | uint256 | a unsigned integer | 

### isLessThan

Whether `a` is less than `b`.

```js
function isLessThan(uint256 a, uint256 b) internal pure
returns(bool)
```

**Returns**

True if `a < b`, or False.

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| a | uint256 | a unsigned integer | 
| b | uint256 | a unsigned integer | 

### isLessThanOrEqual

Whether `a` is less than or equal to `b`.

```js
function isLessThanOrEqual(uint256 a, uint256 b) internal pure
returns(bool)
```

**Returns**

True if `a <= b`, or False.

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| a | uint256 | a unsigned integer | 
| b | uint256 | a unsigned integer | 

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

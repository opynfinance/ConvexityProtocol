# LibNote.sol

View Source: [contracts/lib/Dai.sol](../contracts/lib/Dai.sol)

**↗ Extends: [LibNote](LibNote.md)**
**↘ Derived Contracts: [Dai](Dai.md), [LibNote](LibNote.md)**

**LibNote**

## Contract Members
**Constants & Variables**

```js
mapping(address => uint256) public wards;
string public constant name;
string public constant symbol;
string public constant version;
uint8 public constant decimals;
uint256 public totalSupply;
mapping(address => uint256) public balanceOf;
mapping(address => mapping(address => uint256)) public allowance;
mapping(address => uint256) public nonces;
bytes32 public DOMAIN_SEPARATOR;
bytes32 public constant PERMIT_TYPEHASH;

```

**Events**

```js
event LogNote(bytes4 indexed sig, address indexed usr, bytes32 indexed arg1, bytes32 indexed arg2, bytes  data);
event Approval(address indexed src, address indexed guy, uint256  wad);
event Transfer(address indexed src, address indexed dst, uint256  wad);
```

## Modifiers

- [note](#note)
- [auth](#auth)

### note

```js
modifier note() internal
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

### auth

```js
modifier auth() internal
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

## Functions

- [rely(address guy)](#rely)
- [deny(address guy)](#deny)
- [add(uint256 x, uint256 y)](#add)
- [sub(uint256 x, uint256 y)](#sub)
- [(uint256 chainId_)](#)
- [transfer(address dst, uint256 wad)](#transfer)
- [transferFrom(address src, address dst, uint256 wad)](#transferfrom)
- [mint(address usr, uint256 wad)](#mint)
- [burn(address usr, uint256 wad)](#burn)
- [approve(address usr, uint256 wad)](#approve)
- [push(address usr, uint256 wad)](#push)
- [pull(address usr, uint256 wad)](#pull)
- [move(address src, address dst, uint256 wad)](#move)
- [permit(address holder, address spender, uint256 nonce, uint256 expiry, bool allowed, uint8 v, bytes32 r, bytes32 s)](#permit)

### rely

```js
function rely(address guy) external nonpayable note auth 
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| guy | address |  | 

### deny

```js
function deny(address guy) external nonpayable note auth 
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| guy | address |  | 

### add

```js
function add(uint256 x, uint256 y) internal pure
returns(z uint256)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| x | uint256 |  | 
| y | uint256 |  | 

### sub

```js
function sub(uint256 x, uint256 y) internal pure
returns(z uint256)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| x | uint256 |  | 
| y | uint256 |  | 

### 

```js
function (uint256 chainId_) public nonpayable
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| chainId_ | uint256 |  | 

### transfer

```js
function transfer(address dst, uint256 wad) external nonpayable
returns(bool)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| dst | address |  | 
| wad | uint256 |  | 

### transferFrom

```js
function transferFrom(address src, address dst, uint256 wad) public nonpayable
returns(bool)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| src | address |  | 
| dst | address |  | 
| wad | uint256 |  | 

### mint

```js
function mint(address usr, uint256 wad) external nonpayable auth 
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| usr | address |  | 
| wad | uint256 |  | 

### burn

```js
function burn(address usr, uint256 wad) external nonpayable
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| usr | address |  | 
| wad | uint256 |  | 

### approve

```js
function approve(address usr, uint256 wad) external nonpayable
returns(bool)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| usr | address |  | 
| wad | uint256 |  | 

### push

```js
function push(address usr, uint256 wad) external nonpayable
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| usr | address |  | 
| wad | uint256 |  | 

### pull

```js
function pull(address usr, uint256 wad) external nonpayable
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| usr | address |  | 
| wad | uint256 |  | 

### move

```js
function move(address src, address dst, uint256 wad) external nonpayable
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| src | address |  | 
| dst | address |  | 
| wad | uint256 |  | 

### permit

```js
function permit(address holder, address spender, uint256 nonce, uint256 expiry, bool allowed, uint8 v, bytes32 r, bytes32 s) external nonpayable
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| holder | address |  | 
| spender | address |  | 
| nonce | uint256 |  | 
| expiry | uint256 |  | 
| allowed | bool |  | 
| v | uint8 |  | 
| r | bytes32 |  | 
| s | bytes32 |  | 

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

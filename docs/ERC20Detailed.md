# ERC20Detailed.sol

View Source: [@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol](../@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol)

**↗ Extends: [IERC20](IERC20.md)**

**ERC20Detailed**

Optional functions from the ERC20 standard.

## Contract Members
**Constants & Variables**

```js
string private _name;
string private _symbol;
uint8 private _decimals;

```

## Functions

- [(string name, string symbol, uint8 decimals)](#)
- [name()](#name)
- [symbol()](#symbol)
- [decimals()](#decimals)

### 

Sets the values for `name`, `symbol`, and `decimals`. All three of
these values are immutable: they can only be set once during
construction.

```js
function (string name, string symbol, uint8 decimals) public nonpayable
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| name | string |  | 
| symbol | string |  | 
| decimals | uint8 |  | 

### name

Returns the name of the token.

```js
function name() public view
returns(string)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

### symbol

Returns the symbol of the token, usually a shorter version of the
name.

```js
function symbol() public view
returns(string)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

### decimals

Returns the number of decimals used to get its user representation.
For example, if `decimals` equals `2`, a balance of `505` tokens should
be displayed to a user as `5,05` (`505 / 10 ** 2`).
     * Tokens usually opt for a value of 18, imitating the relationship between
Ether and Wei.
     * NOTE: This information is only used for _display_ purposes: it in
no way affects any of the arithmetic of the contract, including
{IERC20-balanceOf} and {IERC20-transfer}.

```js
function decimals() public view
returns(uint8)
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

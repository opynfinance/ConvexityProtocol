# Roles (Roles.sol)

View Source: [@openzeppelin/contracts/access/Roles.sol](../@openzeppelin/contracts/access/Roles.sol)

**Roles**

Library for managing addresses assigned to a Role.

## Structs
### Role

```js
struct Role {
 mapping(address => bool) bearer
}
```

## Functions

- [add(struct Roles.Role role, address account)](#add)
- [remove(struct Roles.Role role, address account)](#remove)
- [has(struct Roles.Role role, address account)](#has)

### add

Give an account access to this role.

```js
function add(struct Roles.Role role, address account) internal nonpayable
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| role | struct Roles.Role |  | 
| account | address |  | 

### remove

Remove an account's access to this role.

```js
function remove(struct Roles.Role role, address account) internal nonpayable
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| role | struct Roles.Role |  | 
| account | address |  | 

### has

Check if an account has this role.

```js
function has(struct Roles.Role role, address account) internal view
returns(bool)
```

**Returns**

bool

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| role | struct Roles.Role |  | 
| account | address |  | 

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

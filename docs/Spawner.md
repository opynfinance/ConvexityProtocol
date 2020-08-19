# Spawn (Spawner.sol)

View Source: [contracts/packages/Spawner.sol](../contracts/packages/Spawner.sol)

**Spawner**

This contract provides creation code that is used by Spawner in order
to initialize and deploy eip-1167 minimal proxies for a given logic contract.

## Functions

- [(address logicContract, bytes initializationCalldata)](#)
- [_spawnOldSchool(address logicContract, bytes initializationCalldata)](#_spawnoldschool)
- [_spawnCreate(bytes initCode)](#_spawncreate)

### 

```js
function (address logicContract, bytes initializationCalldata) public payable
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| logicContract | address |  | 
| initializationCalldata | bytes |  | 

### _spawnOldSchool

Internal function for spawning an eip-1167 minimal proxy using
`CREATE`. This method will be slightly cheaper than standard _spawn in
cases where counterfactual address derivation is not required.

```js
function _spawnOldSchool(address logicContract, bytes initializationCalldata) internal nonpayable
returns(spawnedContract address)
```

**Returns**

The address of the newly-spawned contract.

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| logicContract | address | address The address of the logic contract. | 
| initializationCalldata | bytes | bytes The calldata that will be supplied to
the `DELEGATECALL` from the spawned contract to the logic contract during
contract creation. | 

### _spawnCreate

Private function for spawning a compact eip-1167 minimal proxy
using `CREATE`. Provides logic that is reused by internal functions.

```js
function _spawnCreate(bytes initCode) private nonpayable
returns(spawnedContract address)
```

**Returns**

The address of the newly-spawned contract.

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| initCode | bytes | bytes The contract creation code. | 

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

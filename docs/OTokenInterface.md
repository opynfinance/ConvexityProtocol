# OTokenInterface.sol

View Source: [contracts/interfaces/OtokenInterface.sol](../contracts/interfaces/OtokenInterface.sol)

**OTokenInterface**

## Functions

- [initialize(address _collateral, int32 _collExp, address _underlying, int32 _underlyingExp, int32 _oTokenExchangeExp, uint256 _strikePrice, int32 _strikeExp, address _strike, uint256 _expiry, address _optionsExchange, address _oracleAddress, uint256 _windowSize)](#initialize)
- [transferOwnership(address _newOwner)](#transferownership)

### initialize

```js
function initialize(address _collateral, int32 _collExp, address _underlying, int32 _underlyingExp, int32 _oTokenExchangeExp, uint256 _strikePrice, int32 _strikeExp, address _strike, uint256 _expiry, address _optionsExchange, address _oracleAddress, uint256 _windowSize) external nonpayable
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _collateral | address |  | 
| _collExp | int32 |  | 
| _underlying | address |  | 
| _underlyingExp | int32 |  | 
| _oTokenExchangeExp | int32 |  | 
| _strikePrice | uint256 |  | 
| _strikeExp | int32 |  | 
| _strike | address |  | 
| _expiry | uint256 |  | 
| _optionsExchange | address |  | 
| _oracleAddress | address |  | 
| _windowSize | uint256 |  | 

### transferOwnership

```js
function transferOwnership(address _newOwner) external nonpayable
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _newOwner | address |  | 

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

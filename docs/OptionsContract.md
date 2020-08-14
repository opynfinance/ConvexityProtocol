# Opyn's Options Contract (OptionsContract.sol)

View Source: [contracts/OptionsContract.sol](../contracts/OptionsContract.sol)

**↗ Extends: [Ownable](Ownable.md), [ERC20](ERC20.md)**
**↘ Derived Contracts: [oToken](oToken.md)**

**OptionsContract**

## Structs
### Number

```js
struct Number {
 uint256 value,
 int32 exponent
}
```

### Vault

```js
struct Vault {
 uint256 collateral,
 uint256 oTokensIssued,
 uint256 underlying,
 bool owned
}
```

## Contract Members
**Constants & Variables**

```js
//public members
contract OptionsExchange public optionsExchange;
address payable[] public vaultOwners;
struct OptionsContract.Number public liquidationIncentive;
struct OptionsContract.Number public transactionFee;
struct OptionsContract.Number public liquidationFactor;
struct OptionsContract.Number public minCollateralizationRatio;
struct OptionsContract.Number public strikePrice;
struct OptionsContract.Number public oTokenExchangeRate;
uint256 public expiry;
int32 public collateralExp;
int32 public underlyingExp;
contract IERC20 public collateral;
contract IERC20 public underlying;
contract IERC20 public strike;
contract CompoundOracleInterface public compoundOracle;
string public name;
string public symbol;
uint8 public decimals;

//internal members
mapping(address => struct OptionsContract.Vault) internal vaults;
uint256 internal windowSize;
uint256 internal totalFee;

```

**Events**

```js
event VaultOpened(address payable  vaultOwner);
event ETHCollateralAdded(address payable  vaultOwner, uint256  amount, address  payer);
event ERC20CollateralAdded(address payable  vaultOwner, uint256  amount, address  payer);
event IssuedOTokens(address  issuedTo, uint256  oTokensIssued, address payable  vaultOwner);
event Liquidate(uint256  amtCollateralToPay, address payable  vaultOwner, address payable  liquidator);
event Exercise(uint256  amtUnderlyingToPay, uint256  amtCollateralToPay, address payable  exerciser, address payable  vaultExercisedFrom);
event RedeemVaultBalance(uint256  amtCollateralRedeemed, uint256  amtUnderlyingRedeemed, address payable  vaultOwner);
event BurnOTokens(address payable  vaultOwner, uint256  oTokensBurned);
event RemoveCollateral(uint256  amtRemoved, address payable  vaultOwner);
event UpdateParameters(uint256  liquidationIncentive, uint256  liquidationFactor, uint256  transactionFee, uint256  minCollateralizationRatio, address  owner);
event TransferFee(address payable  to, uint256  fees);
event RemoveUnderlying(uint256  amountUnderlying, address payable  vaultOwner);
```

## Modifiers

- [notExpired](#notexpired)

### notExpired

Throws if called Options contract is expired.

```js
modifier notExpired() internal
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

## Functions

- [(IERC20 _collateral, int32 _collExp, IERC20 _underlying, int32 _underlyingExp, int32 _oTokenExchangeExp, uint256 _strikePrice, int32 _strikeExp, IERC20 _strike, uint256 _expiry, OptionsExchange _optionsExchange, address _oracleAddress, uint256 _windowSize)](#)
- [getVaultOwnersLength()](#getvaultownerslength)
- [updateParameters(uint256 _liquidationIncentive, uint256 _liquidationFactor, uint256 _transactionFee, uint256 _minCollateralizationRatio)](#updateparameters)
- [setDetails(string _name, string _symbol)](#setdetails)
- [transferFee(address payable _address)](#transferfee)
- [hasVault(address payable _owner)](#hasvault)
- [openVault()](#openvault)
- [addETHCollateral(address payable vaultOwner)](#addethcollateral)
- [addERC20Collateral(address payable vaultOwner, uint256 amt)](#adderc20collateral)
- [underlyingRequiredToExercise(uint256 oTokensToExercise)](#underlyingrequiredtoexercise)
- [isExerciseWindow()](#isexercisewindow)
- [hasExpired()](#hasexpired)
- [exercise(uint256 oTokensToExercise, address payable[] vaultsToExerciseFrom)](#exercise)
- [removeUnderlying()](#removeunderlying)
- [issueOTokens(uint256 oTokensToIssue, address receiver)](#issueotokens)
- [getVault(address payable vaultOwner)](#getvault)
- [isETH(IERC20 _ierc20)](#iseth)
- [burnOTokens(uint256 amtToBurn)](#burnotokens)
- [removeCollateral(uint256 amtToRemove)](#removecollateral)
- [redeemVaultBalance()](#redeemvaultbalance)
- [maxOTokensLiquidatable(address payable vaultOwner)](#maxotokensliquidatable)
- [liquidate(address payable vaultOwner, uint256 oTokensToLiquidate)](#liquidate)
- [isUnsafe(address payable vaultOwner)](#isunsafe)
- [isWithinExponentRange(int32 val)](#iswithinexponentrange)
- [getCollateral(address payable vaultOwner)](#getcollateral)
- [getOTokensIssued(address payable vaultOwner)](#getotokensissued)
- [_exercise(uint256 oTokensToExercise, address payable vaultToExerciseFrom)](#_exercise)
- [_addCollateral(address payable vaultOwner, uint256 amt)](#_addcollateral)
- [isSafe(uint256 collateralAmt, uint256 oTokensIssued)](#issafe)
- [maxOTokensIssuable(uint256 collateralAmt)](#maxotokensissuable)
- [calculateOTokens(uint256 collateralAmt, struct OptionsContract.Number proportion)](#calculateotokens)
- [calculateCollateralToPay(uint256 _oTokens, struct OptionsContract.Number proportion)](#calculatecollateraltopay)
- [transferCollateral(address payable _addr, uint256 _amt)](#transfercollateral)
- [transferUnderlying(address payable _addr, uint256 _amt)](#transferunderlying)
- [getPrice(address asset)](#getprice)

### 

```js
function (IERC20 _collateral, int32 _collExp, IERC20 _underlying, int32 _underlyingExp, int32 _oTokenExchangeExp, uint256 _strikePrice, int32 _strikeExp, IERC20 _strike, uint256 _expiry, OptionsExchange _optionsExchange, address _oracleAddress, uint256 _windowSize) public nonpayable
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _collateral | IERC20 | The collateral asset | 
| _collExp | int32 | The precision of the collateral (-18 if ETH) | 
| _underlying | IERC20 | The asset that is being protected | 
| _underlyingExp | int32 | The precision of the underlying asset | 
| _oTokenExchangeExp | int32 | The precision of the `amount of underlying` that 1 oToken protects | 
| _strikePrice | uint256 | The amount of strike asset that will be paid out per oToken | 
| _strikeExp | int32 | The precision of the strike price. | 
| _strike | IERC20 | Price The amount of strike asset that will be paid out per oToken | 
| _expiry | uint256 | The time at which the insurance expires | 
| _optionsExchange | OptionsExchange | The contract which interfaces with the exchange + oracle | 
| _oracleAddress | address | The address of the oracle | 
| _windowSize | uint256 | UNIX time. Exercise window is from `expiry - _windowSize` to `expiry`. | 

### getVaultOwnersLength

This function gets the length of vaultOwners array

```js
function getVaultOwnersLength() external view
returns(uint256)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

### updateParameters

Can only be called by owner. Used to update the fees, minCollateralizationRatio, etc

```js
function updateParameters(uint256 _liquidationIncentive, uint256 _liquidationFactor, uint256 _transactionFee, uint256 _minCollateralizationRatio) external nonpayable onlyOwner 
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _liquidationIncentive | uint256 | The incentive paid to liquidator. 10 is 0.01 i.e. 1% incentive. | 
| _liquidationFactor | uint256 | Max amount that a Vault can be liquidated by. 500 is 0.5. | 
| _transactionFee | uint256 | The fees paid to our protocol every time a execution happens. 100 is egs. 0.1 i.e. 10%. | 
| _minCollateralizationRatio | uint256 | The minimum ratio of a Vault's collateral to insurance promised. 16 means 1.6. | 

### setDetails

Can only be called by owner. Used to set the name, symbol and decimals of the contract

```js
function setDetails(string _name, string _symbol) external nonpayable onlyOwner 
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _name | string | The name of the contract | 
| _symbol | string | The symbol of the contract | 

### transferFee

Can only be called by owner. Used to take out the protocol fees from the contract.

```js
function transferFee(address payable _address) external nonpayable onlyOwner 
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _address | address payable | The address to send the fee to. | 

### hasVault

Checks if a `owner` has already created a Vault

```js
function hasVault(address payable _owner) public view
returns(bool)
```

**Returns**

true or false

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _owner | address payable | The address of the supposed owner | 

### openVault

Creates a new empty Vault and sets the owner of the vault to be the msg.sender.

```js
function openVault() public nonpayable notExpired 
returns(bool)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

### addETHCollateral

If the collateral type is ETH, anyone can call this function any time before
expiry to increase the amount of collateral in a Vault. Will fail if ETH is not the
collateral asset.
Remember that adding ETH collateral even if no oTokens have been created can put the owner at a
risk of losing the collateral if an exercise event happens.
Ensure that you issue and immediately sell oTokens to allow the owner to earn premiums.
(Either call the createAndSell function in the oToken contract or batch the
addERC20Collateral, issueOTokens and sell transactions and ensure they happen atomically to protect
the end user).

```js
function addETHCollateral(address payable vaultOwner) public payable notExpired 
returns(uint256)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| vaultOwner | address payable | the index of the Vault to which collateral will be added. | 

### addERC20Collateral

If the collateral type is any ERC20, anyone can call this function any time before
expiry to increase the amount of collateral in a Vault. Can only transfer in the collateral asset.
Will fail if ETH is the collateral asset.
The user has to allow the contract to handle their ERC20 tokens on his behalf before these
functions are called.
Remember that adding ERC20 collateral even if no oTokens have been created can put the owner at a
risk of losing the collateral. Ensure that you issue and immediately sell the oTokens!
(Either call the createAndSell function in the oToken contract or batch the
addERC20Collateral, issueOTokens and sell transactions and ensure they happen atomically to protect
the end user).

```js
function addERC20Collateral(address payable vaultOwner, uint256 amt) public nonpayable notExpired 
returns(uint256)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| vaultOwner | address payable | the index of the Vault to which collateral will be added. | 
| amt | uint256 | the amount of collateral to be transferred in. | 

### underlyingRequiredToExercise

Returns the amount of underlying to be transferred during an exercise call

```js
function underlyingRequiredToExercise(uint256 oTokensToExercise) public view
returns(uint256)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| oTokensToExercise | uint256 |  | 

### isExerciseWindow

Returns true if exercise can be called

```js
function isExerciseWindow() public view
returns(bool)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

### hasExpired

Returns true if the oToken contract has expired

```js
function hasExpired() public view
returns(bool)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

### exercise

Called by anyone holding the oTokens and underlying during the
exercise window i.e. from `expiry - windowSize` time to `expiry` time. The caller
transfers in their oTokens and corresponding amount of underlying and gets
`strikePrice * oTokens` amount of collateral out. The collateral paid out is taken from
the each vault owner starting with the first and iterating until the oTokens to exercise
are found.
NOTE: This uses a for loop and hence could run out of gas if the array passed in is too big!

```js
function exercise(uint256 oTokensToExercise, address payable[] vaultsToExerciseFrom) public payable
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| oTokensToExercise | uint256 | the number of oTokens being exercised. | 
| vaultsToExerciseFrom | address payable[] | the array of vaults to exercise from. | 

### removeUnderlying

This function allows the vault owner to remove their share of underlying after an exercise

```js
function removeUnderlying() external nonpayable
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

### issueOTokens

This function is called to issue the option tokens. Remember that issuing oTokens even if they
haven't been sold can put the owner at a risk of not making premiums on the oTokens. Ensure that you
issue and immidiately sell the oTokens! (Either call the createAndSell function in the oToken contract
of batch the issueOTokens transaction with a sell transaction and ensure it happens atomically).

```js
function issueOTokens(uint256 oTokensToIssue, address receiver) public nonpayable notExpired 
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| oTokensToIssue | uint256 | The number of o tokens to issue | 
| receiver | address | The address to send the oTokens to | 

### getVault

Returns the vault for a given address

```js
function getVault(address payable vaultOwner) external view
returns(uint256, uint256, uint256, bool)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| vaultOwner | address payable | the owner of the Vault to return | 

### isETH

Returns true if the given ERC20 is ETH.

```js
function isETH(IERC20 _ierc20) public pure
returns(bool)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _ierc20 | IERC20 | the ERC20 asset. | 

### burnOTokens

allows the owner to burn their oTokens to increase the collateralization ratio of
their vault.

```js
function burnOTokens(uint256 amtToBurn) external nonpayable notExpired 
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| amtToBurn | uint256 | number of oTokens to burn | 

### removeCollateral

allows the owner to remove excess collateral from the vault before expiry. Removing collateral lowers
the collateralization ratio of the vault.

```js
function removeCollateral(uint256 amtToRemove) external nonpayable notExpired 
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| amtToRemove | uint256 | Amount of collateral to remove in 10^-18. | 

### redeemVaultBalance

after expiry, each vault holder can get back their proportional share of collateral
from vaults that they own.

```js
function redeemVaultBalance() external nonpayable
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

### maxOTokensLiquidatable

```js
function maxOTokensLiquidatable(address payable vaultOwner) external view
returns(uint256)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| vaultOwner | address payable | The index of the vault to be liquidated | 

### liquidate

This function can be called by anyone who notices a vault is undercollateralized.
The caller gets a reward for reducing the amount of oTokens in circulation.

```js
function liquidate(address payable vaultOwner, uint256 oTokensToLiquidate) external nonpayable notExpired 
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| vaultOwner | address payable | The index of the vault to be liquidated | 
| oTokensToLiquidate | uint256 | The number of oTokens being taken out of circulation | 

### isUnsafe

checks if a vault is unsafe. If so, it can be liquidated

```js
function isUnsafe(address payable vaultOwner) public view
returns(bool)
```

**Returns**

true or false

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| vaultOwner | address payable | The number of the vault to check | 

### isWithinExponentRange

This function returns if an -30 <= exponent <= 30

```js
function isWithinExponentRange(int32 val) internal pure
returns(bool)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| val | int32 |  | 

### getCollateral

This function calculates and returns the amount of collateral in the vault

```js
function getCollateral(address payable vaultOwner) internal view
returns(uint256)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| vaultOwner | address payable |  | 

### getOTokensIssued

This function calculates and returns the amount of puts issued by the Vault

```js
function getOTokensIssued(address payable vaultOwner) internal view
returns(uint256)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| vaultOwner | address payable |  | 

### _exercise

Called by anyone holding the oTokens and underlying during the
exercise window i.e. from `expiry - windowSize` time to `expiry` time. The caller
transfers in their oTokens and corresponding amount of underlying and gets
`strikePrice * oTokens` amount of collateral out. The collateral paid out is taken from
the specified vault holder. At the end of the expiry window, the vault holder can redeem their balance
of collateral. The vault owner can withdraw their underlying at any time.
The user has to allow the contract to handle their oTokens and underlying on his behalf before these functions are called.

```js
function _exercise(uint256 oTokensToExercise, address payable vaultToExerciseFrom) internal nonpayable
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| oTokensToExercise | uint256 | the number of oTokens being exercised. | 
| vaultToExerciseFrom | address payable | the address of the vaultOwner to take collateral from. | 

### _addCollateral

adds `_amt` collateral to `vaultOwner` and returns the new balance of the vault

```js
function _addCollateral(address payable vaultOwner, uint256 amt) internal nonpayable notExpired 
returns(uint256)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| vaultOwner | address payable | the index of the vault | 
| amt | uint256 | the amount of collateral to add | 

### isSafe

checks if a hypothetical vault is safe with the given collateralAmt and oTokensIssued

```js
function isSafe(uint256 collateralAmt, uint256 oTokensIssued) internal view
returns(bool)
```

**Returns**

true or false

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| collateralAmt | uint256 | The amount of collateral the hypothetical vault has | 
| oTokensIssued | uint256 | The amount of oTokens generated by the hypothetical vault | 

### maxOTokensIssuable

```js
function maxOTokensIssuable(uint256 collateralAmt) external view
returns(uint256)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| collateralAmt | uint256 | The amount of collateral against which oTokens will be issued. | 

### calculateOTokens

This function is used to calculate the amount of tokens that can be issued.

```js
function calculateOTokens(uint256 collateralAmt, struct OptionsContract.Number proportion) internal view
returns(uint256)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| collateralAmt | uint256 | The amount of collateral | 
| proportion | struct OptionsContract.Number | The proportion of the collateral to pay out. If 100% of collateral
should be paid out, pass in Number(1, 0). The proportion might be less than 100% if
you are calculating fees. | 

### calculateCollateralToPay

This function calculates the amount of collateral to be paid out.

```js
function calculateCollateralToPay(uint256 _oTokens, struct OptionsContract.Number proportion) internal view
returns(uint256)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _oTokens | uint256 | The number of oTokens. | 
| proportion | struct OptionsContract.Number | The proportion of the collateral to pay out. If 100% of collateral
should be paid out, pass in Number(1, 0). The proportion might be less than 100% if
you are calculating fees. | 

### transferCollateral

This function transfers `amt` collateral to `_addr`

```js
function transferCollateral(address payable _addr, uint256 _amt) internal nonpayable
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _addr | address payable | The address to send the collateral to | 
| _amt | uint256 | The amount of the collateral to pay out. | 

### transferUnderlying

This function transfers `amt` underlying to `_addr`

```js
function transferUnderlying(address payable _addr, uint256 _amt) internal nonpayable
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _addr | address payable | The address to send the underlying to | 
| _amt | uint256 | The amount of the underlying to pay out. | 

### getPrice

This function gets the price ETH (wei) to asset price.

```js
function getPrice(address asset) internal view
returns(uint256)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| asset | address | The address of the asset to get the price of | 

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

pragma solidity 0.5.10;

import "./oToken.sol";
import "./lib/StringComparator.sol";
import "./packages/Ownable.sol";
import "./packages/IERC20.sol";


contract OptionsFactory is Ownable {
    using StringComparator for string;

    mapping(address => bool) public whitelisted;
    address[] public optionsContracts;

    // The contract which interfaces with the exchange
    OptionsExchange public optionsExchange;
    address public oracleAddress;

    event OptionsContractCreated(address addr);
    event AssetWhitelisted(address indexed asset);

    /**
     * @param _optionsExchangeAddr: The contract which interfaces with the exchange
     * @param _oracleAddress Address of the oracle
     */
    constructor(OptionsExchange _optionsExchangeAddr, address _oracleAddress)
        public
    {
        optionsExchange = OptionsExchange(_optionsExchangeAddr);
        oracleAddress = _oracleAddress;
    }

    /**
     * @notice creates a new Option Contract
     * @param _collateral The collateral asset. Eg. "ETH"
     * @param _underlying The underlying asset. Eg. "DAI"
     * @param _oTokenExchangeExp Units of underlying that 1 oToken protects
     * @param _strikePrice The amount of strike asset that will be paid out
     * @param _strikeExp The precision of the strike Price
     * @param _strike The asset in which the insurance is calculated
     * @param _expiry The time at which the insurance expires
     * @param _windowSize UNIX time. Exercise window is from `expiry - _windowSize` to `expiry`.
     */
    function createOptionsContract(
        address _collateral,
        address _underlying,
        address _strike,
        int32 _oTokenExchangeExp,
        uint256 _strikePrice,
        int32 _strikeExp,
        uint256 _expiry,
        uint256 _windowSize,
        string calldata _name,
        string calldata _symbol
    ) external returns (address) {
        require(whitelisted[_collateral], "Collateral not whitelisted.");
        require(whitelisted[_underlying], "Underlying not whitelisted.");
        require(whitelisted[_strike], "Strike not whitelisted.");

        require(_expiry > block.timestamp, "Cannot create an expired option");
        require(_windowSize <= _expiry, "Invalid _windowSize");

        oToken otoken = new oToken(
            _collateral,
            _underlying,
            _strike,
            _oTokenExchangeExp,
            _strikePrice,
            _strikeExp,
            _expiry,
            _windowSize,
            optionsExchange,
            oracleAddress
        );

        otoken.setDetails(_name, _symbol);

        optionsContracts.push(address(otoken));
        emit OptionsContractCreated(address(otoken));

        // Set the owner for the options contract.
        otoken.transferOwnership(owner());
        return address(otoken);
    }

    /**
     * @notice The number of Option Contracts that the Factory contract has stored
     */
    function getNumberOfOptionsContracts() external view returns (uint256) {
        return optionsContracts.length;
    }

    /**
     * @notice The owner of the Factory Contract can update an asset's address, by adding it, changing the address or removing the asset
     * @param _asset The address for the asset
     */
    function whitelistAsset(address _asset) external onlyOwner {
        whitelisted[_asset] = true;
        emit AssetWhitelisted(_asset);
    }
}

pragma solidity 0.5.10;

import "./oToken.sol";
import "./lib/StringComparator.sol";
import "./packages/Ownable.sol";
import "./packages/IERC20.sol";


contract OptionsFactory is Ownable {
    using StringComparator for string;

    // keys saved in front-end -- look at the docs if needed
    mapping(string => IERC20) public tokens;
    address[] public optionsContracts;

    // The contract which interfaces with the exchange
    OptionsExchange public optionsExchange;
    address public oracleAddress;

    event OptionsContractCreated(address addr);
    event AssetUpdated(
        string indexed asset,
        address indexed oldAddr,
        address indexed newAddr
    );

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
     * @param _collateralType The collateral asset. Eg. "ETH"
     * @param _collateralExp The number of decimals the collateral asset has
     * @param _underlyingType The underlying asset. Eg. "DAI"
     * @param _underlyingExp The precision of the underlying asset. Eg. (-18 if Dai)
     * @param _oTokenExchangeExp Units of underlying that 1 oToken protects
     * @param _strikePrice The amount of strike asset that will be paid out
     * @param _strikeExp The precision of the strike Price
     * @param _strikeAsset The asset in which the insurance is calculated
     * @param _expiry The time at which the insurance expires
     * @param _windowSize UNIX time. Exercise window is from `expiry - _windowSize` to `expiry`.
     */
    function createOptionsContract(
        string calldata _collateralType,
        int32 _collateralExp,
        string calldata _underlyingType,
        int32 _underlyingExp,
        int32 _oTokenExchangeExp,
        uint256 _strikePrice,
        int32 _strikeExp,
        string calldata _strikeAsset,
        uint256 _expiry,
        uint256 _windowSize
    ) external returns (address) {
        require(_expiry > block.timestamp, "Cannot create an expired option");
        require(_windowSize <= _expiry, "Invalid _windowSize");
        require(
            supportsAsset(_collateralType),
            "Collateral type not supported"
        );
        require(
            supportsAsset(_underlyingType),
            "Underlying type not supported"
        );
        require(supportsAsset(_strikeAsset), "Strike asset type not supported");

        oToken optionsContract = new oToken(
            tokens[_collateralType],
            _collateralExp,
            tokens[_underlyingType],
            _underlyingExp,
            _oTokenExchangeExp,
            _strikePrice,
            _strikeExp,
            tokens[_strikeAsset],
            _expiry,
            optionsExchange,
            oracleAddress,
            _windowSize
        );

        optionsContracts.push(address(optionsContract));
        emit OptionsContractCreated(address(optionsContract));

        // Set the owner for the options contract.
        optionsContract.transferOwnership(owner());

        return address(optionsContract);
    }

    /**
     * @notice The number of Option Contracts that the Factory contract has stored
     */
    function getNumberOfOptionsContracts() external view returns (uint256) {
        return optionsContracts.length;
    }

    /**
     * @notice The owner of the Factory Contract can update an asset's address, by adding it, changing the address or removing the asset
     * @param _asset The ticker symbol for the asset
     * @param _addr The address of the asset
     */
    function updateAsset(string calldata _asset, address _addr)
        external
        onlyOwner
    {
        emit AssetUpdated(_asset, address(tokens[_asset]), _addr);

        tokens[_asset] = IERC20(_addr);
    }

    /**
     * @notice Check if the Factory contract supports a specific asset
     * @param _asset The ticker symbol for the asset
     */
    function supportsAsset(string memory _asset) public view returns (bool) {
        if (_asset.compareStrings("ETH")) {
            return true;
        }

        return tokens[_asset] != IERC20(0);
    }
}

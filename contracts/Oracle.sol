pragma solidity 0.5.10;

import "./interfaces/CompoundOracleInterface.sol";
import "./interfaces/CTokenInterface.sol";
import "./packages/ERC20Detailed.sol";
import "./packages/ERC20.sol";
import "./packages/Ownable.sol";
import "./packages/SafeMath.sol";


contract Oracle is Ownable {
    using SafeMath for uint256;

    // used ctoken addresses
    address internal cEth;

    mapping(address => bool) public isCtoken;
    mapping(address => address) public assetToCtokens;

    // The Oracle used for the contract
    CompoundOracleInterface public priceOracle;

    constructor(address _oracleAddress) public {
        priceOracle = CompoundOracleInterface(_oracleAddress);
    }

    event CtokenUpdated(address indexed ctoken, bool isCtoken);
    event AssetToCtokenUpdated(address indexed asset, address ctoken);

    /**
     * @dev get an asset's price in wei
     * For ETH: return 1e18 because 1 eth = 1e18 wei
     * For other assets: ex: USDC: return 2349016936412111
     *  => 1 USDC = 2349016936412111 wei
     *  => 1 ETH = 1e18 / 2349016936412111 USDC = 425.71 USDC
     * @param asset The address of the token.
     * @return The price in wei.
     */

    function getPrice(address asset) external view returns (uint256) {
        if (asset == address(0)) {
            return (10**18);
        } else {
            uint256 exchangeRate = 1e18;
            uint256 cTokenDecimals = 8;
            address underlying = asset;

            if (isCtoken[asset]) {
                CTokenInterface cToken = CTokenInterface(asset);
                // 1e18 * TOKEN/CTOKEN = exchangeRate * 10 ** (cTokenExp - underlyingExp)
                exchangeRate = cToken.exchangeRateStored().mul(
                    10**(cTokenDecimals)
                );

                if (asset == cEth) {
                    return exchangeRate.div(1e18);
                } else {
                    underlying = cToken.underlying();
                    uint256 underlyingExp = ERC20Detailed(underlying)
                        .decimals();
                    exchangeRate = exchangeRate.div(10**underlyingExp);
                }
            }

            if (assetToCtokens[underlying] != address(0)) {
                // get underlying asset price in USD with 18 decimals
                uint256 underlyingPrice = priceOracle.getUnderlyingPrice(
                    assetToCtokens[underlying]
                );
                // price has 6 degrees of precision
                uint256 ethPrice = priceOracle.price("ETH").mul(1e12);
                // price of underlying token
                uint256 price = underlyingPrice
                    .mul(exchangeRate)
                    .div(ethPrice)
                    .div(1e18);
                return price;
            }
            return 0;
        }
    }

    // /**
    //  * Asset Setters
    //  */
    function setPriceOracle(address _oracle) external onlyOwner {
        priceOracle = CompoundOracleInterface(_oracle);
    }

    function setCeth(address _cEth) external onlyOwner {
        cEth = _cEth;
    }

    function setIsCtoken(address _ctoken, bool _isCtoken) external onlyOwner {
        isCtoken[_ctoken] = _isCtoken;

        emit CtokenUpdated(_ctoken, _isCtoken);
    }

    function setAssetToCtoken(address _asset, address _ctoken)
        external
        onlyOwner
    {
        assetToCtokens[_asset] = _ctoken;

        emit AssetToCtokenUpdated(_asset, _ctoken);
    }
}

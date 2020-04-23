pragma solidity 0.5.10;

import "@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "./lib/CompoundOracleInterface.sol";
import "./lib/CTokenInterface.sol";


contract Oracle {
    using SafeMath for uint256;

    address internal cETH;
    address internal cBAT;
    address internal cDAI;
    address internal cREP;
    address internal cUSDC;
    address internal cWBTC;
    address internal cZRX;

    mapping(address => bool) internal isCToken;
    mapping(address => address) internal assetToCTokens;

    // The Oracle used for the contract
    CompoundOracleInterface public priceOracle;

    constructor(address _oracleAddress) public {
        require(
            _oracleAddress != address(0),
            "invalid compound oracle address"
        );

        priceOracle = CompoundOracleInterface(_oracleAddress);

        address eth = address(0);
        address bat = 0x0D8775F648430679A709E98d2b0Cb6250d2887EF;
        address dai = 0x6B175474E89094C44Da98b954EedeAC495271d0F;
        address rep = 0x1985365e9f78359a9B6AD760e32412f4a445E862;
        address usdc = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;
        address wbtc = 0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599;
        address zrx = 0xE41d2489571d322189246DaFA5ebDe1F4699F498;

        // Mainnet cToken
        cETH = 0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5;
        cBAT = 0x6C8c6b02E7b2BE14d4fA6022Dfd6d75921D90E4E;
        cDAI = 0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643;
        cREP = 0x158079Ee67Fce2f58472A96584A73C7Ab9AC95c1;
        cUSDC = 0x39AA39c021dfbaE8faC545936693aC917d5E7563;
        cWBTC = 0xC11b1268C1A384e55C48c2391d8d480264A3A7F4;
        cZRX = 0xB3319f5D18Bc0D84dD1b4825Dcde5d5f7266d407;

        isCToken[cETH] = true;
        isCToken[cBAT] = true;
        isCToken[cDAI] = true;
        isCToken[cREP] = true;
        isCToken[cWBTC] = true;
        isCToken[cUSDC] = true;
        isCToken[cZRX] = true;

        assetToCTokens[eth] = cETH;
        assetToCTokens[bat] = cBAT;
        assetToCTokens[dai] = cDAI;
        assetToCTokens[rep] = cREP;
        assetToCTokens[wbtc] = cWBTC;
        assetToCTokens[usdc] = cUSDC;
        assetToCTokens[zrx] = cZRX;
    }

    /**
     * @notice return cETH address
     */
    function getcEth() external view returns (address) {
        return cETH;
    }

    /**
     * @notice return cBAT address
     */
    function getcBat() external view returns (address) {
        return cBAT;
    }

    /**
     * @notice return cDAI address
     */
    function getcDai() external view returns (address) {
        return cDAI;
    }

    /**
     * @notice return cREP address
     */
    function getcRep() external view returns (address) {
        return cREP;
    }

    /**
     * @notice return cUSDC address
     */
    function getcUsdc() external view returns (address) {
        return cUSDC;
    }

    /**
     * @notice return cWBTC address
     */
    function getcWbtc() external view returns (address) {
        return cWBTC;
    }

    /**
     * @notice return cZRX address
     */
    function getcZrx() external view returns (address) {
        return cZRX;
    }

    /**
     * @notice check if asset is CETH token
     * @param asset asset address
     * @return bool
     */
    function isCETH(address asset) public view returns (bool) {
        return asset == cETH;
    }

    /**
     * @notice check if asset is ETH
     * @param asset asset address
     * @return bool
     */
    function isETH(address asset) public view returns (bool) {
        return asset == address(0);
    }

    /**
     * @notice check if asset is cToken
     * @param cToken cToken address
     * @return bool
     */
    function iscToken(address cToken) external view returns (bool) {
        return isCToken[cToken];
    }

    /**
     * @notice get Ctoken address that match a specific token
     * @param asset asset address
     * @return cToken address
     */
    function getCtokenAsset(address asset) external view returns (address) {
        return assetToCTokens[asset];
    }

    function getPrice(address asset) external view returns (uint256) {
        if (isETH(asset)) {
            return (10**18);
        } else {
            if (isCToken[asset]) {
                // 1. cTokens
                CTokenInterface cToken = CTokenInterface(asset);
                uint256 exchangeRate = cToken.exchangeRateStored();

                if (isCETH(asset)) {
                    uint256 numerator = 10**46;
                    return numerator.div(exchangeRate);
                }

                address underlyingAddress = cToken.underlying();
                uint256 decimalsOfUnderlying = ERC20Detailed(underlyingAddress)
                    .decimals();
                uint256 maxExponent = 10;
                uint256 exponent = maxExponent.add(decimalsOfUnderlying);

                // cTokenPriceInETH = underlying price in ETH * (cToken : underlying exchange rate)
                return
                    getPriceUnderlying(underlyingAddress).mul(exchangeRate).div(
                        10**exponent
                    );
            } else if (assetToCTokens[asset] != address(0)) {
                //2. Underlying Tokens that Compound lists
                return getPriceUnderlying(asset);
            }
            return 0;
        }
    }

    function getPriceUnderlying(address asset) internal view returns (uint256) {
        uint256 ethToAssetPrice = priceOracle.getUnderlyingPrice(
            ERC20(assetToCTokens[asset])
        );
        uint256 decimalsOfAsset = ERC20Detailed(asset).decimals();
        uint256 maxExponent = 18;
        uint256 exponent = maxExponent.sub(decimalsOfAsset);
        return ethToAssetPrice.div(10**exponent);
    }
}

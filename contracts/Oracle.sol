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
    address internal cBat;
    address internal cDai;
    address internal cRep;
    address internal cUsdc;
    address internal cWbtc;
    address internal cZrx;

    // used assets addresses
    address internal bat;
    address internal dai;
    address internal rep;
    address internal usdc;
    address internal wbtc;
    address internal zrx;

    mapping(address => bool) public isCtoken;
    mapping(address => address) public assetToCtokens;

    // The Oracle used for the contract
    CompoundOracleInterface public priceOracle;

    constructor(address _oracleAddress) public {
        priceOracle = CompoundOracleInterface(_oracleAddress);
        // Mainnet
        cEth = 0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5;
        cBat = 0x6C8c6b02E7b2BE14d4fA6022Dfd6d75921D90E4E;
        cDai = 0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643;
        cRep = 0x158079Ee67Fce2f58472A96584A73C7Ab9AC95c1;
        cUsdc = 0x39AA39c021dfbaE8faC545936693aC917d5E7563;
        cWbtc = 0xC11b1268C1A384e55C48c2391d8d480264A3A7F4;
        cZrx = 0xB3319f5D18Bc0D84dD1b4825Dcde5d5f7266d407;

        bat = 0x0D8775F648430679A709E98d2b0Cb6250d2887EF;
        dai = 0x6B175474E89094C44Da98b954EedeAC495271d0F;
        rep = 0x1985365e9f78359a9B6AD760e32412f4a445E862;
        usdc = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;
        wbtc = 0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599;
        zrx = 0xE41d2489571d322189246DaFA5ebDe1F4699F498;

        isCtoken[cBat] = true;
        isCtoken[cDai] = true;
        isCtoken[cEth] = true;
        isCtoken[cRep] = true;
        isCtoken[cWbtc] = true;
        isCtoken[cUsdc] = true;
        isCtoken[cZrx] = true;

        assetToCtokens[bat] = cBat;
        assetToCtokens[dai] = cDai;
        assetToCtokens[rep] = cRep;
        assetToCtokens[wbtc] = cWbtc;
        assetToCtokens[usdc] = cUsdc;
        assetToCtokens[zrx] = cZrx;
    }

    event CtokenUpdated(address indexed ctoken, bool isCtoken);
    event AssetToCtokenUpdated(address indexed asset, address ctoken);

    /**
     * Asset Getters
     */
    function iscEth(address asset) public view returns (bool) {
        return asset == cEth;
    }

    /**
     * @dev get an asset's price in wei
     * For ETH: return 1e18 because 1 eth = 1e18 wei
     * For other assets: ex: USDC: return 2349016936412111
     *  => 1 USDC = 2349016936412111 wei
     *  => 1 ETH = 1e18 / 2349016936412111 USDC = 425.71 USDC
     */
    function getPrice(address asset) external view returns (uint256) {
        if (asset == address(0)) {
            return (10**18);
        } else {
            if (isCtoken[asset]) {
                // 1. cTokens
                CTokenInterface cToken = CTokenInterface(asset);
                uint256 exchangeRate = cToken.exchangeRateStored();

                if (iscEth(asset)) {
                    uint256 decimalsDiff = 10;
                    return exchangeRate.div(10**decimalsDiff);
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
            } else if (assetToCtokens[asset] != address(0)) {
                //2. Underlying Tokens that Compound lists
                return getPriceUnderlying(asset);
            }
            return 0;
        }
    }

    function getcEth() external view returns (address) {
        return cEth;
    }

    function getcBat() external view returns (address) {
        return cBat;
    }

    function getcDai() external view returns (address) {
        return cDai;
    }

    function getcRep() external view returns (address) {
        return cRep;
    }

    function getcUsdc() external view returns (address) {
        return cUsdc;
    }

    function getcWbtc() external view returns (address) {
        return cWbtc;
    }

    function getcZrx() external view returns (address) {
        return cZrx;
    }

    function getBat() external view returns (address) {
        return bat;
    }

    function getDai() external view returns (address) {
        return dai;
    }

    function getRep() external view returns (address) {
        return rep;
    }

    function getUsdc() external view returns (address) {
        return usdc;
    }

    function getWbtc() external view returns (address) {
        return wbtc;
    }

    function getZrx() external view returns (address) {
        return zrx;
    }

    /**
     * Asset Setters
     */

    function setPriceOracle(address _oracle) external onlyOwner {
        priceOracle = CompoundOracleInterface(_oracle);
    }

    function setCeth(address _cEth) external onlyOwner {
        cEth = _cEth;
    }

    function setCbat(address _cBat) external onlyOwner {
        cBat = _cBat;
    }

    function setCdai(address _cDai) external onlyOwner {
        cDai = _cDai;
    }

    function setCrep(address _cRep) external onlyOwner {
        cRep = _cRep;
    }

    function setCusdc(address _cUsdc) external onlyOwner {
        cUsdc = _cUsdc;
    }

    function setCwbtc(address _cWbtc) external onlyOwner {
        cWbtc = _cWbtc;
    }

    function setCzrx(address _cZrx) external onlyOwner {
        cZrx = _cZrx;
    }

    // Setters for non-cTokens

    function setBat(address _bat) external onlyOwner {
        bat = _bat;
    }

    function setDai(address _dai) external onlyOwner {
        dai = _dai;
    }

    function setRep(address _rep) external onlyOwner {
        rep = _rep;
    }

    function setUsdc(address _usdc) external onlyOwner {
        usdc = _usdc;
    }

    function setWbtc(address _wbtc) external onlyOwner {
        wbtc = _wbtc;
    }

    function setZrx(address _zrx) external onlyOwner {
        zrx = _zrx;
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

    /**
     * @notice get asset price from Compound's oracle.
     */
    function getPriceUnderlying(address asset) internal view returns (uint256) {
        uint256 priceInWei = priceOracle.getUnderlyingPrice(
            ERC20(assetToCtokens[asset])
        );
        uint256 decimalsOfAsset = ERC20Detailed(asset).decimals();
        uint256 maxExponent = 18;
        uint256 exponent = maxExponent.sub(decimalsOfAsset);
        return priceInWei.div(10**exponent);
    }
}

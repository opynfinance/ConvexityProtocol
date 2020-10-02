pragma solidity ^0.5.10;

import "../packages/IERC20.sol";
import "../interfaces/CompoundOracleInterface.sol";


contract MockCompoundOracle is CompoundOracleInterface {
    mapping(string => uint256) private prices;
    mapping(string => bool) private supportedSymbols;
    mapping(address => uint256) private underlyingPrices;

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

    constructor() public {
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

        underlyingPrices[cEth] = 337.86 * 10e18;
        underlyingPrices[cBat] = 0.230202 * 10e18;
        underlyingPrices[cDai] = 1.01 * 10e18;
        underlyingPrices[cRep] = 14.02 * 10e18;
        underlyingPrices[cUsdc] = .997820 * 10e18;
        underlyingPrices[cWbtc] = 10502.78 * 10e18;
        underlyingPrices[cZrx] = 0.396114 * 10e18;

        supportedSymbols["BTC"] = true;
        prices["BTC"] = 10545.80 * 1e6;
    }

    /**
     * @dev Get the most recent price for a token in USD with 18 decimals of precision.
     * @param address The address of the cToken contract of the underlying asset.
     */
    function getUnderlyingPrice(address cToken)
        external
        view
        returns (uint256)
    {
        require(
            cToken != address(0),
            "MockCompoundOracle: Should not request with 0 address"
        );
        return underlyingPrices[cToken];
    }

    /**
     * @dev Get the most recent price for a token in USD.
     * @param symbol Symbol as a string
     * @return uint256 Price in USD with 6 decimals of precision.
     */
    function price(string calldata symbol) external view returns (uint256) {
        return prices[symbol];
    }

    // function updatePrice(uint256 newPrice) external {
    //     _price = newPrice;
    // }
}

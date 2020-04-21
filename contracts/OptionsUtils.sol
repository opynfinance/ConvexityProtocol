pragma solidity 0.5.10;

import "./lib/CompoundOracleInterface.sol";
import "./lib/UniswapExchangeInterface.sol";
import "./lib/UniswapFactoryInterface.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract OptionsUtils {
    // defauls are for mainnet
    UniswapFactoryInterface public uniswapFactory;

    CompoundOracleInterface public compoundOracle;

    constructor(address _uniswapFactory, address _compoundOracle) public {
        uniswapFactory = UniswapFactoryInterface(_uniswapFactory);
        compoundOracle = CompoundOracleInterface(_compoundOracle);
    }

    // TODO: for now gets Uniswap, later update to get other exchanges
    function getExchange(address _token)
        public
        view
        returns (UniswapExchangeInterface)
    {
        if (address(uniswapFactory.getExchange(_token)) == address(0)) {
            revert("No payout exchange");
        }

        UniswapExchangeInterface exchange = UniswapExchangeInterface(
            uniswapFactory.getExchange(_token)
        );

        return exchange;
    }

    function isETH(IERC20 _ierc20) public pure returns (bool) {
        return _ierc20 == IERC20(0);
    }
}

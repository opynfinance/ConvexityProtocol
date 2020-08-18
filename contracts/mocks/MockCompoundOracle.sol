pragma solidity 0.5.10;

import "../packages/IERC20.sol";
import "../interfaces/CompoundOracleInterface.sol";


contract MockCompoundOracle is CompoundOracleInterface {
    uint256 public price;

    constructor() public {
        price = 5 * (10**15);
    }

    function getUnderlyingPrice(IERC20 cToken) external view returns (uint256) {
        require(
            address(cToken) != address(0),
            "MockCompoundOracle: Should not request with 0 address"
        );
        return price;
    }

    function updatePrice(uint256 newPrice) external {
        price = newPrice;
    }
}

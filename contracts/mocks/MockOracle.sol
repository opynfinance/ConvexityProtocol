pragma solidity 0.5.10;

import "../interfaces/OracleInterface.sol";


contract MockOracle is OracleInterface {
    uint256 public price;

    constructor() public {
        price = 5 * (10**15);
    }

    function getPrice(address asset) external view returns (uint256) {
        if (asset == address(0)) {
            return (10**18);
        }
        return price;
    }

    function updatePrice(uint256 newPrice) external {
        price = newPrice;
    }
}

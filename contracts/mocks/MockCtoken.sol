pragma solidity 0.5.10;

import "../interfaces/OracleInterface.sol";


contract MockCtoken {
    address public underlying;
    uint256 public exchangeRateStored;

    constructor(address _underlying, uint256 _exchageRateStored) public {
        underlying = _underlying;
        exchangeRateStored = _exchageRateStored;
    }
}

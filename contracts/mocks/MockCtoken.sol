pragma solidity 0.5.10;

import "../interfaces/OracleInterface.sol";
import "./MockERC20.sol";


contract MockCtoken is MockERC20 {
    address public underlying;
    uint256 public exchangeRateStored;

    constructor(
        string memory _name,
        string memory _symbol,
        address _underlying,
        uint256 _exchageRateStored
    ) public MockERC20(_name, _symbol, 8) {
        underlying = _underlying;
        exchangeRateStored = _exchageRateStored;
    }
}

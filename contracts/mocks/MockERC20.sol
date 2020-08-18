pragma solidity 0.5.10;

import "../packages/ERC20Mintable.sol";
import "../packages/ERC20Detailed.sol";


contract MockERC20 is ERC20Detailed, ERC20Mintable {
    constructor(
        string memory _name,
        string memory _symbol,
        uint8 _decimals
    ) public ERC20Detailed(_name, _symbol, _decimals) {}
}

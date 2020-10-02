pragma solidity ^0.5.10;
// AT MAINNET ADDRESS: 0x02557a5E05DeFeFFD4cAe6D83eA3d173B272c904
import "../packages/ERC20.sol";


interface CompoundOracleInterface {
    function getUnderlyingPrice(address cToken) external view returns (uint256);

    function price(string calldata symbol) external view returns (uint256);
}

pragma solidity ^0.5.10;
// AT MAINNET ADDRESS: 0x9B8Eb8b3d6e2e0Db36F41455185FEF7049a35CaE
import "../packages/ERC20.sol";


interface CompoundOracleInterface {
    function getUnderlyingPrice(address cToken) external view returns (uint256);

    function price(string calldata symbol) external view returns (uint256);
}

pragma solidity ^0.5.10;


interface OracleInterface {
    function getPrice(address asset) external view returns (uint256);
}

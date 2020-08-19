pragma solidity ^0.5.10;


interface WethInterface {
    function deposit() external payable;

    function approve(address sender, uint256 amount) external;

    function balanceOf(address account) external view returns (uint256);

    function transfer(address recipient, uint256 amount)
        external
        returns (bool);
}

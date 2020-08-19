pragma solidity ^0.5.10;


interface OtokenInterface {
    function exercise(
        uint256 oTokensToExercise,
        address payable[] calldata vaultsToExerciseFrom
    ) external payable;

    function collateral() external view returns (address);

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool);
}

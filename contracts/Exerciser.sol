pragma solidity 0.5.10;

import "./interfaces/OtokenInterface.sol";
import "./interfaces/WethInterface.sol";
import "./packages/IERC20.sol";


contract Exerciser {
    WethInterface public weth;

    event WrapperExercise(
        address indexed otoken,
        uint256 indexed otokenAmount,
        uint256 indexed collateralExercised,
        address user
    );

    constructor(address payable _weth) public {
        weth = WethInterface(_weth);
    }

    function exercise(
        address _otoken,
        uint256 _amount,
        address payable[] calldata _owners
    ) external payable returns (uint256) {
        // 1. pull token from user's address
        OtokenInterface otoken = OtokenInterface(_otoken);
        otoken.transferFrom(msg.sender, address(this), _amount);
        // 2. convert eth to weth
        weth.deposit.value(msg.value)();
        // 3. exercise
        weth.approve(_otoken, msg.value);
        otoken.exercise(_amount, _owners);
        // 4. transfer collateral to user
        address collateral = otoken.collateral();
        uint256 amountToTakeOut = IERC20(collateral).balanceOf(address(this));
        IERC20(collateral).transfer(msg.sender, amountToTakeOut);
        // 5. transfer remaining weth back to user
        if (weth.balanceOf(address(this)) > 0) {
            weth.transfer(msg.sender, weth.balanceOf(address(this)));
        }

        emit WrapperExercise(_otoken, _amount, amountToTakeOut, msg.sender);
    }
}

pragma solidity 0.5.10;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MockOtokensExchange {

    uint256 public price;
    
    function sellOTokens(address payable receiver, address tokenIn, address tokenOut, uint256 inAmount) external {
        // transfer token in
        pullToken(msg.sender, tokenIn, inAmount);

        uint256 outAmount = price * inAmount;
        // transfer token out
        pushToken(receiver, tokenOut, outAmount);
    }

    function premiumReceived (address oTokenAddress, address payoutTokenAddress, uint256 oTokensToSell)
        view
        external 
        returns (uint256)
    {
        return price * oTokensToSell;
    }

    function setPrice(uint256 _price) external {
        price = _price;
    }

    function pullToken(address _from, address _token, uint256 _amount) internal {
        if(_token != address(0)) 
            IERC20(_token).transferFrom(_from, address(this), _amount);
    }

    function pushToken(address payable _to, address _token, uint256 _amount) internal {
        if(_token == address(0)) {
            _to.transfer(_amount);
        } else {
            IERC20(_token).transferFrom(address(this), _to, _amount);
        }
    }

    function () external payable {}
}
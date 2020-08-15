pragma solidity ^0.5.10;

import "./contracts/TestOptionsContract.sol";


contract EchidnaOptionsContract is TestOptionsContract {
    function echidna_windowsize_lessthan_orequal_expiry()
        public
        view
        returns (bool)
    {
        return windowSize <= expiry;
    }

    function echidna_collateral_exponent_is_withen_exponent_range()
        public
        view
        returns (bool)
    {
        return ((collateralExp <= 30) && (collateralExp >= -30));
    }

    function echidna_underlying_exponent_is_withen_exponent_range()
        public
        view
        returns (bool)
    {
        return ((underlyingExp <= 30) && (underlyingExp >= -30));
    }

    function echidna_strike_exponent_is_withen_exponent_range()
        public
        view
        returns (bool)
    {
        return ((strikePrice.exponent <= 30) && (strikePrice.exponent >= -30));
    }

    function echidna_exchange_rate_exponent_is_withen_exponent_range()
        public
        view
        returns (bool)
    {
        return ((oTokenExchangeRate.exponent <= 30) &&
            (oTokenExchangeRate.exponent >= -30));
    }
}

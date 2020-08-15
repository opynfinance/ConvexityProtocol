pragma solidity ^0.5.10;

import "./contracts/TestOptionsContract.sol";


contract EchidnaOptionsContract is TestOptionsContract {
    function echidna_windowsize_lessthan_equal_expiry()
        public
        view
        returns (bool)
    {
        return windowSize <= expiry;
    }

    function echidna_collateral_exponent_withen_exponent_range()
        public
        view
        returns (bool)
    {
        return ((collateralExp <= 30) && (collateralExp >= -30));
    }

    function echidna_underlying_exponent_withen_exponent_range()
        public
        view
        returns (bool)
    {
        return ((underlyingExp <= 30) && (underlyingExp >= -30));
    }

    function echidna_strike_exponent_withen_exponent_range()
        public
        view
        returns (bool)
    {
        return ((strikePrice.exponent <= 30) && (strikePrice.exponent >= -30));
    }

    function echidna_exchange_rate_exponent_withen_exponent_range()
        public
        view
        returns (bool)
    {
        return ((oTokenExchangeRate.exponent <= 30) &&
            (oTokenExchangeRate.exponent >= -30));
    }

    function echidna_liquiadtion_incentive_lessthan_equal_20percent()
        public
        view
        returns (bool)
    {
        return liquidationIncentive.value <= 200;
    }

    function echidna_liquiadtion_factor_lessthan_equal_100percent()
        public
        view
        returns (bool)
    {
        return liquidationFactor.value <= 1000;
    }

    function echidna_transaction_fee_lessthan_equal_10percent()
        public
        view
        returns (bool)
    {
        return transactionFee.value <= 100;
    }

    function echidna_min_collateralization_ration_greaterthan_equal_1()
        public
        view
        returns (bool)
    {
        return minCollateralizationRatio.value >= 10;
    }
}

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

    function echidna_vault_collateral_sum() public view returns (bool) {
        uint256 collateralSum = 0;
        if (vaultOwners.length > 0) {
            for (uint256 i = 0; i < vaultOwners.length; i++) {
                Vault memory vault = vaults[vaultOwners[i]];
                collateralSum = collateralSum.add(vault.collateral);
            }
        }

        uint256 collateralBalance = 0;
        if (isETH(collateral)) {
            collateralBalance = address(this).balance;
        } else {
            collateralBalance = collateral.balanceOf(address(this));
        }
        return collateralBalance == collateralSum;
    }

    function echidna_vault_oTokens_sum() public view returns (bool) {
        uint256 oTokensSum = 0;
        if (vaultOwners.length > 0) {
            for (uint256 i = 0; i < vaultOwners.length; i++) {
                Vault memory vault = vaults[vaultOwners[i]];
                oTokensSum = oTokensSum.add(vault.oTokensIssued);
            }
        }

        return oTokensSum == totalSupply();
    }

    function echidna_vault_underlying_sum() public view returns (bool) {
        uint256 underlyingSum = 0;
        if (vaultOwners.length > 0) {
            for (uint256 i = 0; i < vaultOwners.length; i++) {
                Vault memory vault = vaults[vaultOwners[i]];
                underlyingSum = underlyingSum.add(vault.underlying);
            }
        }

        uint256 underlyingBalance = 0;
        if (isETH(underlying)) {
            underlyingBalance = address(this).balance;
        } else {
            underlyingBalance = underlying.balanceOf(address(this));
        }
        return underlyingBalance == underlyingSum;
    }

    function echidna_test_should_fail() public view returns (bool) {
        return collateral.balanceOf(address(this)) == 0;
    }
}

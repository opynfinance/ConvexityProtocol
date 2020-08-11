/**
 * SPDX-License-Identifier: UNLICENSED
 */
pragma solidity 0.5.10;

import "@openzeppelin/contracts/math/SafeMath.sol";


/**
 *
 */
library FixedPointUint256 {
    using SafeMath for uint256;

    uint256 private constant SCALING_FACTOR = 1e18;

    /**
     * @notice return the sum of two unsigned integer
     * @param a unsigned integer
     * @param b unsigned integer
     * @return sum of two unsigned integer
     */
    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        return a.add(b);
    }

    /**
     * @notice return the difference of two unsigned integer
     * @param a unsigned integer
     * @param b unsigned integer
     * @return difference of two unsigned integer
     */
    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        return a.sub(b);
    }

    /**
     * @notice multiply two unsigned integer
     * @dev rounds to zero if a*b < SCALING_FACTOR / 2
     * @param a unsigned integer
     * @param b unsigned integer
     * @return mul of two unsigned integer
     */
    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        return (a.mul(b)).add(SCALING_FACTOR / 2) / SCALING_FACTOR;
    }

    /**
     * @notice divide two unsigned integer
     * @dev rounds to zero if a*b < SCALING_FACTOR / 2
     * @param a unsigned integer
     * @param b unsigned integer
     * @return div of two unsigned integer
     */
    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        return (a.mul(SCALING_FACTOR)).add(b / 2) / b;
    }

    /**
     * @notice the minimum between a and b
     * @param a unsigned integer
     * @param b unsigned integer
     * @return min of two unsigned integer
     */
    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }

    /**
     * @notice the maximum between a and b
     * @param a unsigned integer
     * @param b unsigned integer
     * @return max of two unsigned integer
     */
    function max(uint256 a, uint256 b) internal pure returns (uint256) {
        return a > b ? a : b;
    }

    /**
     * @notice Whether `a` is equal to `b`.
     * @param a a unsigned integer
     * @param b a unsigned integer
     * @return True if equal, or False.
     */
    function isEqual(uint256 a, uint256 b) internal pure returns (bool) {
        return a == b;
    }

    /**
     * @notice Whether `a` is greater than `b`.
     * @param a a unsigned integer
     * @param b a unsigned integer
     * @return True if `a > b`, or False.
     */
    function isGreaterThan(uint256 a, uint256 b) internal pure returns (bool) {
        return a > b;
    }

    /**
     * @notice Whether `a` is greater than or equal to `b`.
     * @param a a unsigned integer
     * @param b a unsigned integer
     * @return True if `a >= b`, or False.
     */
    function isGreaterThanOrEqual(uint256 a, uint256 b)
        internal
        pure
        returns (bool)
    {
        return a >= b;
    }

    /**
     * @notice Whether `a` is less than `b`.
     * @param a a unsigned integer
     * @param b a unsigned integer
     * @return True if `a < b`, or False.
     */
    function isLessThan(uint256 a, uint256 b) internal pure returns (bool) {
        return a < b;
    }

    /**
     * @notice Whether `a` is less than or equal to `b`.
     * @param a a unsigned integer
     * @param b a unsigned integer
     * @return True if `a <= b`, or False.
     */
    function isLessThanOrEqual(uint256 a, uint256 b)
        internal
        pure
        returns (bool)
    {
        return a <= b;
    }
}

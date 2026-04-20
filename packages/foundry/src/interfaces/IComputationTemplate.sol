// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.25;

import {euint32, ebool} from "@fhenixprotocol/cofhe-contracts/FHE.sol";

interface IComputationTemplate {
    /// @notice Initialize accumulators for a new computation
    /// @param fieldCount Number of fields in the schema
    /// @param params ABI-encoded template-specific configuration
    /// @return accumulators Initial accumulator values
    function initializeAccumulators(
        uint256 fieldCount,
        bytes calldata params
    ) external returns (euint32[] memory accumulators);

    /// @notice Process a single submission, updating accumulators
    /// @param accumulators Current accumulator state
    /// @param fieldValues Encrypted field values for this submission
    /// @param isValid Encrypted validation result for this submission
    /// @param params ABI-encoded template-specific configuration
    /// @return updatedAccumulators Updated accumulator state
    function processSubmission(
        euint32[] memory accumulators,
        euint32[] memory fieldValues,
        ebool isValid,
        bytes calldata params
    ) external returns (euint32[] memory updatedAccumulators);

    /// @notice Finalize computation and produce results
    /// @param accumulators Final accumulator state
    /// @param validCount Encrypted count of valid submissions
    /// @param params ABI-encoded template-specific configuration
    /// @return results Encrypted result values
    function finalize(
        euint32[] memory accumulators,
        euint32 validCount,
        bytes calldata params
    ) external returns (euint32[] memory results);

    /// @notice Number of result values this template produces
    /// @param fieldCount Number of data fields
    /// @param params ABI-encoded template-specific configuration
    /// @return count Number of results
    function resultCount(
        uint256 fieldCount,
        bytes calldata params
    ) external pure returns (uint256 count);
}

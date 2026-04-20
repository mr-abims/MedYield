// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.25;

/// @title IConditionResolver
/// @notice Local mirror of the ReineiraOS condition resolver plugin interface.
///         A resolver governs when a ConfidentialEscrow entry may be redeemed.
///         See: https://docs.reineira.xyz guides/build-a-plugin.
interface IConditionResolver {
    /// @notice True if the condition guarding escrow `escrowId` is satisfied.
    function isConditionMet(uint256 escrowId) external view returns (bool);

    /// @notice Invoked atomically inside ConfidentialEscrow.create().
    ///         Resolver should decode `data` and persist its configuration.
    function onConditionSet(uint256 escrowId, bytes calldata data) external;
}

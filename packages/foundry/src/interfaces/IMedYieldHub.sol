// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.25;

import {BountyConfig, FieldDefinition, VaultRecord} from "../libraries/HealthDataSchema.sol";

/// @title IMedYieldHub
/// @notice External surface of the MedYield factory/registry. Implemented
///         by MedYieldHub and consumed by DataVault (via onComputationComplete)
///         and by off-chain integrations.
interface IMedYieldHub {
    /// @notice Emitted when a bounty is created and its DataVault deployed.
    event BountyCreated(uint256 indexed bountyId, address indexed organization, address vault);

    /// @notice Emitted when a bounty's computation has been finalized by the
    ///         vault.
    event BountyCompleted(uint256 indexed bountyId);

    /// @notice Emitted when a bounty is closed after its deadline has passed.
    event BountyExpired(uint256 indexed bountyId);

    /// @notice Emitted when a bounty is closed by its organisation before
    ///         the deadline.
    event BountyCancelled(uint256 indexed bountyId, address indexed by);

    function createBounty(
        BountyConfig calldata config,
        FieldDefinition[] calldata schema
    ) external returns (uint256 bountyId);

    function closeBounty(uint256 bountyId) external;

    function onComputationComplete(uint256 bountyId) external;

    function getVault(uint256 bountyId) external view returns (VaultRecord memory);

    function templateRegistry() external view returns (address);
}

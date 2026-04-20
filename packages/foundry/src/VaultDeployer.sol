// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.25;

import {DataVault} from "./DataVault.sol";
import {BountyConfig, FieldDefinition} from "./libraries/HealthDataSchema.sol";

/// @notice Dedicated helper that holds the DataVault creation bytecode.
///         Extracted so MedYieldHub stays under the 24KB contract-size limit.
/// @dev    Hub is pinned one-time after construction to break the circular
///         dependency between Hub and Deployer (Hub constructor needs the
///         Deployer address; Deployer must only accept calls from Hub).
contract VaultDeployer {
    address public hub;

    error HubAlreadySet();
    error ZeroHub();
    error NotHub();

    event HubSet(address indexed hub);

    /// @notice One-time initializer called by the deployer after MedYieldHub
    ///         is constructed. Reverts on every subsequent call.
    function setHub(address _hub) external {
        if (hub != address(0)) revert HubAlreadySet();
        if (_hub == address(0)) revert ZeroHub();
        hub = _hub;
        emit HubSet(_hub);
    }

    /// @notice Deploy a new DataVault via CREATE2. Only callable by the
    ///         pinned MedYieldHub.
    /// @dev    `hubArg` must match the pinned hub so the caller cannot
    ///         forge a vault whose immutable `hub` points elsewhere. The
    ///         CREATE2 salt commits to (bountyId, organization) so vault
    ///         addresses are predictable off-chain.
    function deployVault(
        uint256 bountyId,
        address organization,
        address relayer,
        address template,
        FieldDefinition[] calldata schema,
        BountyConfig calldata config,
        address hubArg
    ) external returns (address) {
        if (msg.sender != hub) revert NotHub();
        // hubArg must match the pinned hub — prevents the caller from
        // forging a vault whose immutable `hub` points elsewhere.
        if (hubArg != hub) revert NotHub();

        bytes32 salt = keccak256(abi.encode(bountyId, organization));
        DataVault v = new DataVault{salt: salt}(
            bountyId,
            organization,
            relayer,
            template,
            schema,
            config,
            hubArg
        );
        return address(v);
    }
}

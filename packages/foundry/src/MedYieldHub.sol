// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.25;

import {Ownable2Step, Ownable} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {DataVault} from "./DataVault.sol";
import {VaultDeployer} from "./VaultDeployer.sol";
import {TemplateRegistry, TemplateInfo} from "./TemplateRegistry.sol";
import {IMedYieldHub} from "./interfaces/IMedYieldHub.sol";
import {
    BountyConfig,
    FieldDefinition,
    VaultRecord,
    VaultStatus
} from "./libraries/HealthDataSchema.sol";

/// @title MedYieldHub
/// @notice Factory and registry for MedYield bounty vaults. Owns the
///         relayer pointer, the template registry reference, and the
///         bounty-id → vault mapping. Each createBounty call deploys a
///         dedicated DataVault through the VaultDeployer.
/// @dev    Vault lifecycle state is tracked by the DataVault itself;
///         getVault() always reads live status from the vault so that
///         off-chain consumers never observe a stale cached value.
contract MedYieldHub is IMedYieldHub, Ownable2Step {
    TemplateRegistry public templateRegistryContract;
    VaultDeployer public vaultDeployer;
    address public relayer;

    uint256 public bountyCount;
    mapping(uint256 => VaultRecord) internal _vaults;

    /// @notice Emitted when the template registry reference is rotated.
    event TemplateRegistryUpdated(address indexed registry);

    /// @notice Emitted when the relayer used by future vaults is rotated.
    event RelayerUpdated(address indexed relayer);

    /// @notice Emitted alongside BountyCreated with explicit vault and
    ///         organization indexing for easier subgraph queries.
    event VaultDeployed(uint256 indexed bountyId, address indexed vault, address indexed organization);

    constructor(
        address _templateRegistry,
        address _vaultDeployer,
        address _relayer
    ) Ownable(msg.sender) {
        require(_templateRegistry != address(0), "Zero registry");
        require(_vaultDeployer != address(0), "Zero deployer");
        require(_relayer != address(0), "Zero relayer");
        templateRegistryContract = TemplateRegistry(_templateRegistry);
        vaultDeployer = VaultDeployer(_vaultDeployer);
        relayer = _relayer;
    }

    // --- Admin ---

    /// @notice Update the template registry used for future bounties.
    ///         Already-deployed vaults bind to their template at construction
    ///         and are unaffected by this change.
    function setTemplateRegistry(address newRegistry) external onlyOwner {
        require(newRegistry != address(0), "Zero registry");
        templateRegistryContract = TemplateRegistry(newRegistry);
        emit TemplateRegistryUpdated(newRegistry);
    }

    /// @notice Update the relayer address stamped into vaults created from
    ///         now on. Existing vaults keep their immutable relayer.
    function setRelayer(address newRelayer) external onlyOwner {
        require(newRelayer != address(0), "Zero relayer");
        relayer = newRelayer;
        emit RelayerUpdated(newRelayer);
    }

    // --- Bounty lifecycle ---

    /// @inheritdoc IMedYieldHub
    /// @dev Deploys a new DataVault via the VaultDeployer with the caller as
    ///      organisation. Reverts if the resolved template is inactive.
    function createBounty(
        BountyConfig calldata config,
        FieldDefinition[] calldata schema
    ) external override returns (uint256 bountyId) {
        require(schema.length > 0, "Empty schema");
        require(config.deadline > block.timestamp, "Deadline in past");
        require(config.minSubmissions > 0, "Min submissions must be > 0");
        require(config.maxSubmissions >= config.minSubmissions, "Max < Min");

        TemplateInfo memory info = templateRegistryContract.getActiveTemplate(config.templateId);

        bountyId = bountyCount++;

        address vaultAddr = vaultDeployer.deployVault(
            bountyId,
            msg.sender,
            relayer,
            info.implementation,
            schema,
            config,
            address(this)
        );

        _vaults[bountyId] = VaultRecord({
            vault: vaultAddr,
            organization: msg.sender,
            status: VaultStatus.OPEN,
            totalSubmissions: 0,
            validatedSubmissions: 0,
            createdAt: block.timestamp
        });

        emit BountyCreated(bountyId, msg.sender, vaultAddr);
        emit VaultDeployed(bountyId, vaultAddr, msg.sender);
    }

    /// @notice Permanently close a bounty. The organisation may close at any
    ///         time; anyone may close once the deadline has passed.
    /// @dev    Propagates cancellation to the underlying vault via
    ///         DataVault.cancel(). The vault is the source of truth for the
    ///         terminal state; this hub only re-emits a lifecycle event so
    ///         subgraph listeners do not need to subscribe to the vault.
    function closeBounty(uint256 bountyId) external override {
        VaultRecord storage record = _vaults[bountyId];
        require(record.vault != address(0), "Unknown bounty");

        DataVault vault = DataVault(record.vault);
        bool isOrg = msg.sender == record.organization;
        bool afterDeadline = block.timestamp >= vault.deadline();
        require(isOrg || afterDeadline, "Not authorized");

        // vault.cancel() reverts if the vault is already terminal
        // (COMPLETED / CANCELLED). That enforces one-shot semantics.
        vault.cancel();

        if (isOrg && !afterDeadline) {
            emit BountyCancelled(bountyId, msg.sender);
        } else {
            emit BountyExpired(bountyId);
        }
    }

    /// @inheritdoc IMedYieldHub
    /// @dev Invoked by DataVault.finalizeComputation. Only the vault for the
    ///      given bountyId may call. Emits BountyCompleted for listeners.
    function onComputationComplete(uint256 bountyId) external override {
        VaultRecord storage record = _vaults[bountyId];
        require(record.vault != address(0), "Unknown bounty");
        require(msg.sender == record.vault, "Not vault");

        emit BountyCompleted(bountyId);
    }

    // --- Views ---

    /// @notice Live view of a bounty's state. Reads status and submission
    ///         counters directly from the vault so the returned record is
    ///         always in sync with the underlying contract.
    function getVault(uint256 bountyId) external view override returns (VaultRecord memory) {
        VaultRecord memory record = _vaults[bountyId];
        require(record.vault != address(0), "Unknown bounty");

        DataVault vault = DataVault(record.vault);
        record.status = vault.status();
        record.totalSubmissions = vault.submissionCount();
        record.validatedSubmissions = vault.validatedCount();
        return record;
    }

    /// @inheritdoc IMedYieldHub
    function templateRegistry() external view override returns (address) {
        return address(templateRegistryContract);
    }
}

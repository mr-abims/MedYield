// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.25;

import {Test} from "forge-std/Test.sol";
import {CoFheTest} from "@cofhe/mock-contracts/foundry/CoFheTest.sol";
import {MedYieldHub} from "../src/MedYieldHub.sol";
import {IMedYieldHub} from "../src/interfaces/IMedYieldHub.sol";
import {TemplateRegistry} from "../src/TemplateRegistry.sol";
import {VaultDeployer} from "../src/VaultDeployer.sol";
import {AggregateStats} from "../src/templates/AggregateStats.sol";
import {DataVault} from "../src/DataVault.sol";
import {
    BountyConfig,
    FieldDefinition,
    FieldType,
    TemplateType,
    VaultStatus,
    VaultRecord
} from "../src/libraries/HealthDataSchema.sol";

contract MedYieldHubTest is Test, CoFheTest {
    MedYieldHub public hub;
    TemplateRegistry public registry;
    VaultDeployer public deployer;
    AggregateStats public aggTemplate;

    address public admin;
    address public org;
    address public outsider;
    address public relayer;

    uint256 public aggregateStatsTemplateId;

    function setUp() public {
        admin = makeAddr("admin");
        org = makeAddr("org");
        outsider = makeAddr("outsider");
        relayer = makeAddr("relayer");

        aggTemplate = new AggregateStats();
        deployer = new VaultDeployer();

        vm.startPrank(admin);
        registry = new TemplateRegistry();
        aggregateStatsTemplateId = registry.registerTemplate(
            "AggregateStats",
            address(aggTemplate),
            TemplateType.AGGREGATE_STATS
        );
        hub = new MedYieldHub(address(registry), address(deployer), relayer);
        vm.stopPrank();
        deployer.setHub(address(hub));
    }

    // --- Helpers ---

    function _defaultSchema() internal pure returns (FieldDefinition[] memory schema) {
        schema = new FieldDefinition[](2);
        schema[0] = FieldDefinition("age", FieldType.EUINT32, 1, 130);
        schema[1] = FieldDefinition("glucose", FieldType.EUINT32, 30, 500);
    }

    function _defaultConfig(uint256 templateId) internal view returns (BountyConfig memory) {
        uint256[] memory targets = new uint256[](2);
        targets[0] = 0;
        targets[1] = 1;
        return BountyConfig({
            pricePerRecord: 1 ether,
            maxSubmissions: 10,
            minSubmissions: 2,
            deadline: block.timestamp + 30 days,
            templateId: templateId,
            templateParams: abi.encode(targets),
            metadataURI: "ipfs://test"
        });
    }

    // --- Constructor ---

    function test_ConstructorStoresDependencies() public view {
        assertEq(hub.templateRegistry(), address(registry));
        assertEq(hub.relayer(), relayer);
    }

    function test_ConstructorRevertsZeroRegistry() public {
        vm.expectRevert("Zero registry");
        new MedYieldHub(address(0), address(deployer), relayer);
    }

    function test_ConstructorRevertsZeroDeployer() public {
        vm.expectRevert("Zero deployer");
        new MedYieldHub(address(registry), address(0), relayer);
    }

    function test_ConstructorRevertsZeroRelayer() public {
        vm.expectRevert("Zero relayer");
        new MedYieldHub(address(registry), address(deployer), address(0));
    }

    // --- createBounty ---

    function test_CreateBountyDeploysVault() public {
        FieldDefinition[] memory schema = _defaultSchema();
        BountyConfig memory cfg = _defaultConfig(aggregateStatsTemplateId);

        vm.prank(org);
        uint256 bountyId = hub.createBounty(cfg, schema);

        VaultRecord memory record = hub.getVault(bountyId);
        assertEq(record.organization, org);
        assertTrue(record.vault != address(0));
        assertEq(uint8(record.status), uint8(VaultStatus.OPEN));
        assertEq(record.createdAt, block.timestamp);

        DataVault vault = DataVault(record.vault);
        assertEq(vault.organization(), org);
        assertEq(vault.relayer(), relayer);
        assertEq(address(vault.template()), address(aggTemplate));
    }

    function test_CreateBountyIncrementsCount() public {
        FieldDefinition[] memory schema = _defaultSchema();
        BountyConfig memory cfg = _defaultConfig(aggregateStatsTemplateId);

        vm.startPrank(org);
        uint256 id0 = hub.createBounty(cfg, schema);
        uint256 id1 = hub.createBounty(cfg, schema);
        vm.stopPrank();
        assertEq(id0, 0);
        assertEq(id1, 1);
        assertEq(hub.bountyCount(), 2);
    }

    function test_CreateBountyRevertsEmptySchema() public {
        FieldDefinition[] memory empty = new FieldDefinition[](0);
        BountyConfig memory cfg = _defaultConfig(aggregateStatsTemplateId);
        vm.prank(org);
        vm.expectRevert("Empty schema");
        hub.createBounty(cfg, empty);
    }

    function test_CreateBountyRevertsDeadlineInPast() public {
        FieldDefinition[] memory schema = _defaultSchema();
        BountyConfig memory cfg = _defaultConfig(aggregateStatsTemplateId);
        cfg.deadline = block.timestamp;
        vm.prank(org);
        vm.expectRevert("Deadline in past");
        hub.createBounty(cfg, schema);
    }

    function test_CreateBountyRevertsMinZero() public {
        FieldDefinition[] memory schema = _defaultSchema();
        BountyConfig memory cfg = _defaultConfig(aggregateStatsTemplateId);
        cfg.minSubmissions = 0;
        vm.prank(org);
        vm.expectRevert("Min submissions must be > 0");
        hub.createBounty(cfg, schema);
    }

    function test_CreateBountyRevertsMaxLessThanMin() public {
        FieldDefinition[] memory schema = _defaultSchema();
        BountyConfig memory cfg = _defaultConfig(aggregateStatsTemplateId);
        cfg.minSubmissions = 5;
        cfg.maxSubmissions = 2;
        vm.prank(org);
        vm.expectRevert("Max < Min");
        hub.createBounty(cfg, schema);
    }

    function test_CreateBountyRevertsInactiveTemplate() public {
        vm.prank(admin);
        registry.deactivateTemplate(aggregateStatsTemplateId);

        FieldDefinition[] memory schema = _defaultSchema();
        BountyConfig memory cfg = _defaultConfig(aggregateStatsTemplateId);
        vm.prank(org);
        vm.expectRevert("Template inactive");
        hub.createBounty(cfg, schema);
    }

    // --- closeBounty ---

    function test_OrgCanCloseBeforeDeadline() public {
        FieldDefinition[] memory schema = _defaultSchema();
        BountyConfig memory cfg = _defaultConfig(aggregateStatsTemplateId);
        vm.prank(org);
        uint256 id = hub.createBounty(cfg, schema);

        vm.expectEmit(true, true, false, false);
        emit IMedYieldHub.BountyCancelled(id, org);
        vm.prank(org);
        hub.closeBounty(id);

        VaultRecord memory r = hub.getVault(id);
        // closeBounty propagates cancellation to the vault, so its live
        // status transitions to CANCELLED and further submissions revert.
        DataVault vault = DataVault(r.vault);
        assertEq(uint8(vault.status()), uint8(VaultStatus.CANCELLED));
    }

    function test_OutsiderCannotCloseBeforeDeadline() public {
        FieldDefinition[] memory schema = _defaultSchema();
        BountyConfig memory cfg = _defaultConfig(aggregateStatsTemplateId);
        vm.prank(org);
        uint256 id = hub.createBounty(cfg, schema);

        vm.prank(outsider);
        vm.expectRevert("Not authorized");
        hub.closeBounty(id);
    }

    function test_AnyoneCanCloseAfterDeadline() public {
        FieldDefinition[] memory schema = _defaultSchema();
        BountyConfig memory cfg = _defaultConfig(aggregateStatsTemplateId);
        vm.prank(org);
        uint256 id = hub.createBounty(cfg, schema);

        vm.warp(block.timestamp + 31 days);
        vm.expectEmit(true, false, false, false);
        emit IMedYieldHub.BountyExpired(id);
        vm.prank(outsider);
        hub.closeBounty(id);
    }

    function test_CloseUnknownBountyReverts() public {
        vm.expectRevert("Unknown bounty");
        hub.closeBounty(999);
    }

    // --- Admin setters ---

    function test_AdminCanUpdateRelayer() public {
        address newRelayer = makeAddr("newRelayer");
        vm.prank(admin);
        hub.setRelayer(newRelayer);
        assertEq(hub.relayer(), newRelayer);
    }

    function test_AdminCanUpdateRegistry() public {
        TemplateRegistry newRegistry = new TemplateRegistry();
        vm.prank(admin);
        hub.setTemplateRegistry(address(newRegistry));
        assertEq(hub.templateRegistry(), address(newRegistry));
    }

    // --- Vault record view ---

    function test_GetVaultReadsLiveStatus() public {
        FieldDefinition[] memory schema = _defaultSchema();
        BountyConfig memory cfg = _defaultConfig(aggregateStatsTemplateId);
        vm.prank(org);
        uint256 id = hub.createBounty(cfg, schema);

        VaultRecord memory r = hub.getVault(id);
        assertEq(uint8(r.status), uint8(VaultStatus.OPEN));
        assertEq(r.totalSubmissions, 0);
        assertEq(r.validatedSubmissions, 0);
    }
}

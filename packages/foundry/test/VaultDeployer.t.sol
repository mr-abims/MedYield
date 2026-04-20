// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.25;

import {Test} from "forge-std/Test.sol";
import {VaultDeployer} from "../src/VaultDeployer.sol";
import {BountyConfig, FieldDefinition, FieldType} from "../src/libraries/HealthDataSchema.sol";

contract VaultDeployerTest is Test {
    VaultDeployer public deployer;

    address public hub;
    address public outsider;

    function setUp() public {
        deployer = new VaultDeployer();
        hub = makeAddr("hub");
        outsider = makeAddr("outsider");
    }

    // --- setHub ---

    function test_SetHubPinsAddress() public {
        deployer.setHub(hub);
        assertEq(deployer.hub(), hub);
    }

    function test_SetHubRejectsZero() public {
        vm.expectRevert(VaultDeployer.ZeroHub.selector);
        deployer.setHub(address(0));
    }

    function test_SetHubRevertsOnSecondCall() public {
        deployer.setHub(hub);
        vm.expectRevert(VaultDeployer.HubAlreadySet.selector);
        deployer.setHub(makeAddr("other-hub"));
    }

    // --- deployVault access control ---

    function test_DeployVaultRevertsFromNonHub() public {
        deployer.setHub(hub);

        FieldDefinition[] memory schema = new FieldDefinition[](1);
        schema[0] = FieldDefinition("age", FieldType.EUINT32, 1, 130);
        BountyConfig memory cfg = BountyConfig({
            pricePerRecord: 1 ether,
            maxSubmissions: 10,
            minSubmissions: 1,
            deadline: block.timestamp + 1 days,
            templateId: 0,
            templateParams: "",
            metadataURI: ""
        });

        vm.prank(outsider);
        vm.expectRevert(VaultDeployer.NotHub.selector);
        deployer.deployVault(
            0,
            makeAddr("org"),
            makeAddr("relayer"),
            makeAddr("template"),
            schema,
            cfg,
            hub
        );
    }

    function test_DeployVaultRevertsOnHubArgMismatch() public {
        deployer.setHub(hub);

        FieldDefinition[] memory schema = new FieldDefinition[](1);
        schema[0] = FieldDefinition("age", FieldType.EUINT32, 1, 130);
        BountyConfig memory cfg = BountyConfig({
            pricePerRecord: 1 ether,
            maxSubmissions: 10,
            minSubmissions: 1,
            deadline: block.timestamp + 1 days,
            templateId: 0,
            templateParams: "",
            metadataURI: ""
        });

        vm.prank(hub);
        vm.expectRevert(VaultDeployer.NotHub.selector);
        deployer.deployVault(
            0,
            makeAddr("org"),
            makeAddr("relayer"),
            makeAddr("template"),
            schema,
            cfg,
            makeAddr("forged-hub")
        );
    }
}

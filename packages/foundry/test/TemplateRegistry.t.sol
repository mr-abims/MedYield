// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.25;

import {Test} from "forge-std/Test.sol";
import {TemplateRegistry, TemplateInfo} from "../src/TemplateRegistry.sol";
import {TemplateType} from "../src/libraries/HealthDataSchema.sol";

contract TemplateRegistryTest is Test {
    TemplateRegistry public registry;
    address public admin;
    address public nonAdmin;
    address public templateImpl;

    function setUp() public {
        admin = makeAddr("admin");
        nonAdmin = makeAddr("nonAdmin");
        templateImpl = makeAddr("templateImpl");

        vm.prank(admin);
        registry = new TemplateRegistry();
    }

    function test_RegisterTemplate() public {
        vm.prank(admin);
        uint256 id = registry.registerTemplate("AggregateStats", templateImpl, TemplateType.AGGREGATE_STATS);
        assertEq(id, 0);
        assertEq(registry.templateCount(), 1);

        TemplateInfo memory info = registry.getTemplate(0);
        assertEq(info.name, "AggregateStats");
        assertEq(info.implementation, templateImpl);
        assertTrue(info.active);
    }

    function test_RegisterMultipleTemplates() public {
        vm.startPrank(admin);
        uint256 id0 = registry.registerTemplate("AggregateStats", templateImpl, TemplateType.AGGREGATE_STATS);
        uint256 id1 = registry.registerTemplate("EligibilityScreening", makeAddr("impl2"), TemplateType.ELIGIBILITY_SCREENING);
        vm.stopPrank();

        assertEq(id0, 0);
        assertEq(id1, 1);
        assertEq(registry.templateCount(), 2);
    }

    function test_NonAdminCannotRegister() public {
        vm.prank(nonAdmin);
        vm.expectRevert();
        registry.registerTemplate("Foo", templateImpl, TemplateType.AGGREGATE_STATS);
    }

    function test_CannotRegisterZeroAddress() public {
        vm.prank(admin);
        vm.expectRevert("Zero address");
        registry.registerTemplate("Foo", address(0), TemplateType.AGGREGATE_STATS);
    }

    function test_CannotRegisterEmptyName() public {
        vm.prank(admin);
        vm.expectRevert("Empty name");
        registry.registerTemplate("", templateImpl, TemplateType.AGGREGATE_STATS);
    }

    function test_DeactivateTemplate() public {
        vm.startPrank(admin);
        registry.registerTemplate("AggregateStats", templateImpl, TemplateType.AGGREGATE_STATS);
        registry.deactivateTemplate(0);
        vm.stopPrank();

        assertFalse(registry.isActiveTemplate(0));
    }

    function test_CannotDeactivateAlreadyInactive() public {
        vm.startPrank(admin);
        registry.registerTemplate("AggregateStats", templateImpl, TemplateType.AGGREGATE_STATS);
        registry.deactivateTemplate(0);
        vm.expectRevert("Already inactive");
        registry.deactivateTemplate(0);
        vm.stopPrank();
    }

    function test_ActivateTemplate() public {
        vm.startPrank(admin);
        registry.registerTemplate("AggregateStats", templateImpl, TemplateType.AGGREGATE_STATS);
        registry.deactivateTemplate(0);
        registry.activateTemplate(0);
        vm.stopPrank();

        assertTrue(registry.isActiveTemplate(0));
    }

    function test_GetActiveTemplate_RevertsIfInactive() public {
        vm.startPrank(admin);
        registry.registerTemplate("AggregateStats", templateImpl, TemplateType.AGGREGATE_STATS);
        registry.deactivateTemplate(0);
        vm.stopPrank();

        vm.expectRevert("Template inactive");
        registry.getActiveTemplate(0);
    }

    function test_GetTemplate_RevertsIfNotExists() public {
        vm.expectRevert("Template does not exist");
        registry.getTemplate(999);
    }

    function test_IsActiveTemplate_FalseForNonexistent() public view {
        assertFalse(registry.isActiveTemplate(999));
    }
}

// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.25;

import {Test} from "forge-std/Test.sol";
import {MedYieldConditionResolver} from "../src/MedYieldConditionResolver.sol";
import {IConditionResolver} from "../src/interfaces/IConditionResolver.sol";
import {StubValidatedVault} from "./mocks/StubValidatedVault.sol";

contract MedYieldConditionResolverTest is Test {
    MedYieldConditionResolver public resolver;
    StubValidatedVault public vault;

    address public escrow;
    address public notEscrow;

    event BindingSet(uint256 indexed escrowId, address indexed vault, uint256 submissionId);

    function setUp() public {
        escrow = makeAddr("confidential-escrow");
        notEscrow = makeAddr("rando");
        resolver = new MedYieldConditionResolver(escrow);
        vault = new StubValidatedVault();
    }

    function _bind(uint256 escrowId, address vaultAddr, uint256 submissionId) internal {
        bytes memory data = abi.encode(vaultAddr, submissionId);
        vm.prank(escrow);
        resolver.onConditionSet(escrowId, data);
    }

    // --- constructor ---

    function test_ConstructorRejectsZero() public {
        vm.expectRevert("Zero escrow");
        new MedYieldConditionResolver(address(0));
    }

    function test_EscrowImmutable() public view {
        assertEq(resolver.escrow(), escrow);
    }

    // --- onConditionSet ---

    function test_OnConditionSet_StoresBinding() public {
        vm.expectEmit(true, true, false, true);
        emit BindingSet(42, address(vault), 7);
        _bind(42, address(vault), 7);

        (address v, uint256 sid, bool set) = resolver.binding(42);
        assertEq(v, address(vault));
        assertEq(sid, 7);
        assertTrue(set);
    }

    function test_OnConditionSet_RevertsIfNotEscrow() public {
        bytes memory data = abi.encode(address(vault), uint256(0));
        vm.prank(notEscrow);
        vm.expectRevert(MedYieldConditionResolver.NotEscrow.selector);
        resolver.onConditionSet(1, data);
    }

    function test_OnConditionSet_RevertsOnZeroVault() public {
        bytes memory data = abi.encode(address(0), uint256(0));
        vm.prank(escrow);
        vm.expectRevert(MedYieldConditionResolver.ZeroVault.selector);
        resolver.onConditionSet(1, data);
    }

    function test_OnConditionSet_RevertsOnDoubleBind() public {
        _bind(1, address(vault), 0);
        bytes memory data = abi.encode(address(vault), uint256(1));
        vm.prank(escrow);
        vm.expectRevert(MedYieldConditionResolver.AlreadyBound.selector);
        resolver.onConditionSet(1, data);
    }

    // --- isConditionMet ---

    function test_IsConditionMet_FalseWhenUnbound() public view {
        assertFalse(resolver.isConditionMet(999));
    }

    function test_IsConditionMet_FalseWhenPending() public {
        _bind(1, address(vault), 0);
        // vault has not marked submission 0 validated
        assertFalse(resolver.isConditionMet(1));
    }

    function test_IsConditionMet_TrueWhenValidated() public {
        _bind(1, address(vault), 0);
        vault.setValidated(0, true);
        assertTrue(resolver.isConditionMet(1));
    }

    function test_IsConditionMet_FalseAfterRevalidationToggleOff() public {
        _bind(1, address(vault), 0);
        vault.setValidated(0, true);
        assertTrue(resolver.isConditionMet(1));
        vault.setValidated(0, false);
        assertFalse(resolver.isConditionMet(1));
    }

    function test_IsConditionMet_BindingsAreIndependent() public {
        _bind(1, address(vault), 0);
        _bind(2, address(vault), 1);
        vault.setValidated(0, true);
        assertTrue(resolver.isConditionMet(1));
        assertFalse(resolver.isConditionMet(2));
    }

    // --- ERC-165 ---

    function test_SupportsInterface_ConditionResolver() public view {
        assertTrue(resolver.supportsInterface(type(IConditionResolver).interfaceId));
    }

    function test_SupportsInterface_ERC165() public view {
        // ERC-165 interface id
        assertTrue(resolver.supportsInterface(0x01ffc9a7));
    }

    function test_SupportsInterface_Unknown() public view {
        assertFalse(resolver.supportsInterface(0xdeadbeef));
    }
}

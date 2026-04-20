// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.25;

import {Test} from "forge-std/Test.sol";
import {CoFheTest} from "@cofhe/mock-contracts/foundry/CoFheTest.sol";
import {FHE, euint32, ebool} from "@fhenixprotocol/cofhe-contracts/FHE.sol";
import {EligibilityScreening} from "../../src/templates/EligibilityScreening.sol";

contract EligibilityScreeningTest is Test, CoFheTest {
    EligibilityScreening public template;

    function setUp() public {
        template = new EligibilityScreening();
    }

    // --- helpers ---

    function _enc(uint32 v) internal returns (euint32) {
        euint32 e = FHE.asEuint32(uint256(v));
        FHE.allowThis(e);
        FHE.allow(e, address(template));
        return e;
    }

    function _validBool() internal returns (ebool) {
        ebool b = FHE.asEbool(true);
        FHE.allowThis(b);
        FHE.allow(b, address(template));
        return b;
    }

    function _invalidBool() internal returns (ebool) {
        ebool b = FHE.asEbool(false);
        FHE.allowThis(b);
        FHE.allow(b, address(template));
        return b;
    }

    function _fields3(uint32 a, uint32 b, uint32 c) internal returns (euint32[] memory out) {
        out = new euint32[](3);
        out[0] = _enc(a);
        out[1] = _enc(b);
        out[2] = _enc(c);
    }

    function _singleCriterion(uint256 fieldIdx, uint8 op, uint32 threshold) internal pure returns (bytes memory) {
        EligibilityScreening.Criterion[] memory cs = new EligibilityScreening.Criterion[](1);
        cs[0] = EligibilityScreening.Criterion(fieldIdx, op, threshold);
        return abi.encode(cs);
    }

    function _twoCriteria(
        uint256 i1, uint8 op1, uint32 t1,
        uint256 i2, uint8 op2, uint32 t2
    ) internal pure returns (bytes memory) {
        EligibilityScreening.Criterion[] memory cs = new EligibilityScreening.Criterion[](2);
        cs[0] = EligibilityScreening.Criterion(i1, op1, t1);
        cs[1] = EligibilityScreening.Criterion(i2, op2, t2);
        return abi.encode(cs);
    }

    // --- Initialization ---

    function test_InitializeAccumulators() public {
        bytes memory params = _singleCriterion(0, 0, 50);
        euint32[] memory acc = template.initializeAccumulators(3, params);

        assertEq(acc.length, 2);
        assertHashValue(acc[0], uint32(0));
        assertHashValue(acc[1], uint32(0));
    }

    function test_RevertsOnNoCriteria() public {
        EligibilityScreening.Criterion[] memory empty = new EligibilityScreening.Criterion[](0);
        bytes memory params = abi.encode(empty);
        vm.expectRevert("No criteria");
        template.initializeAccumulators(3, params);
    }

    function test_RevertsOnFieldOutOfBounds() public {
        bytes memory params = _singleCriterion(99, 0, 50);
        vm.expectRevert("Field out of bounds");
        template.initializeAccumulators(3, params);
    }

    function test_RevertsOnUnknownOperator() public {
        bytes memory params = _singleCriterion(0, 7, 50);
        vm.expectRevert("Unknown operator");
        template.initializeAccumulators(3, params);
    }

    // --- Single criterion ---

    function test_GteCriterion_Match() public {
        // age >= 18; submission age = 25
        bytes memory params = _singleCriterion(0, 0, 18);
        euint32[] memory acc = template.initializeAccumulators(3, params);
        euint32[] memory values = _fields3(25, 0, 0);

        acc = template.processSubmission(acc, values, _validBool(), params);
        assertHashValue(acc[0], uint32(1));
        assertHashValue(acc[1], uint32(1));
    }

    function test_GteCriterion_Miss() public {
        bytes memory params = _singleCriterion(0, 0, 18);
        euint32[] memory acc = template.initializeAccumulators(3, params);
        euint32[] memory values = _fields3(15, 0, 0);

        acc = template.processSubmission(acc, values, _validBool(), params);
        assertHashValue(acc[0], uint32(0));
        assertHashValue(acc[1], uint32(1));
    }

    function test_LteCriterion_Match() public {
        bytes memory params = _singleCriterion(0, 1, 65);
        euint32[] memory acc = template.initializeAccumulators(3, params);
        euint32[] memory values = _fields3(40, 0, 0);

        acc = template.processSubmission(acc, values, _validBool(), params);
        assertHashValue(acc[0], uint32(1));
    }

    function test_EqCriterion_Match() public {
        bytes memory params = _singleCriterion(0, 2, 42);
        euint32[] memory acc = template.initializeAccumulators(3, params);
        euint32[] memory values = _fields3(42, 0, 0);

        acc = template.processSubmission(acc, values, _validBool(), params);
        assertHashValue(acc[0], uint32(1));
    }

    function test_EqCriterion_Miss() public {
        bytes memory params = _singleCriterion(0, 2, 42);
        euint32[] memory acc = template.initializeAccumulators(3, params);
        euint32[] memory values = _fields3(41, 0, 0);

        acc = template.processSubmission(acc, values, _validBool(), params);
        assertHashValue(acc[0], uint32(0));
    }

    // --- Multi-criteria ---

    function test_AllEligible_MultiCriteria() public {
        // age >= 18 AND glucose <= 100
        bytes memory params = _twoCriteria(0, 0, 18, 1, 1, 100);
        euint32[] memory acc = template.initializeAccumulators(3, params);

        acc = template.processSubmission(acc, _fields3(30, 95, 0), _validBool(), params);
        acc = template.processSubmission(acc, _fields3(45, 80, 0), _validBool(), params);
        assertHashValue(acc[0], uint32(2));
        assertHashValue(acc[1], uint32(2));
    }

    function test_NoneEligible() public {
        // age >= 18 AND glucose <= 100; all subs fail one leg
        bytes memory params = _twoCriteria(0, 0, 18, 1, 1, 100);
        euint32[] memory acc = template.initializeAccumulators(3, params);

        acc = template.processSubmission(acc, _fields3(15, 95, 0), _validBool(), params);
        acc = template.processSubmission(acc, _fields3(30, 150, 0), _validBool(), params);
        assertHashValue(acc[0], uint32(0));
        assertHashValue(acc[1], uint32(2));
    }

    function test_MixedEligibility() public {
        bytes memory params = _twoCriteria(0, 0, 18, 1, 1, 100);
        euint32[] memory acc = template.initializeAccumulators(3, params);

        acc = template.processSubmission(acc, _fields3(30, 95, 0), _validBool(), params);   // eligible
        acc = template.processSubmission(acc, _fields3(15, 95, 0), _validBool(), params);   // age miss
        acc = template.processSubmission(acc, _fields3(30, 150, 0), _validBool(), params);  // glucose miss
        acc = template.processSubmission(acc, _fields3(40, 80, 0), _validBool(), params);   // eligible
        assertHashValue(acc[0], uint32(2));
        assertHashValue(acc[1], uint32(4));
    }

    function test_InvalidSubmission_NotCounted() public {
        bytes memory params = _singleCriterion(0, 0, 18);
        euint32[] memory acc = template.initializeAccumulators(3, params);

        acc = template.processSubmission(acc, _fields3(30, 0, 0), _invalidBool(), params);
        assertHashValue(acc[0], uint32(0));
        assertHashValue(acc[1], uint32(0));
    }

    // --- Finalize ---

    function test_Finalize_ReturnsCounts() public {
        bytes memory params = _singleCriterion(0, 0, 18);
        euint32[] memory acc = template.initializeAccumulators(3, params);
        acc = template.processSubmission(acc, _fields3(30, 0, 0), _validBool(), params);
        acc = template.processSubmission(acc, _fields3(40, 0, 0), _validBool(), params);

        euint32 vc = acc[1];
        euint32[] memory results = template.finalize(acc, vc, params);
        assertEq(results.length, 2);
        assertHashValue(results[0], uint32(2));
        assertHashValue(results[1], uint32(2));
    }

    function test_ResultCount() public view {
        bytes memory params = _singleCriterion(0, 0, 18);
        assertEq(template.resultCount(3, params), 2);
    }
}

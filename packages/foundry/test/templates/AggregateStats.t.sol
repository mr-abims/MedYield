// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.25;

import {Test} from "forge-std/Test.sol";
import {CoFheTest} from "@cofhe/mock-contracts/foundry/CoFheTest.sol";
import {FHE, euint32, ebool} from "@fhenixprotocol/cofhe-contracts/FHE.sol";
import {AggregateStats} from "../../src/templates/AggregateStats.sol";

contract AggregateStatsTest is Test, CoFheTest {
    AggregateStats public template;

    bytes public singleFieldParams;
    bytes public multiFieldParams;

    function setUp() public {
        template = new AggregateStats();

        uint256[] memory singleTarget = new uint256[](1);
        singleTarget[0] = 0;
        singleFieldParams = abi.encode(singleTarget);

        uint256[] memory multiTarget = new uint256[](2);
        multiTarget[0] = 0;
        multiTarget[1] = 1;
        multiFieldParams = abi.encode(multiTarget);
    }

    // --- Helpers ---

    function _enc(uint32 val) internal returns (euint32) {
        euint32 v = FHE.asEuint32(uint256(val));
        FHE.allowThis(v);
        FHE.allow(v, address(template));
        return v;
    }

    function _makeFieldValues(uint32 val0) internal returns (euint32[] memory) {
        euint32[] memory values = new euint32[](1);
        values[0] = _enc(val0);
        return values;
    }

    function _makeFieldValues2(uint32 val0, uint32 val1) internal returns (euint32[] memory) {
        euint32[] memory values = new euint32[](2);
        values[0] = _enc(val0);
        values[1] = _enc(val1);
        return values;
    }

    function _validBool() internal returns (ebool) {
        ebool v = FHE.asEbool(true);
        FHE.allowThis(v);
        FHE.allow(v, address(template));
        return v;
    }

    function _invalidBool() internal returns (ebool) {
        ebool v = FHE.asEbool(false);
        FHE.allowThis(v);
        FHE.allow(v, address(template));
        return v;
    }

    // --- Initialization ---

    function test_InitializeAccumulators_SingleField() public {
        euint32[] memory acc = template.initializeAccumulators(1, singleFieldParams);

        assertEq(acc.length, 4);
        assertHashValue(acc[0], uint32(0));
        assertHashValue(acc[1], type(uint32).max);
        assertHashValue(acc[2], uint32(0));
        assertHashValue(acc[3], uint32(0));
    }

    function test_InitializeAccumulators_MultiField() public {
        euint32[] memory acc = template.initializeAccumulators(2, multiFieldParams);
        assertEq(acc.length, 7);
    }

    function test_InitializeRevertsNoTargetFields() public {
        uint256[] memory empty = new uint256[](0);
        bytes memory emptyParams = abi.encode(empty);
        vm.expectRevert("No target fields");
        template.initializeAccumulators(1, emptyParams);
    }

    function test_InitializeRevertsOutOfBounds() public {
        uint256[] memory oob = new uint256[](1);
        oob[0] = 5;
        bytes memory oobParams = abi.encode(oob);
        vm.expectRevert("Target field out of bounds");
        template.initializeAccumulators(2, oobParams);
    }

    // --- Single submission ---

    function test_SingleValidSubmission() public {
        euint32[] memory acc = template.initializeAccumulators(1, singleFieldParams);
        euint32[] memory values = _makeFieldValues(100);
        ebool valid = _validBool();

        acc = template.processSubmission(acc, values, valid, singleFieldParams);

        assertHashValue(acc[0], uint32(100));
        assertHashValue(acc[1], uint32(100));
        assertHashValue(acc[2], uint32(100));
        assertHashValue(acc[3], uint32(1));
    }

    function test_SingleInvalidSubmission_Excluded() public {
        euint32[] memory acc = template.initializeAccumulators(1, singleFieldParams);
        euint32[] memory values = _makeFieldValues(100);
        ebool invalid = _invalidBool();

        acc = template.processSubmission(acc, values, invalid, singleFieldParams);

        assertHashValue(acc[0], uint32(0));
        assertHashValue(acc[1], type(uint32).max);
        assertHashValue(acc[2], uint32(0));
        assertHashValue(acc[3], uint32(0));
    }

    // --- Multiple submissions ---

    function test_MultipleValidSubmissions() public {
        euint32[] memory acc = template.initializeAccumulators(1, singleFieldParams);

        acc = template.processSubmission(acc, _makeFieldValues(50), _validBool(), singleFieldParams);
        acc = template.processSubmission(acc, _makeFieldValues(100), _validBool(), singleFieldParams);
        acc = template.processSubmission(acc, _makeFieldValues(25), _validBool(), singleFieldParams);

        assertHashValue(acc[0], uint32(175));
        assertHashValue(acc[1], uint32(25));
        assertHashValue(acc[2], uint32(100));
        assertHashValue(acc[3], uint32(3));
    }

    function test_MixedValidInvalid() public {
        euint32[] memory acc = template.initializeAccumulators(1, singleFieldParams);

        acc = template.processSubmission(acc, _makeFieldValues(50), _validBool(), singleFieldParams);
        acc = template.processSubmission(acc, _makeFieldValues(9999), _invalidBool(), singleFieldParams);
        acc = template.processSubmission(acc, _makeFieldValues(100), _validBool(), singleFieldParams);

        assertHashValue(acc[0], uint32(150));
        assertHashValue(acc[1], uint32(50));
        assertHashValue(acc[2], uint32(100));
        assertHashValue(acc[3], uint32(2));
    }

    // --- Finalization ---

    function test_Finalize_MeanCalculation() public {
        euint32[] memory acc = template.initializeAccumulators(1, singleFieldParams);

        acc = template.processSubmission(acc, _makeFieldValues(60), _validBool(), singleFieldParams);
        acc = template.processSubmission(acc, _makeFieldValues(40), _validBool(), singleFieldParams);
        acc = template.processSubmission(acc, _makeFieldValues(80), _validBool(), singleFieldParams);

        euint32 validCount = acc[acc.length - 1];
        euint32[] memory results = template.finalize(acc, validCount, singleFieldParams);

        assertEq(results.length, 5);
        assertHashValue(results[0], uint32(180));
        assertHashValue(results[1], uint32(40));
        assertHashValue(results[2], uint32(80));
        assertHashValue(results[3], uint32(60)); // mean = 180/3
        assertHashValue(results[4], uint32(3));
    }

    // --- Multi-field ---

    function test_MultiField_Aggregation() public {
        euint32[] memory acc = template.initializeAccumulators(2, multiFieldParams);

        acc = template.processSubmission(acc, _makeFieldValues2(100, 200), _validBool(), multiFieldParams);
        acc = template.processSubmission(acc, _makeFieldValues2(50, 300), _validBool(), multiFieldParams);

        // Field 0: sum=150, min=50, max=100
        assertHashValue(acc[0], uint32(150));
        assertHashValue(acc[1], uint32(50));
        assertHashValue(acc[2], uint32(100));
        // Field 1: sum=500, min=200, max=300
        assertHashValue(acc[3], uint32(500));
        assertHashValue(acc[4], uint32(200));
        assertHashValue(acc[5], uint32(300));
        // Count = 2
        assertHashValue(acc[6], uint32(2));
    }

    // --- resultCount ---

    function test_ResultCount() public view {
        assertEq(template.resultCount(1, singleFieldParams), 5);
        assertEq(template.resultCount(2, multiFieldParams), 9);
    }
}

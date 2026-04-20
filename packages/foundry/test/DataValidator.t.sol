// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.25;

import {Test} from "forge-std/Test.sol";
import {CoFheTest} from "@cofhe/mock-contracts/foundry/CoFheTest.sol";
import {FHE, euint32, ebool} from "@fhenixprotocol/cofhe-contracts/FHE.sol";
import {DataValidatorHarness} from "./helpers/DataValidatorHarness.sol";

contract DataValidatorTest is Test, CoFheTest {
    DataValidatorHarness public harness;

    function setUp() public {
        harness = new DataValidatorHarness();
    }

    // --- Single field validation ---

    function test_ValidFieldPassesRangeCheck() public {
        // Age = 45, valid range [1, 130]
        ebool result = harness.validateFieldFromPlaintext(45, 1, 130);
        assertHashValue(result, true);
    }

    function test_InvalidFieldFailsRangeCheck_TooHigh() public {
        // Age = 200, valid range [1, 130]
        ebool result = harness.validateFieldFromPlaintext(200, 1, 130);
        assertHashValue(result, false);
    }

    function test_InvalidFieldFailsRangeCheck_TooLow() public {
        // Age = 0, valid range [1, 130]
        ebool result = harness.validateFieldFromPlaintext(0, 1, 130);
        assertHashValue(result, false);
    }

    function test_BoundaryValueMin() public {
        ebool result = harness.validateFieldFromPlaintext(1, 1, 130);
        assertHashValue(result, true);
    }

    function test_BoundaryValueMax() public {
        ebool result = harness.validateFieldFromPlaintext(130, 1, 130);
        assertHashValue(result, true);
    }

    function test_SingleValueRange() public {
        // min == max == value
        ebool result = harness.validateFieldFromPlaintext(50, 50, 50);
        assertHashValue(result, true);
    }

    function test_SingleValueRange_Fail() public {
        ebool result = harness.validateFieldFromPlaintext(51, 50, 50);
        assertHashValue(result, false);
    }

    // --- Multi-field validation ---

    function test_AllFieldsValid() public {
        // age=45 [1,130], bp_sys=120 [60,300], glucose=95 [30,500]
        uint32[] memory values = new uint32[](3);
        values[0] = 45;
        values[1] = 120;
        values[2] = 95;

        uint32[] memory mins = new uint32[](3);
        mins[0] = 1;
        mins[1] = 60;
        mins[2] = 30;

        uint32[] memory maxs = new uint32[](3);
        maxs[0] = 130;
        maxs[1] = 300;
        maxs[2] = 500;

        ebool result = harness.validateAllFieldsFromPlaintext(values, mins, maxs);
        assertHashValue(result, true);
    }

    function test_OneInvalidFieldFailsAll() public {
        // age=45 OK, bp_sys=400 FAIL, glucose=95 OK
        uint32[] memory values = new uint32[](3);
        values[0] = 45;
        values[1] = 400; // out of range
        values[2] = 95;

        uint32[] memory mins = new uint32[](3);
        mins[0] = 1;
        mins[1] = 60;
        mins[2] = 30;

        uint32[] memory maxs = new uint32[](3);
        maxs[0] = 130;
        maxs[1] = 300;
        maxs[2] = 500;

        ebool result = harness.validateAllFieldsFromPlaintext(values, mins, maxs);
        assertHashValue(result, false);
    }

    function test_AllFieldsInvalid() public {
        uint32[] memory values = new uint32[](2);
        values[0] = 0;   // below [1,130]
        values[1] = 999; // above [60,300]

        uint32[] memory mins = new uint32[](2);
        mins[0] = 1;
        mins[1] = 60;

        uint32[] memory maxs = new uint32[](2);
        maxs[0] = 130;
        maxs[1] = 300;

        ebool result = harness.validateAllFieldsFromPlaintext(values, mins, maxs);
        assertHashValue(result, false);
    }

    // --- Edge cases ---

    function test_EmptyFieldsAreTriviallyValid() public {
        // Schemas with zero numeric fields (all booleans) must return
        // ebool(true) so the submission's validity AND-chain is unaffected.
        uint32[] memory values = new uint32[](0);
        uint32[] memory mins = new uint32[](0);
        uint32[] memory maxs = new uint32[](0);

        ebool result = harness.validateAllFieldsFromPlaintext(values, mins, maxs);
        assertHashValue(result, true);
    }

    function test_RevertsOnLengthMismatch() public {
        uint32[] memory values = new uint32[](2);
        uint32[] memory mins = new uint32[](1);
        uint32[] memory maxs = new uint32[](2);

        vm.expectRevert("Length mismatch");
        harness.validateAllFieldsFromPlaintext(values, mins, maxs);
    }

    // --- Fuzz test ---

    function testFuzz_RangeValidation(uint32 value, uint32 minVal, uint32 maxVal) public {
        vm.assume(minVal <= maxVal);

        ebool result = harness.validateFieldFromPlaintext(value, minVal, maxVal);
        bool expected = value >= minVal && value <= maxVal;
        assertHashValue(result, expected);
    }
}

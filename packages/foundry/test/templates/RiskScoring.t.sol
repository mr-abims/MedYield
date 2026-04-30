// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.25;

import {CofheTest} from "@cofhe/foundry-plugin/CofheTest.sol";
import {FHE, euint32, ebool} from "@fhenixprotocol/cofhe-contracts/FHE.sol";
import {RiskScoring} from "../../src/templates/RiskScoring.sol";

contract RiskScoringTest is CofheTest {
    RiskScoring public template;

    function setUp() public {
        deployMocks();
        template = new RiskScoring();
    }

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

    function _fields(uint32 a, uint32 b) internal returns (euint32[] memory out) {
        out = new euint32[](2);
        out[0] = _enc(a);
        out[1] = _enc(b);
    }

    function _params(
        uint256 i1, uint32 w1,
        uint256 i2, uint32 w2,
        uint32 divisor
    ) internal pure returns (bytes memory) {
        RiskScoring.Weight[] memory ws = new RiskScoring.Weight[](2);
        ws[0] = RiskScoring.Weight(i1, w1);
        ws[1] = RiskScoring.Weight(i2, w2);
        return abi.encode(ws, divisor);
    }

    // --- Initialization ---

    function test_InitializeAccumulators() public {
        bytes memory params = _params(0, 1, 1, 1, 1);
        euint32[] memory acc = template.initializeAccumulators(2, params);
        assertEq(acc.length, 1);
        expectPlaintext(acc[0], uint32(0));
    }

    function test_RevertsNoWeights() public {
        RiskScoring.Weight[] memory empty = new RiskScoring.Weight[](0);
        bytes memory params = abi.encode(empty, uint32(1));
        vm.expectRevert("No weights");
        template.initializeAccumulators(2, params);
    }

    function test_RevertsZeroDivisor() public {
        bytes memory params = _params(0, 1, 1, 1, 0);
        vm.expectRevert("Zero divisor");
        template.initializeAccumulators(2, params);
    }

    function test_RevertsFieldOutOfBounds() public {
        bytes memory params = _params(0, 1, 99, 1, 1);
        vm.expectRevert("Field out of bounds");
        template.initializeAccumulators(2, params);
    }

    // --- Processing ---

    function test_EqualWeights_SingleSubmission() public {
        // weights = [1, 1], divisor = 1
        bytes memory params = _params(0, 1, 1, 1, 1);
        euint32[] memory acc = template.initializeAccumulators(2, params);
        acc = template.processSubmission(acc, _fields(10, 20), _validBool(), params);
        // weighted sum = 10*1 + 20*1 = 30
        expectPlaintext(acc[0], uint32(30));
    }

    function test_UnequalWeights() public {
        // weights = [2, 3], divisor = 1; values = [10, 20]
        bytes memory params = _params(0, 2, 1, 3, 1);
        euint32[] memory acc = template.initializeAccumulators(2, params);
        acc = template.processSubmission(acc, _fields(10, 20), _validBool(), params);
        // weighted sum = 10*2 + 20*3 = 80
        expectPlaintext(acc[0], uint32(80));
    }

    function test_InvalidSubmission_Excluded() public {
        bytes memory params = _params(0, 1, 1, 1, 1);
        euint32[] memory acc = template.initializeAccumulators(2, params);
        acc = template.processSubmission(acc, _fields(10, 20), _invalidBool(), params);
        expectPlaintext(acc[0], uint32(0));
    }

    function test_MultipleValidSubmissions_Accumulate() public {
        bytes memory params = _params(0, 1, 1, 2, 1);
        euint32[] memory acc = template.initializeAccumulators(2, params);
        acc = template.processSubmission(acc, _fields(5, 10), _validBool(), params);  // 5+20 = 25
        acc = template.processSubmission(acc, _fields(3, 4), _validBool(), params);   // 3+8 = 11
        expectPlaintext(acc[0], uint32(36));
    }

    // --- Finalize ---

    function test_Finalize_AverageRisk() public {
        // weights = [1, 1], divisor = 1; two submissions summing to 40
        bytes memory params = _params(0, 1, 1, 1, 1);
        euint32[] memory acc = template.initializeAccumulators(2, params);
        acc = template.processSubmission(acc, _fields(10, 10), _validBool(), params); // 20
        acc = template.processSubmission(acc, _fields(5, 15), _validBool(), params);  // 20

        euint32 vc = FHE.asEuint32(2);
        FHE.allowThis(vc);
        FHE.allow(vc, address(template));

        euint32[] memory results = template.finalize(acc, vc, params);
        assertEq(results.length, 3);
        // average = 40 / (2 * 1) = 20
        expectPlaintext(results[0], uint32(20));
        expectPlaintext(results[1], uint32(40));
        expectPlaintext(results[2], uint32(2));
    }

    function test_Finalize_WithDivisor() public {
        // divisor = 10 normalizes weights; weights [3,7] = "0.3, 0.7"; value (10,10) => (30+70)/10 = 10
        bytes memory params = _params(0, 3, 1, 7, 10);
        euint32[] memory acc = template.initializeAccumulators(2, params);
        acc = template.processSubmission(acc, _fields(10, 10), _validBool(), params); // 30+70 = 100

        euint32 vc = FHE.asEuint32(1);
        FHE.allowThis(vc);
        FHE.allow(vc, address(template));

        euint32[] memory results = template.finalize(acc, vc, params);
        // average = 100 / (1*10) = 10
        expectPlaintext(results[0], uint32(10));
        expectPlaintext(results[1], uint32(100));
    }

    function test_ResultCount() public view {
        bytes memory params = _params(0, 1, 1, 1, 1);
        assertEq(template.resultCount(2, params), 3);
    }
}

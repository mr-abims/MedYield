// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.25;

import {FHE, euint32, ebool} from "@fhenixprotocol/cofhe-contracts/FHE.sol";
import {IComputationTemplate} from "../interfaces/IComputationTemplate.sol";

/// @title RiskScoring
/// @notice Computes a weighted composite risk score across valid submissions.
/// @dev Params format: abi.encode(Weight[], uint32 divisor) where Weight is (uint256 fieldIndex, uint32 weight).
///      Accumulator layout: [totalWeightedSum]
///      Results: [averageRiskScore, totalWeightedSum, validCount]
contract RiskScoring is IComputationTemplate {
    struct Weight {
        uint256 fieldIndex;
        uint32 weight;
    }

    function initializeAccumulators(
        uint256 fieldCount,
        bytes calldata params
    ) external override returns (euint32[] memory accumulators) {
        (Weight[] memory weights, uint32 divisor) = abi.decode(params, (Weight[], uint32));
        uint256 wLen = weights.length;
        require(wLen > 0, "No weights");
        require(divisor > 0, "Zero divisor");
        for (uint256 i = 0; i < wLen; ) {
            require(weights[i].fieldIndex < fieldCount, "Field out of bounds");
            require(weights[i].weight > 0, "Zero weight");
            unchecked { ++i; }
        }

        accumulators = new euint32[](1);
        accumulators[0] = FHE.asEuint32(0);
        _handoff(accumulators);
    }

    function processSubmission(
        euint32[] memory accumulators,
        euint32[] memory fieldValues,
        ebool isValid,
        bytes calldata params
    ) external override returns (euint32[] memory) {
        (Weight[] memory weights, ) = abi.decode(params, (Weight[], uint32));
        uint256 wLen = weights.length;

        euint32 encW0 = FHE.asEuint32(uint256(weights[0].weight));
        euint32 submissionScore = FHE.mul(fieldValues[weights[0].fieldIndex], encW0);
        for (uint256 i = 1; i < wLen; ) {
            euint32 encWeight = FHE.asEuint32(uint256(weights[i].weight));
            euint32 weighted = FHE.mul(fieldValues[weights[i].fieldIndex], encWeight);
            submissionScore = FHE.add(submissionScore, weighted);
            unchecked { ++i; }
        }

        euint32 newSum = FHE.add(accumulators[0], submissionScore);
        accumulators[0] = FHE.select(isValid, newSum, accumulators[0]);

        _handoff(accumulators);
        return accumulators;
    }

    function finalize(
        euint32[] memory accumulators,
        euint32 validCount,
        bytes calldata params
    ) external override returns (euint32[] memory results) {
        (, uint32 divisor) = abi.decode(params, (Weight[], uint32));

        euint32 encDivisor = FHE.asEuint32(uint256(divisor));

        results = new euint32[](3);
        results[0] = FHE.div(accumulators[0], FHE.mul(validCount, encDivisor));
        results[1] = accumulators[0];
        results[2] = validCount;
        _handoff(results);
    }

    function resultCount(
        uint256,
        bytes calldata
    ) external pure override returns (uint256) {
        return 3;
    }

    function _handoff(euint32[] memory values) internal {
        uint256 len = values.length;
        address caller = msg.sender;
        for (uint256 i = 0; i < len; ) {
            FHE.allowThis(values[i]);
            FHE.allow(values[i], caller);
            unchecked { ++i; }
        }
    }
}

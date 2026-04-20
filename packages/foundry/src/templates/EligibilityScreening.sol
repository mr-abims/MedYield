// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.25;

import {FHE, euint32, ebool} from "@fhenixprotocol/cofhe-contracts/FHE.sol";
import {IComputationTemplate} from "../interfaces/IComputationTemplate.sol";

/// @title EligibilityScreening
/// @notice Counts how many valid submissions match ALL of the given criteria.
/// @dev Params format: abi.encode(Criterion[]) where Criterion is (uint256 fieldIndex, uint8 op, uint32 threshold).
///      Operators: 0 = GTE, 1 = LTE, 2 = EQ.
///      Accumulator layout: [eligibleCount, validCount]
///      Results: [eligibleCount, validCount]
contract EligibilityScreening is IComputationTemplate {
    uint8 public constant OP_GTE = 0;
    uint8 public constant OP_LTE = 1;
    uint8 public constant OP_EQ = 2;

    struct Criterion {
        uint256 fieldIndex;
        uint8 op;
        uint32 threshold;
    }

    function initializeAccumulators(
        uint256 fieldCount,
        bytes calldata params
    ) external override returns (euint32[] memory accumulators) {
        Criterion[] memory criteria = abi.decode(params, (Criterion[]));
        uint256 cLen = criteria.length;
        require(cLen > 0, "No criteria");
        for (uint256 i = 0; i < cLen; ) {
            require(criteria[i].fieldIndex < fieldCount, "Field out of bounds");
            require(criteria[i].op <= OP_EQ, "Unknown operator");
            unchecked { ++i; }
        }

        accumulators = new euint32[](2);
        accumulators[0] = FHE.asEuint32(0); // eligibleCount
        accumulators[1] = FHE.asEuint32(0); // validCount

        _handoff(accumulators);
    }

    function processSubmission(
        euint32[] memory accumulators,
        euint32[] memory fieldValues,
        ebool isValid,
        bytes calldata params
    ) external override returns (euint32[] memory) {
        Criterion[] memory criteria = abi.decode(params, (Criterion[]));
        uint256 cLen = criteria.length;

        ebool allMatch = _evaluateCriterion(fieldValues, criteria[0]);
        for (uint256 i = 1; i < cLen; ) {
            ebool match_ = _evaluateCriterion(fieldValues, criteria[i]);
            allMatch = FHE.and(allMatch, match_);
            unchecked { ++i; }
        }

        ebool eligible = FHE.and(allMatch, isValid);

        euint32 one = FHE.asEuint32(1);
        euint32 newEligible = FHE.add(accumulators[0], one);
        accumulators[0] = FHE.select(eligible, newEligible, accumulators[0]);

        euint32 newValid = FHE.add(accumulators[1], one);
        accumulators[1] = FHE.select(isValid, newValid, accumulators[1]);

        _handoff(accumulators);
        return accumulators;
    }

    function finalize(
        euint32[] memory accumulators,
        euint32 /*validCount*/,
        bytes calldata /*params*/
    ) external override returns (euint32[] memory results) {
        results = new euint32[](2);
        results[0] = accumulators[0];
        results[1] = accumulators[1];
        _handoff(results);
    }

    function resultCount(
        uint256,
        bytes calldata
    ) external pure override returns (uint256) {
        return 2;
    }

    // --- Internal ---

    function _evaluateCriterion(
        euint32[] memory fieldValues,
        Criterion memory c
    ) internal returns (ebool) {
        euint32 value = fieldValues[c.fieldIndex];
        euint32 thresh = FHE.asEuint32(uint256(c.threshold));
        if (c.op == OP_GTE) {
            return FHE.gte(value, thresh);
        } else if (c.op == OP_LTE) {
            return FHE.lte(value, thresh);
        } else {
            return FHE.eq(value, thresh);
        }
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

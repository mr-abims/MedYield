// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.25;

import {FHE, euint32, ebool} from "@fhenixprotocol/cofhe-contracts/FHE.sol";
import {IComputationTemplate} from "../interfaces/IComputationTemplate.sol";

/// @title AggregateStats
/// @notice Computes sum, count, min, max per field. Mean is derived in finalize.
/// @dev Accumulator layout per target field: [sum, min, max]
///      Last accumulator slot is the global valid count.
///      Params encode target field indices: abi.encode(uint256[])
contract AggregateStats is IComputationTemplate {
    function initializeAccumulators(
        uint256 fieldCount,
        bytes calldata params
    ) external override returns (euint32[] memory accumulators) {
        uint256[] memory targetFields = abi.decode(params, (uint256[]));
        uint256 tLen = targetFields.length;
        require(tLen > 0, "No target fields");
        for (uint256 i = 0; i < tLen; ) {
            require(targetFields[i] < fieldCount, "Target field out of bounds");
            unchecked { ++i; }
        }

        uint256 accCount = tLen * 3 + 1;
        accumulators = new euint32[](accCount);

        euint32 zero = FHE.asEuint32(0);
        euint32 maxU32 = FHE.asEuint32(uint256(type(uint32).max));
        for (uint256 i = 0; i < tLen; ) {
            uint256 base = i * 3;
            accumulators[base] = zero;
            accumulators[base + 1] = maxU32;
            accumulators[base + 2] = zero;
            unchecked { ++i; }
        }
        accumulators[accCount - 1] = zero;

        _handoff(accumulators);
    }

    function processSubmission(
        euint32[] memory accumulators,
        euint32[] memory fieldValues,
        ebool isValid,
        bytes calldata params
    ) external override returns (euint32[] memory) {
        uint256[] memory targetFields = abi.decode(params, (uint256[]));
        uint256 tLen = targetFields.length;

        for (uint256 i = 0; i < tLen; ) {
            _updateFieldAccumulators(accumulators, i * 3, fieldValues[targetFields[i]], isValid);
            unchecked { ++i; }
        }
        _updateCount(accumulators, isValid);

        _handoff(accumulators);
        return accumulators;
    }

    function finalize(
        euint32[] memory accumulators,
        euint32 validCount,
        bytes calldata params
    ) external override returns (euint32[] memory results) {
        uint256[] memory targetFields = abi.decode(params, (uint256[]));
        uint256 tLen = targetFields.length;
        uint256 numResults = tLen * 4 + 1;
        results = new euint32[](numResults);

        for (uint256 i = 0; i < tLen; ) {
            uint256 accBase = i * 3;
            uint256 resBase = i * 4;

            results[resBase] = accumulators[accBase];
            results[resBase + 1] = accumulators[accBase + 1];
            results[resBase + 2] = accumulators[accBase + 2];
            results[resBase + 3] = FHE.div(accumulators[accBase], validCount);
            unchecked { ++i; }
        }
        results[numResults - 1] = validCount;

        _handoff(results);
    }

    function resultCount(
        uint256,
        bytes calldata params
    ) external pure override returns (uint256) {
        uint256[] memory targetFields = abi.decode(params, (uint256[]));
        return targetFields.length * 4 + 1;
    }

    // --- Internal helpers ---

    function _updateFieldAccumulators(
        euint32[] memory acc,
        uint256 base,
        euint32 value,
        ebool isValid
    ) internal {
        euint32 newSum = FHE.add(acc[base], value);
        acc[base] = FHE.select(isValid, newSum, acc[base]);

        euint32 newMin = FHE.min(acc[base + 1], value);
        acc[base + 1] = FHE.select(isValid, newMin, acc[base + 1]);

        euint32 newMax = FHE.max(acc[base + 2], value);
        acc[base + 2] = FHE.select(isValid, newMax, acc[base + 2]);
    }

    function _updateCount(euint32[] memory acc, ebool isValid) internal {
        uint256 countIdx = acc.length - 1;
        euint32 one = FHE.asEuint32(1);
        euint32 newCount = FHE.add(acc[countIdx], one);
        acc[countIdx] = FHE.select(isValid, newCount, acc[countIdx]);
    }

    /// @dev Grant the template and the calling vault access to every ciphertext we return.
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

// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.25;

import {FHE, euint32, ebool} from "@fhenixprotocol/cofhe-contracts/FHE.sol";

library DataValidator {
    /// @notice Validate a single euint32 field against pre-encrypted bounds
    /// @param value The encrypted field value
    /// @param encMin Pre-encrypted minimum bound
    /// @param encMax Pre-encrypted maximum bound
    /// @return valid Encrypted boolean: true if min <= value <= max
    function validateField(
        euint32 value,
        euint32 encMin,
        euint32 encMax
    ) internal returns (ebool valid) {
        ebool gteMin = FHE.gte(value, encMin);
        FHE.allowThis(gteMin);

        ebool lteMax = FHE.lte(value, encMax);
        FHE.allowThis(lteMax);

        valid = FHE.and(gteMin, lteMax);
        FHE.allowThis(valid);
    }

    /// @notice Validate all numeric fields and return a combined ebool
    /// @param values Encrypted field values
    /// @param encMins Pre-encrypted minimum bounds (same length as values)
    /// @param encMaxs Pre-encrypted maximum bounds (same length as values)
    /// @return allValid Encrypted boolean: true if ALL fields are in range
    function validateAllFields(
        euint32[] memory values,
        euint32[] memory encMins,
        euint32[] memory encMaxs
    ) internal returns (ebool allValid) {
        uint256 len = values.length;
        require(len == encMins.length && len == encMaxs.length, "Length mismatch");

        // Schemas with zero numeric fields (all booleans) are trivially valid.
        if (len == 0) {
            allValid = FHE.asEbool(true);
            FHE.allowThis(allValid);
            return allValid;
        }

        allValid = validateField(values[0], encMins[0], encMaxs[0]);

        for (uint256 i = 1; i < len; ) {
            ebool fieldValid = validateField(values[i], encMins[i], encMaxs[i]);
            allValid = FHE.and(allValid, fieldValid);
            FHE.allowThis(allValid);
            unchecked { ++i; }
        }
    }
}

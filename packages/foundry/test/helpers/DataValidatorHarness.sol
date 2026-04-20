// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.25;

import {FHE, euint32, ebool} from "@fhenixprotocol/cofhe-contracts/FHE.sol";
import {DataValidator} from "../../src/libraries/DataValidator.sol";

/// @notice Test harness to expose DataValidator library functions as contract calls.
///         Values are trivially encrypted inside the harness to avoid ACL issues.
contract DataValidatorHarness {
    /// @notice Validate a single field from plaintext inputs
    function validateFieldFromPlaintext(
        uint32 value,
        uint32 minVal,
        uint32 maxVal
    ) external returns (ebool) {
        euint32 encValue = FHE.asEuint32(uint256(value));
        FHE.allowThis(encValue);
        euint32 encMin = FHE.asEuint32(uint256(minVal));
        FHE.allowThis(encMin);
        euint32 encMax = FHE.asEuint32(uint256(maxVal));
        FHE.allowThis(encMax);

        ebool result = DataValidator.validateField(encValue, encMin, encMax);
        FHE.allowThis(result);
        FHE.allowSender(result);
        return result;
    }

    /// @notice Validate multiple fields from plaintext arrays
    function validateAllFieldsFromPlaintext(
        uint32[] calldata values,
        uint32[] calldata mins,
        uint32[] calldata maxs
    ) external returns (ebool) {
        require(values.length == mins.length && values.length == maxs.length, "Length mismatch");

        euint32[] memory encValues = new euint32[](values.length);
        euint32[] memory encMins = new euint32[](values.length);
        euint32[] memory encMaxs = new euint32[](values.length);

        for (uint256 i = 0; i < values.length; i++) {
            encValues[i] = FHE.asEuint32(uint256(values[i]));
            FHE.allowThis(encValues[i]);
            encMins[i] = FHE.asEuint32(uint256(mins[i]));
            FHE.allowThis(encMins[i]);
            encMaxs[i] = FHE.asEuint32(uint256(maxs[i]));
            FHE.allowThis(encMaxs[i]);
        }

        ebool result = DataValidator.validateAllFields(encValues, encMins, encMaxs);
        FHE.allowThis(result);
        FHE.allowSender(result);
        return result;
    }

    /// @notice Validate with pre-encrypted bounds (used by DataVault pattern)
    function validateFieldEncrypted(
        euint32 value,
        euint32 encMin,
        euint32 encMax
    ) external returns (ebool) {
        ebool result = DataValidator.validateField(value, encMin, encMax);
        FHE.allowThis(result);
        return result;
    }

    function validateAllFieldsEncrypted(
        euint32[] memory values,
        euint32[] memory encMins,
        euint32[] memory encMaxs
    ) external returns (ebool) {
        ebool result = DataValidator.validateAllFields(values, encMins, encMaxs);
        FHE.allowThis(result);
        return result;
    }
}

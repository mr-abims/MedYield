// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.25;

/// @notice Minimal stand-in for DataVault exposing just `isSubmissionValidated`
///         so MedYieldConditionResolver can be tested without spinning up a
///         full CoFHE vault.
contract StubValidatedVault {
    mapping(uint256 => bool) private _validated;

    function setValidated(uint256 submissionId, bool v) external {
        _validated[submissionId] = v;
    }

    function isSubmissionValidated(uint256 submissionId) external view returns (bool) {
        return _validated[submissionId];
    }
}

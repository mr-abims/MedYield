// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.25;

import {InEuint32, InEbool} from "@fhenixprotocol/cofhe-contracts/FHE.sol";

interface IDataVault {
    event DataSubmitted(uint256 indexed submissionId, address indexed submitter);
    event SubmissionValidated(uint256 indexed submissionId, bool valid);
    event ComputationStarted(uint256 timestamp);
    event ComputationBatchProcessed(uint256 batchStart, uint256 batchEnd);
    event ComputationCompleted(uint256 resultCount);
    event ResultPublished(uint256 indexed resultIndex, uint32 value);

    function submitData(
        InEuint32[] calldata numericFields,
        InEbool[] calldata boolFields
    ) external;

    function confirmSubmission(
        uint256 submissionId,
        bool valid,
        bytes calldata signature
    ) external;

    function triggerComputation() external;

    function processBatch(uint256 batchSize) external;

    function finalizeComputation() external;

    function publishResult(
        uint256 resultIndex,
        uint32 plaintext,
        bytes calldata signature
    ) external;

    function getResult(uint256 resultIndex) external view returns (uint32 value, bool ready);

    /// @notice True iff the submission has been confirmed VALIDATED by the relayer.
    /// @dev Consumed by the ReineiraOS MedYieldConditionResolver plugin to gate
    ///      ConfidentialEscrow payouts on successful on-chain range validation.
    function isSubmissionValidated(uint256 submissionId) external view returns (bool);
}

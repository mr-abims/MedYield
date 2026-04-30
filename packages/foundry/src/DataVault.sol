// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.25;

import {FHE, euint32, ebool, InEuint32, InEbool} from "@fhenixprotocol/cofhe-contracts/FHE.sol";
import {DataValidator} from "./libraries/DataValidator.sol";
import {IComputationTemplate} from "./interfaces/IComputationTemplate.sol";
import {IMedYieldHub} from "./interfaces/IMedYieldHub.sol";
import {
    FieldDefinition,
    FieldType,
    VaultStatus,
    SubmissionStatus,
    BountyConfig
} from "./libraries/HealthDataSchema.sol";

struct EncryptedSubmission {
    address submitter;
    uint256 submittedAt;
    SubmissionStatus status;
    ebool isValid;
}

/// @title DataVault
/// @notice Per-bounty escrow for encrypted submissions. Stores encrypted
///         field values, validates them against pre-encrypted bounds,
///         runs a streaming FHE computation via an external template,
///         and publishes the final encrypted results.
/// @dev    Deployed by VaultDeployer on behalf of MedYieldHub. State
///         machine: OPEN → COMPUTING → COMPLETED, or OPEN/COMPUTING →
///         CANCELLED via hub-initiated cancel(). Each public entrypoint
///         is status-gated; see modifier inStatus().
contract DataVault {
    // --- Immutable config ---
    address public immutable hub;
    address public immutable organization;
    address public immutable relayer;
    IComputationTemplate public immutable template;
    uint256 public immutable bountyId;

    // --- Schema + bounds ---
    FieldDefinition[] public schema;
    uint256 public numericFieldCount;
    uint256 public boolFieldCount;
    BountyConfig public config;
    euint32[] public encMins;
    euint32[] public encMaxs;

    // --- Submissions ---
    mapping(uint256 => EncryptedSubmission) public submissions;
    mapping(uint256 => mapping(uint256 => euint32)) internal encryptedFields;
    mapping(uint256 => mapping(uint256 => ebool)) internal encryptedBoolFields;
    uint256 public submissionCount;
    uint256 public validatedCount;

    // --- Computation ---
    VaultStatus public status;
    euint32[] internal accumulators;
    uint256 public batchCursor;
    euint32[] public results;

    // --- Events ---
    event DataSubmitted(uint256 indexed submissionId, address indexed submitter);
    event SubmissionValidated(uint256 indexed submissionId, bool valid);
    event ComputationStarted(uint256 timestamp);
    event ComputationBatchProcessed(uint256 batchStart, uint256 batchEnd);
    event ComputationCompleted(uint256 resultCount);
    event ResultPublished(uint256 indexed resultIndex, uint32 value);
    event VaultCancelled(address indexed by);

    modifier onlyOrganization() {
        require(msg.sender == organization, "Not organization");
        _;
    }

    modifier onlyRelayer() {
        require(msg.sender == relayer, "Not relayer");
        _;
    }

    modifier onlyHub() {
        require(msg.sender == hub, "Not hub");
        _;
    }

    modifier inStatus(VaultStatus expected) {
        require(status == expected, "Invalid vault status");
        _;
    }

    constructor(
        uint256 _bountyId,
        address _organization,
        address _relayer,
        address _template,
        FieldDefinition[] memory _schema,
        BountyConfig memory _config,
        address _hub
    ) {
        require(_schema.length > 0, "Empty schema");
        require(_config.minSubmissions > 0, "Min submissions must be > 0");
        require(_config.deadline > block.timestamp, "Deadline must be in the future");
        require(_relayer != address(0), "Zero relayer");
        require(_template != address(0), "Zero template");

        bountyId = _bountyId;
        organization = _organization;
        relayer = _relayer;
        template = IComputationTemplate(_template);
        hub = _hub;
        config = _config;
        status = VaultStatus.OPEN;

        uint256 numericCount;
        uint256 boolCount;
        uint256 len = _schema.length;
        for (uint256 i = 0; i < len; ) {
            FieldDefinition memory fd = _schema[i];
            schema.push(fd);
            if (fd.fieldType == FieldType.EUINT32) {
                euint32 encMin = FHE.asEuint32(uint256(fd.minValue));
                FHE.allowThis(encMin);
                encMins.push(encMin);

                euint32 encMax = FHE.asEuint32(uint256(fd.maxValue));
                FHE.allowThis(encMax);
                encMaxs.push(encMax);
                unchecked { ++numericCount; }
            } else {
                unchecked { ++boolCount; }
            }
            unchecked { ++i; }
        }
        numericFieldCount = numericCount;
        boolFieldCount = boolCount;
    }

    // --- Submission ---

    /// @notice Submit encrypted health data for this bounty.
    /// @dev    Runs range validation against the per-field pre-encrypted
    ///         bounds; the resulting ebool is publicly decryptable so the
    ///         relayer can confirm the submission with a plaintext verdict.
    /// @param numericFields Encrypted uint32 values, one per EUINT32 schema
    ///        field, in schema order.
    /// @param boolFields    Encrypted bool values, one per EBOOL schema
    ///        field, in schema order.
    function submitData(
        InEuint32[] calldata numericFields,
        InEbool[] calldata boolFields
    ) external inStatus(VaultStatus.OPEN) {
        require(block.timestamp < config.deadline, "Bounty expired");
        require(submissionCount < config.maxSubmissions, "Max submissions reached");
        require(numericFields.length == numericFieldCount, "Wrong numeric field count");
        require(boolFields.length == boolFieldCount, "Wrong bool field count");

        uint256 subId = submissionCount++;

        uint256 numFC = numericFieldCount;
        euint32[] memory numericValues = new euint32[](numFC);
        uint256 numIdx;
        uint256 boolIdx;
        uint256 schemaLen = schema.length;

        for (uint256 i = 0; i < schemaLen; ) {
            if (schema[i].fieldType == FieldType.EUINT32) {
                euint32 value = FHE.asEuint32(numericFields[numIdx]);
                FHE.allowThis(value);
                FHE.allowSender(value);
                encryptedFields[subId][numIdx] = value;
                numericValues[numIdx] = value;
                unchecked { ++numIdx; }
            } else {
                ebool value = FHE.asEbool(boolFields[boolIdx]);
                FHE.allowThis(value);
                FHE.allowSender(value);
                encryptedBoolFields[subId][boolIdx] = value;
                unchecked { ++boolIdx; }
            }
            unchecked { ++i; }
        }

        ebool isValid = DataValidator.validateAllFields(numericValues, encMins, encMaxs);
        FHE.allowThis(isValid);
        FHE.allowPublic(isValid);

        submissions[subId] = EncryptedSubmission({
            submitter: msg.sender,
            submittedAt: block.timestamp,
            status: SubmissionStatus.PENDING,
            isValid: isValid
        });

        emit DataSubmitted(subId, msg.sender);
    }

    // --- Validation confirmation (relayer only) ---

    /// @notice Relayer-only confirmation of a submission's validity.
    /// @dev    Verifies the FHE decryption signature of the submission's
    ///         encrypted validity flag against `valid`, then promotes or
    ///         rejects the submission. Idempotent per submission.
    function confirmSubmission(
        uint256 submissionId,
        bool valid,
        bytes calldata signature
    ) external onlyRelayer inStatus(VaultStatus.OPEN) {
        EncryptedSubmission storage sub = submissions[submissionId];
        require(sub.submitter != address(0), "Submission does not exist");
        require(sub.status == SubmissionStatus.PENDING, "Already confirmed");

        FHE.publishDecryptResult(sub.isValid, valid, signature);

        if (valid) {
            sub.status = SubmissionStatus.VALIDATED;
            validatedCount++;
        } else {
            sub.status = SubmissionStatus.REJECTED;
        }

        emit SubmissionValidated(submissionId, valid);
    }

    // --- Computation ---

    /// @notice Begin the FHE computation. Initializes accumulators via the
    ///         configured template and transitions the vault to COMPUTING.
    /// @dev    Only callable by the organisation once validatedCount has
    ///         reached minSubmissions.
    function triggerComputation() external onlyOrganization inStatus(VaultStatus.OPEN) {
        require(validatedCount >= config.minSubmissions, "Not enough validated submissions");

        status = VaultStatus.COMPUTING;
        batchCursor = 0;

        accumulators = template.initializeAccumulators(
            numericFieldCount,
            config.templateParams
        );

        emit ComputationStarted(block.timestamp);
    }

    /// @notice Advance the computation by processing up to `batchSize`
    ///         submissions. Can be called repeatedly, by anyone, because
    ///         the template already gates every update on the per-submission
    ///         encrypted validity flag.
    function processBatch(uint256 batchSize) external inStatus(VaultStatus.COMPUTING) {
        require(batchSize > 0, "Batch size must be > 0");
        uint256 start = batchCursor;
        require(start < submissionCount, "All submissions processed");
        uint256 end = start + batchSize;
        if (end > submissionCount) end = submissionCount;

        address tmpl = address(template);
        uint256 numFC = numericFieldCount;

        // Hoisted once per batch — accumulator ciphertexts are replaced by
        // template.processSubmission, which already re-grants access to
        // the new handles via its _handoff. So we only need to authorise
        // the current `accumulators` array, not re-authorise every iter.
        uint256 accLen = accumulators.length;
        for (uint256 j = 0; j < accLen; ) {
            FHE.allow(accumulators[j], tmpl);
            unchecked { ++j; }
        }

        for (uint256 i = start; i < end; ) {
            EncryptedSubmission storage sub = submissions[i];

            // Plaintext filter gates the loop — only VALIDATED submissions flow through.
            if (sub.status == SubmissionStatus.VALIDATED) {
                euint32[] memory fieldValues = new euint32[](numFC);
                for (uint256 j = 0; j < numFC; ) {
                    euint32 v = encryptedFields[i][j];
                    FHE.allow(v, tmpl);
                    fieldValues[j] = v;
                    unchecked { ++j; }
                }
                FHE.allow(sub.isValid, tmpl);

                accumulators = template.processSubmission(
                    accumulators,
                    fieldValues,
                    sub.isValid,
                    config.templateParams
                );
            }

            unchecked { ++i; }
        }

        batchCursor = end;
        emit ComputationBatchProcessed(start, end);
    }

    /// @notice Finalize the computation, produce encrypted results, and
    ///         notify the hub. Reverts unless all batches have been processed.
    /// @dev    Results are granted persistent ACLs to the organisation and
    ///         public-decrypt so any third party can supply the signed
    ///         plaintext via publishResult.
    function finalizeComputation() external onlyOrganization inStatus(VaultStatus.COMPUTING) {
        require(batchCursor >= submissionCount, "Not all batches processed");

        address tmpl = address(template);

        // Trivially encrypt validatedCount only at finalize boundary.
        euint32 encValidCount = FHE.asEuint32(uint256(validatedCount));
        FHE.allowThis(encValidCount);
        FHE.allow(encValidCount, tmpl);

        uint256 accLen = accumulators.length;
        for (uint256 i = 0; i < accLen; ) {
            FHE.allow(accumulators[i], tmpl);
            unchecked { ++i; }
        }

        results = template.finalize(accumulators, encValidCount, config.templateParams);

        uint256 rLen = results.length;
        for (uint256 i = 0; i < rLen; ) {
            FHE.allowThis(results[i]);
            FHE.allowPublic(results[i]);
            FHE.allow(results[i], organization);
            unchecked { ++i; }
        }

        status = VaultStatus.COMPLETED;
        emit ComputationCompleted(rLen);

        // Notify the hub so lifecycle listeners see BountyCompleted without
        // having to subscribe to this vault directly.
        IMedYieldHub(hub).onComputationComplete(bountyId);
    }

    // --- Cancellation (hub only) ---

    /// @notice Permanently halts submissions and computation. Called by the
    ///         hub when closeBounty resolves to a terminal state.
    /// @dev    Reverts if the vault has already transitioned to a terminal
    ///         state (COMPLETED / CANCELLED), which gives callers one-shot
    ///         semantics without needing a separate check at the hub.
    function cancel() external onlyHub {
        require(
            status == VaultStatus.OPEN || status == VaultStatus.COMPUTING,
            "Not cancellable"
        );
        status = VaultStatus.CANCELLED;
        emit VaultCancelled(msg.sender);
    }

    // --- Results ---

    /// @notice Publish the plaintext decryption of a result slot.
    /// @dev    The FHE decryption signature is verified on-chain; an
    ///         invalid plaintext/signature pair reverts. No access control
    ///         on the caller — anyone with the signed plaintext can submit.
    function publishResult(
        uint256 resultIndex,
        uint32 plaintext,
        bytes calldata signature
    ) external inStatus(VaultStatus.COMPLETED) {
        require(resultIndex < results.length, "Result index out of bounds");
        FHE.publishDecryptResult(results[resultIndex], plaintext, signature);
        emit ResultPublished(resultIndex, plaintext);
    }

    /// @notice Best-effort read of a result slot.
    /// @return value Decrypted uint32 value once available, else 0.
    /// @return ready True iff publishResult has supplied a verified plaintext.
    function getResult(uint256 resultIndex) external view returns (uint32 value, bool ready) {
        require(resultIndex < results.length, "Result index out of bounds");
        (value, ready) = FHE.getDecryptResultSafe(results[resultIndex]);
    }

    /// @notice Number of encrypted result slots produced by the template.
    function getResultCount() external view returns (uint256) {
        return results.length;
    }

    /// @notice Schema length = numericFieldCount + boolFieldCount.
    function getSchemaLength() external view returns (uint256) {
        return schema.length;
    }

    /// @notice Plaintext view consumed by MedYieldConditionResolver to
    ///         gate ConfidentialEscrow payouts.
    /// @return True iff the submission has been confirmed VALIDATED.
    function isSubmissionValidated(uint256 submissionId) external view returns (bool) {
        return submissions[submissionId].status == SubmissionStatus.VALIDATED;
    }

    /// @notice Deadline exposed as a top-level getter for integrations that
    ///         don't want to decode the full BountyConfig struct.
    function deadline() external view returns (uint256) {
        return config.deadline;
    }
}

// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.25;

import {Test} from "forge-std/Test.sol";
import {CoFheTest} from "@cofhe/mock-contracts/foundry/CoFheTest.sol";
import {FHE, euint32, ebool, InEuint32, InEbool} from "@fhenixprotocol/cofhe-contracts/FHE.sol";
import {DataVault, EncryptedSubmission} from "../src/DataVault.sol";
import {AggregateStats} from "../src/templates/AggregateStats.sol";
import {
    FieldDefinition,
    FieldType,
    VaultStatus,
    SubmissionStatus,
    BountyConfig
} from "../src/libraries/HealthDataSchema.sol";

contract DataVaultTest is Test, CoFheTest {
    DataVault public vault;
    AggregateStats public aggTemplate;

    address public org;
    uint256 public orgKey;
    address public user1;
    uint256 public user1Key;
    address public user2;
    uint256 public user2Key;
    address public relayer;

    // Stub for IMedYieldHub.onComputationComplete — called by DataVault at finalize.
    // The test contract stands in for the hub via address(this) below.
    uint256 public lastCompletedBountyId;
    bool public onCompletedCalled;
    function onComputationComplete(uint256 bountyId) external {
        lastCompletedBountyId = bountyId;
        onCompletedCalled = true;
    }

    function setUp() public {
        (org, orgKey) = makeAddrAndKey("org");
        (user1, user1Key) = makeAddrAndKey("user1");
        (user2, user2Key) = makeAddrAndKey("user2");
        relayer = makeAddr("relayer");

        aggTemplate = new AggregateStats();

        // Schema: 2 numeric fields (age [1,130], glucose [30,500])
        FieldDefinition[] memory schema = new FieldDefinition[](2);
        schema[0] = FieldDefinition("age", FieldType.EUINT32, 1, 130);
        schema[1] = FieldDefinition("glucose", FieldType.EUINT32, 30, 500);

        // Params: aggregate both fields
        uint256[] memory targets = new uint256[](2);
        targets[0] = 0;
        targets[1] = 1;
        bytes memory templateParams = abi.encode(targets);

        BountyConfig memory cfg = BountyConfig({
            pricePerRecord: 1 ether,
            maxSubmissions: 10,
            minSubmissions: 2,
            deadline: block.timestamp + 30 days,
            templateId: 0,
            templateParams: templateParams,
            metadataURI: "ipfs://test"
        });

        vault = new DataVault(
            0, // bountyId
            org,
            relayer,
            address(aggTemplate),
            schema,
            cfg,
            address(this) // hub
        );
    }

    // --- Helpers ---

    function _submitData(address user, uint32 age, uint32 glucose) internal returns (uint256 subId) {
        subId = vault.submissionCount();
        InEuint32[] memory nums = new InEuint32[](2);
        nums[0] = createInEuint32(age, user);
        nums[1] = createInEuint32(glucose, user);
        InEbool[] memory bools = new InEbool[](0);

        vm.prank(user);
        vault.submitData(nums, bools);
    }

    function _confirmValid(uint256 subId) internal {
        vm.prank(relayer);
        vault.confirmSubmission(subId, true, "");
    }

    function _confirmInvalid(uint256 subId) internal {
        vm.prank(relayer);
        vault.confirmSubmission(subId, false, "");
    }

    // --- Submission tests ---

    function test_SubmitData() public {
        uint256 subId = _submitData(user1, 45, 100);
        assertEq(subId, 0);
        assertEq(vault.submissionCount(), 1);

        (address submitter, uint256 submittedAt, SubmissionStatus s,) = vault.submissions(0);
        assertEq(submitter, user1);
        assertGt(submittedAt, 0);
        assertEq(uint8(s), uint8(SubmissionStatus.PENDING));
    }

    function test_SubmitMultiple() public {
        _submitData(user1, 45, 100);
        _submitData(user2, 30, 200);
        assertEq(vault.submissionCount(), 2);
    }

    function test_CannotSubmitAfterDeadline() public {
        vm.warp(block.timestamp + 31 days);
        InEuint32[] memory nums = new InEuint32[](2);
        nums[0] = createInEuint32(45, user1);
        nums[1] = createInEuint32(100, user1);
        InEbool[] memory bools = new InEbool[](0);

        vm.prank(user1);
        vm.expectRevert("Bounty expired");
        vault.submitData(nums, bools);
    }

    function test_CannotExceedMaxSubmissions() public {
        // Max is 10
        for (uint256 i = 0; i < 10; i++) {
            _submitData(user1, 45, 100);
        }
        InEuint32[] memory nums = new InEuint32[](2);
        nums[0] = createInEuint32(45, user1);
        nums[1] = createInEuint32(100, user1);
        InEbool[] memory bools = new InEbool[](0);

        vm.prank(user1);
        vm.expectRevert("Max submissions reached");
        vault.submitData(nums, bools);
    }

    function test_WrongFieldCountReverts() public {
        InEuint32[] memory nums = new InEuint32[](1); // expect 2
        nums[0] = createInEuint32(45, user1);
        InEbool[] memory bools = new InEbool[](0);

        vm.prank(user1);
        vm.expectRevert("Wrong numeric field count");
        vault.submitData(nums, bools);
    }

    // --- Confirmation tests ---

    function test_ConfirmValid() public {
        _submitData(user1, 45, 100);
        _confirmValid(0);

        (, , SubmissionStatus s,) = vault.submissions(0);
        assertEq(uint8(s), uint8(SubmissionStatus.VALIDATED));
        assertEq(vault.validatedCount(), 1);
    }

    function test_ConfirmInvalid() public {
        _submitData(user1, 200, 100); // age=200 out of [1,130]
        _confirmInvalid(0);

        (, , SubmissionStatus s,) = vault.submissions(0);
        assertEq(uint8(s), uint8(SubmissionStatus.REJECTED));
        assertEq(vault.validatedCount(), 0);
    }

    function test_CannotConfirmTwice() public {
        _submitData(user1, 45, 100);
        _confirmValid(0);

        vm.prank(relayer);
        vm.expectRevert("Already confirmed");
        vault.confirmSubmission(0, true, "");
    }

    function test_CannotConfirmNonexistent() public {
        vm.prank(relayer);
        vm.expectRevert("Submission does not exist");
        vault.confirmSubmission(999, true, "");
    }

    // --- Computation lifecycle ---

    function test_TriggerComputation() public {
        _submitData(user1, 45, 100);
        _confirmValid(0);
        _submitData(user2, 30, 200);
        _confirmValid(1);

        vm.prank(org);
        vault.triggerComputation();

        assertEq(uint8(vault.status()), uint8(VaultStatus.COMPUTING));
    }

    function test_CannotTriggerWithoutMinSubmissions() public {
        _submitData(user1, 45, 100);
        _confirmValid(0);
        // Only 1 validated, need 2

        vm.prank(org);
        vm.expectRevert("Not enough validated submissions");
        vault.triggerComputation();
    }

    function test_OnlyOrgCanTrigger() public {
        _submitData(user1, 45, 100);
        _confirmValid(0);
        _submitData(user2, 30, 200);
        _confirmValid(1);

        vm.prank(user1);
        vm.expectRevert("Not organization");
        vault.triggerComputation();
    }

    function test_FullComputationFlow() public {
        // Submit 3 records, confirm 2 valid, 1 invalid
        uint256 sub0 = _submitData(user1, 45, 100);  // valid
        uint256 sub1 = _submitData(user2, 30, 200);  // valid
        uint256 sub2 = _submitData(user1, 200, 100); // will be rejected (age out of range)

        _confirmValid(sub0);
        _confirmValid(sub1);
        _confirmInvalid(sub2);

        // Trigger computation
        vm.prank(org);
        vault.triggerComputation();

        // Process all in one batch
        vault.processBatch(10);

        // Finalize
        vm.prank(org);
        vault.finalizeComputation();

        assertEq(uint8(vault.status()), uint8(VaultStatus.COMPLETED));
        assertGt(vault.getResultCount(), 0);
    }

    function test_BatchProcessing() public {
        _submitData(user1, 45, 100);
        _confirmValid(0);
        _submitData(user2, 30, 200);
        _confirmValid(1);
        _submitData(user1, 60, 150);
        _confirmValid(2);

        vm.prank(org);
        vault.triggerComputation();

        // Process in batches of 2
        vault.processBatch(2);
        assertEq(vault.batchCursor(), 2);

        vault.processBatch(2);
        assertEq(vault.batchCursor(), 3); // capped at submissionCount

        // Finalize
        vm.prank(org);
        vault.finalizeComputation();

        assertEq(uint8(vault.status()), uint8(VaultStatus.COMPLETED));
    }

    function test_CannotFinalizeBeforeAllBatches() public {
        _submitData(user1, 45, 100);
        _confirmValid(0);
        _submitData(user2, 30, 200);
        _confirmValid(1);

        vm.prank(org);
        vault.triggerComputation();

        // Don't process any batches
        vm.prank(org);
        vm.expectRevert("Not all batches processed");
        vault.finalizeComputation();
    }

    function test_CannotProcessBatchWhenOpen() public {
        vm.expectRevert("Invalid vault status");
        vault.processBatch(5);
    }

    // --- Result tests ---

    function test_PublishAndGetResult() public {
        _submitData(user1, 60, 100);
        _confirmValid(0);
        _submitData(user2, 40, 200);
        _confirmValid(1);

        vm.prank(org);
        vault.triggerComputation();
        vault.processBatch(10);
        vm.prank(org);
        vault.finalizeComputation();

        // Results: [sum_age, min_age, max_age, mean_age, sum_glucose, min_glucose, max_glucose, mean_glucose, count]
        // Check result count: 2 fields * 4 + 1 = 9
        assertEq(vault.getResultCount(), 9);

        // Publish sum of age (should be 60+40=100)
        vault.publishResult(0, 100, "");
        (uint32 val, bool ready) = vault.getResult(0);
        assertTrue(ready);
        assertEq(val, 100);
    }

    function test_ResultNotReadyBeforePublish() public {
        _submitData(user1, 45, 100);
        _confirmValid(0);
        _submitData(user2, 30, 200);
        _confirmValid(1);

        vm.prank(org);
        vault.triggerComputation();
        vault.processBatch(10);
        vm.prank(org);
        vault.finalizeComputation();

        (uint32 val, bool ready) = vault.getResult(0);
        assertFalse(ready);
        assertEq(val, 0);
    }

    function test_CannotPublishResultWhenNotCompleted() public {
        vm.expectRevert("Invalid vault status");
        vault.publishResult(0, 100, "");
    }

    // --- Schema tests ---

    function test_SchemaLength() public view {
        assertEq(vault.getSchemaLength(), 2);
        assertEq(vault.numericFieldCount(), 2);
        assertEq(vault.boolFieldCount(), 0);
    }
}

// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.25;

import {CofheTest} from "@cofhe/foundry-plugin/CofheTest.sol";
import {CofheClient} from "@cofhe/foundry-plugin/CofheClient.sol";
import {FHE, euint32, ebool, InEuint32, InEbool} from "@fhenixprotocol/cofhe-contracts/FHE.sol";
import {DataVault} from "../src/DataVault.sol";
import {AggregateStats} from "../src/templates/AggregateStats.sol";
import {
    FieldDefinition,
    FieldType,
    VaultStatus,
    BountyConfig
} from "../src/libraries/HealthDataSchema.sol";

/// @notice Verifies that a cancelled vault rejects every state-changing
///         entrypoint and that cancel() itself enforces one-shot semantics
///         and hub-only access.
contract DataVaultCancelTest is CofheTest {
    DataVault public vault;
    AggregateStats public aggTemplate;
    CofheClient public client;

    address public org;
    address public user;
    uint256 public userKey;
    address public relayer;
    address public hub; // this contract stands in as the hub

    function onComputationComplete(uint256) external {}

    function setUp() public {
        deployMocks();
        client = createCofheClient();

        org = makeAddr("org");
        (user, userKey) = makeAddrAndKey("user");
        relayer = makeAddr("relayer");
        hub = address(this);

        aggTemplate = new AggregateStats();

        FieldDefinition[] memory schema = new FieldDefinition[](1);
        schema[0] = FieldDefinition("age", FieldType.EUINT32, 1, 130);

        uint256[] memory targets = new uint256[](1);
        targets[0] = 0;

        BountyConfig memory cfg = BountyConfig({
            pricePerRecord: 1 ether,
            maxSubmissions: 10,
            minSubmissions: 2,
            deadline: block.timestamp + 30 days,
            templateId: 0,
            templateParams: abi.encode(targets),
            metadataURI: "ipfs://test"
        });

        vault = new DataVault(0, org, relayer, address(aggTemplate), schema, cfg, hub);
    }

    function _submit(uint32 age) internal returns (uint256 subId) {
        subId = vault.submissionCount();
        client.connect(userKey);
        InEuint32[] memory nums = new InEuint32[](1);
        nums[0] = client.createInEuint32(age);
        InEbool[] memory bools = new InEbool[](0);
        vm.prank(user);
        vault.submitData(nums, bools);
    }

    function _confirm(uint256 subId, bool valid) internal {
        (, , , ebool isValid) = vault.submissions(subId);
        bytes memory sig = mockThresholdNetworkSigner.signDecryptResult(
            uint256(ebool.unwrap(isValid)),
            valid ? 1 : 0
        );
        vm.prank(relayer);
        vault.confirmSubmission(subId, valid, sig);
    }

    // --- access control on cancel() ---

    function test_CancelRevertsFromNonHub() public {
        vm.prank(org);
        vm.expectRevert("Not hub");
        vault.cancel();
    }

    function test_CancelSetsStatusCancelled() public {
        vault.cancel();
        assertEq(uint8(vault.status()), uint8(VaultStatus.CANCELLED));
    }

    function test_CancelIsOneShot() public {
        vault.cancel();
        vm.expectRevert("Not cancellable");
        vault.cancel();
    }

    // --- state-changing entrypoints revert after cancel ---

    function test_SubmitDataRevertsAfterCancel() public {
        vault.cancel();

        client.connect(userKey);
        InEuint32[] memory nums = new InEuint32[](1);
        nums[0] = client.createInEuint32(45);
        InEbool[] memory bools = new InEbool[](0);

        vm.prank(user);
        vm.expectRevert("Invalid vault status");
        vault.submitData(nums, bools);
    }

    function test_ConfirmSubmissionRevertsAfterCancel() public {
        _submit(45);
        vault.cancel();

        vm.prank(relayer);
        vm.expectRevert("Invalid vault status");
        vault.confirmSubmission(0, true, "");
    }

    function test_TriggerComputationRevertsAfterCancel() public {
        _submit(45);
        _submit(50);
        vault.cancel();

        vm.prank(org);
        vm.expectRevert("Invalid vault status");
        vault.triggerComputation();
    }

    // --- cancel is valid during COMPUTING ---

    function test_CancelAllowedDuringComputing() public {
        uint256 s0 = _submit(45);
        uint256 s1 = _submit(50);
        _confirm(s0, true);
        _confirm(s1, true);

        vm.prank(org);
        vault.triggerComputation();
        assertEq(uint8(vault.status()), uint8(VaultStatus.COMPUTING));

        vault.cancel();
        assertEq(uint8(vault.status()), uint8(VaultStatus.CANCELLED));
    }

    function test_CancelRevertsAfterCompleted() public {
        uint256 s0 = _submit(45);
        uint256 s1 = _submit(50);
        _confirm(s0, true);
        _confirm(s1, true);

        vm.prank(org);
        vault.triggerComputation();
        vault.processBatch(10);
        vm.prank(org);
        vault.finalizeComputation();
        assertEq(uint8(vault.status()), uint8(VaultStatus.COMPLETED));

        vm.expectRevert("Not cancellable");
        vault.cancel();
    }
}

// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.25;

import {CofheTest} from "@cofhe/foundry-plugin/CofheTest.sol";
import {CofheClient} from "@cofhe/foundry-plugin/CofheClient.sol";
import {FHE, euint32, ebool, InEuint32, InEbool} from "@fhenixprotocol/cofhe-contracts/FHE.sol";
import {MedYieldHub} from "../../src/MedYieldHub.sol";
import {TemplateRegistry} from "../../src/TemplateRegistry.sol";
import {VaultDeployer} from "../../src/VaultDeployer.sol";
import {DataVault} from "../../src/DataVault.sol";
import {AggregateStats} from "../../src/templates/AggregateStats.sol";
import {
    BountyConfig,
    FieldDefinition,
    FieldType,
    TemplateType,
    VaultStatus,
    VaultRecord
} from "../../src/libraries/HealthDataSchema.sol";

/// @notice End-to-end lifecycle: deploy → register template → create bounty →
///         6 users submit → relayer confirms 5 valid + 1 invalid → org triggers →
///         batches → finalize → verify aggregates → publish + read results.
contract FullFlowTest is CofheTest {
    MedYieldHub public hub;
    TemplateRegistry public registry;
    VaultDeployer public deployer;
    AggregateStats public aggTemplate;
    CofheClient public client;

    address public admin;
    address public org;
    address public relayer;
    address[6] public users;
    uint256[6] public userKeys;

    uint256 public templateId;
    uint256 public bountyId;
    DataVault public vault;

    uint32[6] public ages = [uint32(30), 40, 50, 25, 60, 200]; // last one out-of-range (rejected)
    uint32[6] public glucose = [uint32(90), 110, 100, 95, 130, 120];

    function setUp() public {
        deployMocks();
        client = createCofheClient();

        admin = makeAddr("admin");
        org = makeAddr("org");
        relayer = makeAddr("relayer");
        for (uint256 i = 0; i < 6; i++) {
            (users[i], userKeys[i]) = makeAddrAndKey(string(abi.encodePacked("user", vm.toString(i))));
        }

        aggTemplate = new AggregateStats();
        deployer = new VaultDeployer();

        vm.startPrank(admin);
        registry = new TemplateRegistry();
        templateId = registry.registerTemplate(
            "AggregateStats",
            address(aggTemplate),
            TemplateType.AGGREGATE_STATS
        );
        hub = new MedYieldHub(address(registry), address(deployer), relayer);
        vm.stopPrank();
        deployer.setHub(address(hub));

        // Schema: age [1, 130], glucose [30, 500]
        FieldDefinition[] memory schema = new FieldDefinition[](2);
        schema[0] = FieldDefinition("age", FieldType.EUINT32, 1, 130);
        schema[1] = FieldDefinition("glucose", FieldType.EUINT32, 30, 500);

        uint256[] memory targets = new uint256[](2);
        targets[0] = 0;
        targets[1] = 1;
        BountyConfig memory cfg = BountyConfig({
            pricePerRecord: 1 ether,
            maxSubmissions: 10,
            minSubmissions: 5,
            deadline: block.timestamp + 30 days,
            templateId: templateId,
            templateParams: abi.encode(targets),
            metadataURI: "ipfs://demo"
        });

        vm.prank(org);
        bountyId = hub.createBounty(cfg, schema);

        VaultRecord memory record = hub.getVault(bountyId);
        vault = DataVault(record.vault);
    }

    function _submit(uint256 i, uint32 age, uint32 gluc) internal {
        client.connect(userKeys[i]);
        InEuint32[] memory nums = new InEuint32[](2);
        nums[0] = client.createInEuint32(age);
        nums[1] = client.createInEuint32(gluc);
        InEbool[] memory bools = new InEbool[](0);
        vm.prank(users[i]);
        vault.submitData(nums, bools);
    }

    function _signResult(uint256 resultIndex, uint32 plaintext) internal view returns (bytes memory) {
        uint256 ctHash = uint256(euint32.unwrap(vault.results(resultIndex)));
        return mockThresholdNetworkSigner.signDecryptResult(ctHash, uint256(plaintext));
    }

    function test_FullLifecycle() public {
        // 1. Six submissions
        for (uint256 i = 0; i < 6; i++) {
            _submit(i, ages[i], glucose[i]);
        }
        assertEq(vault.submissionCount(), 6);

        // 2. Relayer confirms each. ages[5] = 200 is out of [1,130] so invalid.
        for (uint256 i = 0; i < 6; i++) {
            bool valid = ages[i] <= 130;
            (, , , ebool isValid) = vault.submissions(i);
            bytes memory sig = mockThresholdNetworkSigner.signDecryptResult(
                uint256(ebool.unwrap(isValid)),
                valid ? 1 : 0
            );
            vm.prank(relayer);
            vault.confirmSubmission(i, valid, sig);
        }

        assertEq(vault.validatedCount(), 5);

        // 3. Org triggers computation
        vm.prank(org);
        vault.triggerComputation();
        assertEq(uint8(vault.status()), uint8(VaultStatus.COMPUTING));

        // 4. Process in two batches of 3
        vault.processBatch(3);
        assertEq(vault.batchCursor(), 3);
        vault.processBatch(3);
        assertEq(vault.batchCursor(), 6);

        // 5. Finalize
        vm.prank(org);
        vault.finalizeComputation();
        assertEq(uint8(vault.status()), uint8(VaultStatus.COMPLETED));

        // 6. Verify aggregates via encrypted handles.
        //    Layout: [sum_age, min_age, max_age, mean_age,
        //             sum_glucose, min_glucose, max_glucose, mean_glucose, count]
        assertEq(vault.getResultCount(), 9);

        // Valid ages: 30, 40, 50, 25, 60
        uint32 sumAge = 30 + 40 + 50 + 25 + 60;       // 205
        uint32 minAge = 25;
        uint32 maxAge = 60;
        uint32 meanAge = sumAge / 5;                   // 41

        // Valid glucose: 90, 110, 100, 95, 130
        uint32 sumGluc = 90 + 110 + 100 + 95 + 130;    // 525
        uint32 minGluc = 90;
        uint32 maxGluc = 130;
        uint32 meanGluc = sumGluc / 5;                 // 105

        vault.publishResult(0, sumAge, _signResult(0, sumAge));
        vault.publishResult(1, minAge, _signResult(1, minAge));
        vault.publishResult(2, maxAge, _signResult(2, maxAge));
        vault.publishResult(3, meanAge, _signResult(3, meanAge));
        vault.publishResult(4, sumGluc, _signResult(4, sumGluc));
        vault.publishResult(5, minGluc, _signResult(5, minGluc));
        vault.publishResult(6, maxGluc, _signResult(6, maxGluc));
        vault.publishResult(7, meanGluc, _signResult(7, meanGluc));
        vault.publishResult(8, 5, _signResult(8, 5));

        (uint32 v0, bool r0) = vault.getResult(0);
        assertTrue(r0);
        assertEq(v0, sumAge);

        (uint32 v3, bool r3) = vault.getResult(3);
        assertTrue(r3);
        assertEq(v3, meanAge);

        (uint32 v7, bool r7) = vault.getResult(7);
        assertTrue(r7);
        assertEq(v7, meanGluc);

        (uint32 v8, bool r8) = vault.getResult(8);
        assertTrue(r8);
        assertEq(v8, 5);
    }

    /// @notice Org cancels mid-submission. Further submit/confirm/trigger
    ///         calls on the vault must revert, and the hub should report
    ///         CANCELLED via live read.
    function test_OrgCancelMidFlow_HaltsEverything() public {
        // Two submissions arrive before the org closes the bounty.
        _submit(0, ages[0], glucose[0]);
        _submit(1, ages[1], glucose[1]);

        vm.prank(org);
        hub.closeBounty(bountyId);

        assertEq(uint8(vault.status()), uint8(VaultStatus.CANCELLED));
        assertEq(uint8(hub.getVault(bountyId).status), uint8(VaultStatus.CANCELLED));

        // Further submissions revert.
        client.connect(userKeys[2]);
        InEuint32[] memory nums = new InEuint32[](2);
        nums[0] = client.createInEuint32(ages[2]);
        nums[1] = client.createInEuint32(glucose[2]);
        InEbool[] memory bools = new InEbool[](0);
        vm.prank(users[2]);
        vm.expectRevert("Invalid vault status");
        vault.submitData(nums, bools);

        // Confirmations revert.
        vm.prank(relayer);
        vm.expectRevert("Invalid vault status");
        vault.confirmSubmission(0, true, "");

        // Trigger reverts.
        vm.prank(org);
        vm.expectRevert("Invalid vault status");
        vault.triggerComputation();

        // Hub rejects double-close because vault.cancel() is one-shot.
        vm.prank(org);
        vm.expectRevert("Not cancellable");
        hub.closeBounty(bountyId);
    }
}

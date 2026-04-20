// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.25;

import {ERC165} from "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import {IConditionResolver} from "./interfaces/IConditionResolver.sol";
import {IDataVault} from "./interfaces/IDataVault.sol";

/// @title MedYieldConditionResolver
/// @notice ReineiraOS escrow-condition plugin that gates payout of a
///         ConfidentialEscrow on a MedYield DataVault submission reaching
///         the VALIDATED state.
///
/// Integration flow:
///   1. Organisation encrypts (owner = submitter, amount = pricePerRecord) client-side.
///   2. Organisation calls ConfidentialEscrow.create(encOwner, encAmount,
///        address(this), abi.encode(vault, submissionId)).
///   3. ConfidentialEscrow atomically calls onConditionSet → binding is stored.
///   4. User submits encrypted data to the DataVault; relayer calls
///        confirmSubmission(..., true) → status becomes VALIDATED.
///   5. User calls ConfidentialEscrow.redeem(escrowId); escrow calls
///        isConditionMet(escrowId) → resolver queries vault.isSubmissionValidated(id).
///   6. On true, encrypted cUSDC is released to the user. On false, redeem
///        reverts; organisation can withdraw after the escrow expires.
contract MedYieldConditionResolver is IConditionResolver, ERC165 {
    struct Binding {
        address vault;
        uint256 submissionId;
        bool set;
    }

    /// @notice The only address authorised to invoke onConditionSet.
    ///         Set to the ReineiraOS ConfidentialEscrow proxy at deployment.
    address public immutable escrow;

    mapping(uint256 => Binding) private _bindings;

    event BindingSet(uint256 indexed escrowId, address indexed vault, uint256 submissionId);

    error NotEscrow();
    error AlreadyBound();
    error ZeroVault();

    constructor(address _escrow) {
        require(_escrow != address(0), "Zero escrow");
        escrow = _escrow;
    }

    /// @inheritdoc IConditionResolver
    function onConditionSet(uint256 escrowId, bytes calldata data) external override {
        if (msg.sender != escrow) revert NotEscrow();
        if (_bindings[escrowId].set) revert AlreadyBound();

        (address vault, uint256 submissionId) = abi.decode(data, (address, uint256));
        if (vault == address(0)) revert ZeroVault();

        _bindings[escrowId] = Binding({
            vault: vault,
            submissionId: submissionId,
            set: true
        });

        emit BindingSet(escrowId, vault, submissionId);
    }

    /// @inheritdoc IConditionResolver
    function isConditionMet(uint256 escrowId) external view override returns (bool) {
        Binding memory b = _bindings[escrowId];
        if (!b.set) return false;
        return IDataVault(b.vault).isSubmissionValidated(b.submissionId);
    }

    /// @notice Inspect the stored binding for an escrow.
    function binding(uint256 escrowId)
        external
        view
        returns (address vault, uint256 submissionId, bool set)
    {
        Binding memory b = _bindings[escrowId];
        return (b.vault, b.submissionId, b.set);
    }

    function supportsInterface(bytes4 interfaceId) public view override returns (bool) {
        return
            interfaceId == type(IConditionResolver).interfaceId ||
            super.supportsInterface(interfaceId);
    }
}

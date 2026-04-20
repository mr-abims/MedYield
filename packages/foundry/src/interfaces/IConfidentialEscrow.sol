// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.25;

import {InEuint64, InEaddress} from "@fhenixprotocol/cofhe-contracts/FHE.sol";

/// @title IConfidentialEscrow
/// @notice Minimal local reference to the ReineiraOS ConfidentialEscrow surface
///         used by MedYield. Deployed instance on Arbitrum Sepolia:
///         0xC4333F84F5034D8691CB95f068def2e3B6DC60Fa (proxy).
/// @dev MedYield does not call the escrow on-chain from the hub or vault —
///      orgs and users interact with ConfidentialEscrow directly from the
///      frontend. This interface exists so future on-chain adapters and
///      off-chain codegen can share one typed definition.
interface IConfidentialEscrow {
    /// @notice Create a new escrow entry with encrypted owner and amount.
    /// @param encryptedOwner FHE-encrypted recipient address.
    /// @param encryptedAmount FHE-encrypted escrow value (cUSDC units).
    /// @param resolver Condition resolver contract (address(0) for unconditional).
    /// @param resolverData Opaque bytes forwarded to resolver.onConditionSet().
    function create(
        InEaddress calldata encryptedOwner,
        InEuint64 calldata encryptedAmount,
        address resolver,
        bytes calldata resolverData
    ) external returns (uint256 escrowId);

    /// @notice Fund an existing escrow by transferring encrypted cUSDC.
    function fund(uint256 escrowId, InEuint64 calldata encryptedAmount) external;

    /// @notice Attempt redemption. Silent-failure: non-owner gets zero tokens.
    function redeem(uint256 escrowId) external;

    /// @notice Redeem and unwrap to plaintext USDC in one transaction.
    function redeemAndUnwrap(uint256 escrowId, address recipient) external;
}

// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.25;

/// @title HealthDataSchema
/// @notice Shared enums and structs describing a MedYield bounty's data
///         contract: field definitions, lifecycle statuses, and bounty
///         configuration. Imported by the hub, the vault, and every
///         computation template.
enum VaultStatus {
    OPEN,
    COMPUTING,
    COMPLETED,
    EXPIRED,
    CANCELLED
}

enum SubmissionStatus {
    PENDING,
    VALIDATED,
    REJECTED
}

enum FieldType {
    EUINT32,
    EBOOL
}

enum TemplateType {
    AGGREGATE_STATS,
    ELIGIBILITY_SCREENING,
    RISK_SCORING
}

struct FieldDefinition {
    string name;
    FieldType fieldType;
    uint32 minValue;
    uint32 maxValue;
}

struct BountyConfig {
    uint256 pricePerRecord;
    uint256 maxSubmissions;
    uint256 minSubmissions;
    uint256 deadline;
    uint256 templateId;
    bytes templateParams;
    string metadataURI;
}

struct VaultRecord {
    address vault;
    address organization;
    VaultStatus status;
    uint256 totalSubmissions;
    uint256 validatedSubmissions;
    uint256 createdAt;
}

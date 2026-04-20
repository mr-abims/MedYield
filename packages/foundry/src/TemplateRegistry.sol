// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.25;

import {Ownable2Step, Ownable} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {TemplateType} from "./libraries/HealthDataSchema.sol";
import {IComputationTemplate} from "./interfaces/IComputationTemplate.sol";

struct TemplateInfo {
    string name;
    address implementation;
    TemplateType templateType;
    bool active;
}

/// @title TemplateRegistry
/// @notice Owner-curated catalogue of computation templates available to
///         MedYield bounties. Templates are referenced by id and can be
///         activated or deactivated without re-deployment so that buggy
///         implementations can be taken out of rotation.
contract TemplateRegistry is Ownable2Step {
    mapping(uint256 => TemplateInfo) public templates;
    uint256 public templateCount;

    event TemplateRegistered(uint256 indexed templateId, string name, address implementation, TemplateType templateType);
    event TemplateDeactivated(uint256 indexed templateId);
    event TemplateActivated(uint256 indexed templateId);

    constructor() Ownable(msg.sender) {}

    function registerTemplate(
        string calldata name,
        address implementation,
        TemplateType templateType
    ) external onlyOwner returns (uint256 templateId) {
        require(implementation != address(0), "Zero address");
        require(bytes(name).length > 0, "Empty name");

        templateId = templateCount++;
        templates[templateId] = TemplateInfo({
            name: name,
            implementation: implementation,
            templateType: templateType,
            active: true
        });

        emit TemplateRegistered(templateId, name, implementation, templateType);
    }

    function deactivateTemplate(uint256 templateId) external onlyOwner {
        require(templateId < templateCount, "Template does not exist");
        require(templates[templateId].active, "Already inactive");
        templates[templateId].active = false;
        emit TemplateDeactivated(templateId);
    }

    function activateTemplate(uint256 templateId) external onlyOwner {
        require(templateId < templateCount, "Template does not exist");
        require(!templates[templateId].active, "Already active");
        templates[templateId].active = true;
        emit TemplateActivated(templateId);
    }

    function getTemplate(uint256 templateId) external view returns (TemplateInfo memory) {
        require(templateId < templateCount, "Template does not exist");
        return templates[templateId];
    }

    function getActiveTemplate(uint256 templateId) external view returns (TemplateInfo memory info) {
        require(templateId < templateCount, "Template does not exist");
        info = templates[templateId];
        require(info.active, "Template inactive");
    }

    function isActiveTemplate(uint256 templateId) external view returns (bool) {
        if (templateId >= templateCount) return false;
        return templates[templateId].active;
    }
}

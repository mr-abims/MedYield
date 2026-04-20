import {
  createUseReadContract,
  createUseWriteContract,
  createUseSimulateContract,
  createUseWatchContractEvent,
} from 'wagmi/codegen'

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DataVault
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const dataVaultAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: '_bountyId', internalType: 'uint256', type: 'uint256' },
      { name: '_organization', internalType: 'address', type: 'address' },
      { name: '_relayer', internalType: 'address', type: 'address' },
      { name: '_template', internalType: 'address', type: 'address' },
      {
        name: '_schema',
        internalType: 'struct FieldDefinition[]',
        type: 'tuple[]',
        components: [
          { name: 'name', internalType: 'string', type: 'string' },
          { name: 'fieldType', internalType: 'enum FieldType', type: 'uint8' },
          { name: 'minValue', internalType: 'uint32', type: 'uint32' },
          { name: 'maxValue', internalType: 'uint32', type: 'uint32' },
        ],
      },
      {
        name: '_config',
        internalType: 'struct BountyConfig',
        type: 'tuple',
        components: [
          { name: 'pricePerRecord', internalType: 'uint256', type: 'uint256' },
          { name: 'maxSubmissions', internalType: 'uint256', type: 'uint256' },
          { name: 'minSubmissions', internalType: 'uint256', type: 'uint256' },
          { name: 'deadline', internalType: 'uint256', type: 'uint256' },
          { name: 'templateId', internalType: 'uint256', type: 'uint256' },
          { name: 'templateParams', internalType: 'bytes', type: 'bytes' },
          { name: 'metadataURI', internalType: 'string', type: 'string' },
        ],
      },
      { name: '_hub', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'batchCursor',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'boolFieldCount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'bountyId',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'cancel',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'config',
    outputs: [
      { name: 'pricePerRecord', internalType: 'uint256', type: 'uint256' },
      { name: 'maxSubmissions', internalType: 'uint256', type: 'uint256' },
      { name: 'minSubmissions', internalType: 'uint256', type: 'uint256' },
      { name: 'deadline', internalType: 'uint256', type: 'uint256' },
      { name: 'templateId', internalType: 'uint256', type: 'uint256' },
      { name: 'templateParams', internalType: 'bytes', type: 'bytes' },
      { name: 'metadataURI', internalType: 'string', type: 'string' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'submissionId', internalType: 'uint256', type: 'uint256' },
      { name: 'valid', internalType: 'bool', type: 'bool' },
      { name: 'signature', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'confirmSubmission',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'deadline',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'encMaxs',
    outputs: [{ name: '', internalType: 'euint32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'encMins',
    outputs: [{ name: '', internalType: 'euint32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'finalizeComputation',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'resultIndex', internalType: 'uint256', type: 'uint256' }],
    name: 'getResult',
    outputs: [
      { name: 'value', internalType: 'uint32', type: 'uint32' },
      { name: 'ready', internalType: 'bool', type: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getResultCount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getSchemaLength',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'hub',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'submissionId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'isSubmissionValidated',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'numericFieldCount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'organization',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'batchSize', internalType: 'uint256', type: 'uint256' }],
    name: 'processBatch',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'resultIndex', internalType: 'uint256', type: 'uint256' },
      { name: 'plaintext', internalType: 'uint32', type: 'uint32' },
      { name: 'signature', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'publishResult',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'relayer',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'schema',
    outputs: [
      { name: 'name', internalType: 'string', type: 'string' },
      { name: 'fieldType', internalType: 'enum FieldType', type: 'uint8' },
      { name: 'minValue', internalType: 'uint32', type: 'uint32' },
      { name: 'maxValue', internalType: 'uint32', type: 'uint32' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'status',
    outputs: [{ name: '', internalType: 'enum VaultStatus', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'submissionCount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'submissions',
    outputs: [
      { name: 'submitter', internalType: 'address', type: 'address' },
      { name: 'submittedAt', internalType: 'uint256', type: 'uint256' },
      { name: 'status', internalType: 'enum SubmissionStatus', type: 'uint8' },
      { name: 'isValid', internalType: 'ebool', type: 'bytes32' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'numericFields',
        internalType: 'struct InEuint32[]',
        type: 'tuple[]',
        components: [
          { name: 'ctHash', internalType: 'uint256', type: 'uint256' },
          { name: 'securityZone', internalType: 'uint8', type: 'uint8' },
          { name: 'utype', internalType: 'uint8', type: 'uint8' },
          { name: 'signature', internalType: 'bytes', type: 'bytes' },
        ],
      },
      {
        name: 'boolFields',
        internalType: 'struct InEbool[]',
        type: 'tuple[]',
        components: [
          { name: 'ctHash', internalType: 'uint256', type: 'uint256' },
          { name: 'securityZone', internalType: 'uint8', type: 'uint8' },
          { name: 'utype', internalType: 'uint8', type: 'uint8' },
          { name: 'signature', internalType: 'bytes', type: 'bytes' },
        ],
      },
    ],
    name: 'submitData',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'template',
    outputs: [
      {
        name: '',
        internalType: 'contract IComputationTemplate',
        type: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'triggerComputation',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'validatedCount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'batchStart',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'batchEnd',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'ComputationBatchProcessed',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'resultCount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'ComputationCompleted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'timestamp',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'ComputationStarted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'submissionId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'submitter',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'DataSubmitted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'resultIndex',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      { name: 'value', internalType: 'uint32', type: 'uint32', indexed: false },
    ],
    name: 'ResultPublished',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'submissionId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      { name: 'valid', internalType: 'bool', type: 'bool', indexed: false },
    ],
    name: 'SubmissionValidated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'by', internalType: 'address', type: 'address', indexed: true },
    ],
    name: 'VaultCancelled',
  },
  {
    type: 'error',
    inputs: [
      { name: 'got', internalType: 'uint8', type: 'uint8' },
      { name: 'expected', internalType: 'uint8', type: 'uint8' },
    ],
    name: 'InvalidEncryptedInput',
  },
  {
    type: 'error',
    inputs: [{ name: 'value', internalType: 'int32', type: 'int32' }],
    name: 'SecurityZoneOutOfBounds',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// MedYieldConditionResolver
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const medYieldConditionResolverAbi = [
  {
    type: 'constructor',
    inputs: [{ name: '_escrow', internalType: 'address', type: 'address' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'escrowId', internalType: 'uint256', type: 'uint256' }],
    name: 'binding',
    outputs: [
      { name: 'vault', internalType: 'address', type: 'address' },
      { name: 'submissionId', internalType: 'uint256', type: 'uint256' },
      { name: 'set', internalType: 'bool', type: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'escrow',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'escrowId', internalType: 'uint256', type: 'uint256' }],
    name: 'isConditionMet',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'escrowId', internalType: 'uint256', type: 'uint256' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'onConditionSet',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'escrowId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'vault',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'submissionId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'BindingSet',
  },
  { type: 'error', inputs: [], name: 'AlreadyBound' },
  { type: 'error', inputs: [], name: 'NotEscrow' },
  { type: 'error', inputs: [], name: 'ZeroVault' },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// MedYieldHub
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const medYieldHubAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: '_templateRegistry', internalType: 'address', type: 'address' },
      { name: '_vaultDeployer', internalType: 'address', type: 'address' },
      { name: '_relayer', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'acceptOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'bountyCount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'bountyId', internalType: 'uint256', type: 'uint256' }],
    name: 'closeBounty',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'config',
        internalType: 'struct BountyConfig',
        type: 'tuple',
        components: [
          { name: 'pricePerRecord', internalType: 'uint256', type: 'uint256' },
          { name: 'maxSubmissions', internalType: 'uint256', type: 'uint256' },
          { name: 'minSubmissions', internalType: 'uint256', type: 'uint256' },
          { name: 'deadline', internalType: 'uint256', type: 'uint256' },
          { name: 'templateId', internalType: 'uint256', type: 'uint256' },
          { name: 'templateParams', internalType: 'bytes', type: 'bytes' },
          { name: 'metadataURI', internalType: 'string', type: 'string' },
        ],
      },
      {
        name: 'schema',
        internalType: 'struct FieldDefinition[]',
        type: 'tuple[]',
        components: [
          { name: 'name', internalType: 'string', type: 'string' },
          { name: 'fieldType', internalType: 'enum FieldType', type: 'uint8' },
          { name: 'minValue', internalType: 'uint32', type: 'uint32' },
          { name: 'maxValue', internalType: 'uint32', type: 'uint32' },
        ],
      },
    ],
    name: 'createBounty',
    outputs: [{ name: 'bountyId', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'bountyId', internalType: 'uint256', type: 'uint256' }],
    name: 'getVault',
    outputs: [
      {
        name: '',
        internalType: 'struct VaultRecord',
        type: 'tuple',
        components: [
          { name: 'vault', internalType: 'address', type: 'address' },
          { name: 'organization', internalType: 'address', type: 'address' },
          { name: 'status', internalType: 'enum VaultStatus', type: 'uint8' },
          {
            name: 'totalSubmissions',
            internalType: 'uint256',
            type: 'uint256',
          },
          {
            name: 'validatedSubmissions',
            internalType: 'uint256',
            type: 'uint256',
          },
          { name: 'createdAt', internalType: 'uint256', type: 'uint256' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'bountyId', internalType: 'uint256', type: 'uint256' }],
    name: 'onComputationComplete',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'pendingOwner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'relayer',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newRelayer', internalType: 'address', type: 'address' }],
    name: 'setRelayer',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newRegistry', internalType: 'address', type: 'address' }],
    name: 'setTemplateRegistry',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'templateRegistry',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'templateRegistryContract',
    outputs: [
      { name: '', internalType: 'contract TemplateRegistry', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'vaultDeployer',
    outputs: [
      { name: '', internalType: 'contract VaultDeployer', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'bountyId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      { name: 'by', internalType: 'address', type: 'address', indexed: true },
    ],
    name: 'BountyCancelled',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'bountyId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'BountyCompleted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'bountyId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'organization',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'vault',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'BountyCreated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'bountyId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'BountyExpired',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferStarted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferred',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'relayer',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RelayerUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'registry',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'TemplateRegistryUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'bountyId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'vault',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'organization',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'VaultDeployed',
  },
  {
    type: 'error',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'OwnableInvalidOwner',
  },
  {
    type: 'error',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'OwnableUnauthorizedAccount',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// TemplateRegistry
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const templateRegistryAbi = [
  { type: 'constructor', inputs: [], stateMutability: 'nonpayable' },
  {
    type: 'function',
    inputs: [],
    name: 'acceptOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'templateId', internalType: 'uint256', type: 'uint256' }],
    name: 'activateTemplate',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'templateId', internalType: 'uint256', type: 'uint256' }],
    name: 'deactivateTemplate',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'templateId', internalType: 'uint256', type: 'uint256' }],
    name: 'getActiveTemplate',
    outputs: [
      {
        name: 'info',
        internalType: 'struct TemplateInfo',
        type: 'tuple',
        components: [
          { name: 'name', internalType: 'string', type: 'string' },
          { name: 'implementation', internalType: 'address', type: 'address' },
          {
            name: 'templateType',
            internalType: 'enum TemplateType',
            type: 'uint8',
          },
          { name: 'active', internalType: 'bool', type: 'bool' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'templateId', internalType: 'uint256', type: 'uint256' }],
    name: 'getTemplate',
    outputs: [
      {
        name: '',
        internalType: 'struct TemplateInfo',
        type: 'tuple',
        components: [
          { name: 'name', internalType: 'string', type: 'string' },
          { name: 'implementation', internalType: 'address', type: 'address' },
          {
            name: 'templateType',
            internalType: 'enum TemplateType',
            type: 'uint8',
          },
          { name: 'active', internalType: 'bool', type: 'bool' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'templateId', internalType: 'uint256', type: 'uint256' }],
    name: 'isActiveTemplate',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'pendingOwner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'name', internalType: 'string', type: 'string' },
      { name: 'implementation', internalType: 'address', type: 'address' },
      {
        name: 'templateType',
        internalType: 'enum TemplateType',
        type: 'uint8',
      },
    ],
    name: 'registerTemplate',
    outputs: [{ name: 'templateId', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'templateCount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'templates',
    outputs: [
      { name: 'name', internalType: 'string', type: 'string' },
      { name: 'implementation', internalType: 'address', type: 'address' },
      {
        name: 'templateType',
        internalType: 'enum TemplateType',
        type: 'uint8',
      },
      { name: 'active', internalType: 'bool', type: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferStarted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferred',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'templateId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'TemplateActivated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'templateId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'TemplateDeactivated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'templateId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      { name: 'name', internalType: 'string', type: 'string', indexed: false },
      {
        name: 'implementation',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'templateType',
        internalType: 'enum TemplateType',
        type: 'uint8',
        indexed: false,
      },
    ],
    name: 'TemplateRegistered',
  },
  {
    type: 'error',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'OwnableInvalidOwner',
  },
  {
    type: 'error',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'OwnableUnauthorizedAccount',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// VaultDeployer
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const vaultDeployerAbi = [
  {
    type: 'function',
    inputs: [
      { name: 'bountyId', internalType: 'uint256', type: 'uint256' },
      { name: 'organization', internalType: 'address', type: 'address' },
      { name: 'relayer', internalType: 'address', type: 'address' },
      { name: 'template', internalType: 'address', type: 'address' },
      {
        name: 'schema',
        internalType: 'struct FieldDefinition[]',
        type: 'tuple[]',
        components: [
          { name: 'name', internalType: 'string', type: 'string' },
          { name: 'fieldType', internalType: 'enum FieldType', type: 'uint8' },
          { name: 'minValue', internalType: 'uint32', type: 'uint32' },
          { name: 'maxValue', internalType: 'uint32', type: 'uint32' },
        ],
      },
      {
        name: 'config',
        internalType: 'struct BountyConfig',
        type: 'tuple',
        components: [
          { name: 'pricePerRecord', internalType: 'uint256', type: 'uint256' },
          { name: 'maxSubmissions', internalType: 'uint256', type: 'uint256' },
          { name: 'minSubmissions', internalType: 'uint256', type: 'uint256' },
          { name: 'deadline', internalType: 'uint256', type: 'uint256' },
          { name: 'templateId', internalType: 'uint256', type: 'uint256' },
          { name: 'templateParams', internalType: 'bytes', type: 'bytes' },
          { name: 'metadataURI', internalType: 'string', type: 'string' },
        ],
      },
      { name: 'hubArg', internalType: 'address', type: 'address' },
    ],
    name: 'deployVault',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'hub',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_hub', internalType: 'address', type: 'address' }],
    name: 'setHub',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'hub', internalType: 'address', type: 'address', indexed: true },
    ],
    name: 'HubSet',
  },
  { type: 'error', inputs: [], name: 'HubAlreadySet' },
  { type: 'error', inputs: [], name: 'NotHub' },
  { type: 'error', inputs: [], name: 'ZeroHub' },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link dataVaultAbi}__
 */
export const useReadDataVault = /*#__PURE__*/ createUseReadContract({
  abi: dataVaultAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link dataVaultAbi}__ and `functionName` set to `"batchCursor"`
 */
export const useReadDataVaultBatchCursor = /*#__PURE__*/ createUseReadContract({
  abi: dataVaultAbi,
  functionName: 'batchCursor',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link dataVaultAbi}__ and `functionName` set to `"boolFieldCount"`
 */
export const useReadDataVaultBoolFieldCount =
  /*#__PURE__*/ createUseReadContract({
    abi: dataVaultAbi,
    functionName: 'boolFieldCount',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link dataVaultAbi}__ and `functionName` set to `"bountyId"`
 */
export const useReadDataVaultBountyId = /*#__PURE__*/ createUseReadContract({
  abi: dataVaultAbi,
  functionName: 'bountyId',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link dataVaultAbi}__ and `functionName` set to `"config"`
 */
export const useReadDataVaultConfig = /*#__PURE__*/ createUseReadContract({
  abi: dataVaultAbi,
  functionName: 'config',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link dataVaultAbi}__ and `functionName` set to `"deadline"`
 */
export const useReadDataVaultDeadline = /*#__PURE__*/ createUseReadContract({
  abi: dataVaultAbi,
  functionName: 'deadline',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link dataVaultAbi}__ and `functionName` set to `"encMaxs"`
 */
export const useReadDataVaultEncMaxs = /*#__PURE__*/ createUseReadContract({
  abi: dataVaultAbi,
  functionName: 'encMaxs',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link dataVaultAbi}__ and `functionName` set to `"encMins"`
 */
export const useReadDataVaultEncMins = /*#__PURE__*/ createUseReadContract({
  abi: dataVaultAbi,
  functionName: 'encMins',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link dataVaultAbi}__ and `functionName` set to `"getResult"`
 */
export const useReadDataVaultGetResult = /*#__PURE__*/ createUseReadContract({
  abi: dataVaultAbi,
  functionName: 'getResult',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link dataVaultAbi}__ and `functionName` set to `"getResultCount"`
 */
export const useReadDataVaultGetResultCount =
  /*#__PURE__*/ createUseReadContract({
    abi: dataVaultAbi,
    functionName: 'getResultCount',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link dataVaultAbi}__ and `functionName` set to `"getSchemaLength"`
 */
export const useReadDataVaultGetSchemaLength =
  /*#__PURE__*/ createUseReadContract({
    abi: dataVaultAbi,
    functionName: 'getSchemaLength',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link dataVaultAbi}__ and `functionName` set to `"hub"`
 */
export const useReadDataVaultHub = /*#__PURE__*/ createUseReadContract({
  abi: dataVaultAbi,
  functionName: 'hub',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link dataVaultAbi}__ and `functionName` set to `"isSubmissionValidated"`
 */
export const useReadDataVaultIsSubmissionValidated =
  /*#__PURE__*/ createUseReadContract({
    abi: dataVaultAbi,
    functionName: 'isSubmissionValidated',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link dataVaultAbi}__ and `functionName` set to `"numericFieldCount"`
 */
export const useReadDataVaultNumericFieldCount =
  /*#__PURE__*/ createUseReadContract({
    abi: dataVaultAbi,
    functionName: 'numericFieldCount',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link dataVaultAbi}__ and `functionName` set to `"organization"`
 */
export const useReadDataVaultOrganization = /*#__PURE__*/ createUseReadContract(
  { abi: dataVaultAbi, functionName: 'organization' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link dataVaultAbi}__ and `functionName` set to `"relayer"`
 */
export const useReadDataVaultRelayer = /*#__PURE__*/ createUseReadContract({
  abi: dataVaultAbi,
  functionName: 'relayer',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link dataVaultAbi}__ and `functionName` set to `"schema"`
 */
export const useReadDataVaultSchema = /*#__PURE__*/ createUseReadContract({
  abi: dataVaultAbi,
  functionName: 'schema',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link dataVaultAbi}__ and `functionName` set to `"status"`
 */
export const useReadDataVaultStatus = /*#__PURE__*/ createUseReadContract({
  abi: dataVaultAbi,
  functionName: 'status',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link dataVaultAbi}__ and `functionName` set to `"submissionCount"`
 */
export const useReadDataVaultSubmissionCount =
  /*#__PURE__*/ createUseReadContract({
    abi: dataVaultAbi,
    functionName: 'submissionCount',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link dataVaultAbi}__ and `functionName` set to `"submissions"`
 */
export const useReadDataVaultSubmissions = /*#__PURE__*/ createUseReadContract({
  abi: dataVaultAbi,
  functionName: 'submissions',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link dataVaultAbi}__ and `functionName` set to `"template"`
 */
export const useReadDataVaultTemplate = /*#__PURE__*/ createUseReadContract({
  abi: dataVaultAbi,
  functionName: 'template',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link dataVaultAbi}__ and `functionName` set to `"validatedCount"`
 */
export const useReadDataVaultValidatedCount =
  /*#__PURE__*/ createUseReadContract({
    abi: dataVaultAbi,
    functionName: 'validatedCount',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link dataVaultAbi}__
 */
export const useWriteDataVault = /*#__PURE__*/ createUseWriteContract({
  abi: dataVaultAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link dataVaultAbi}__ and `functionName` set to `"cancel"`
 */
export const useWriteDataVaultCancel = /*#__PURE__*/ createUseWriteContract({
  abi: dataVaultAbi,
  functionName: 'cancel',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link dataVaultAbi}__ and `functionName` set to `"confirmSubmission"`
 */
export const useWriteDataVaultConfirmSubmission =
  /*#__PURE__*/ createUseWriteContract({
    abi: dataVaultAbi,
    functionName: 'confirmSubmission',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link dataVaultAbi}__ and `functionName` set to `"finalizeComputation"`
 */
export const useWriteDataVaultFinalizeComputation =
  /*#__PURE__*/ createUseWriteContract({
    abi: dataVaultAbi,
    functionName: 'finalizeComputation',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link dataVaultAbi}__ and `functionName` set to `"processBatch"`
 */
export const useWriteDataVaultProcessBatch =
  /*#__PURE__*/ createUseWriteContract({
    abi: dataVaultAbi,
    functionName: 'processBatch',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link dataVaultAbi}__ and `functionName` set to `"publishResult"`
 */
export const useWriteDataVaultPublishResult =
  /*#__PURE__*/ createUseWriteContract({
    abi: dataVaultAbi,
    functionName: 'publishResult',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link dataVaultAbi}__ and `functionName` set to `"submitData"`
 */
export const useWriteDataVaultSubmitData = /*#__PURE__*/ createUseWriteContract(
  { abi: dataVaultAbi, functionName: 'submitData' },
)

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link dataVaultAbi}__ and `functionName` set to `"triggerComputation"`
 */
export const useWriteDataVaultTriggerComputation =
  /*#__PURE__*/ createUseWriteContract({
    abi: dataVaultAbi,
    functionName: 'triggerComputation',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link dataVaultAbi}__
 */
export const useSimulateDataVault = /*#__PURE__*/ createUseSimulateContract({
  abi: dataVaultAbi,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link dataVaultAbi}__ and `functionName` set to `"cancel"`
 */
export const useSimulateDataVaultCancel =
  /*#__PURE__*/ createUseSimulateContract({
    abi: dataVaultAbi,
    functionName: 'cancel',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link dataVaultAbi}__ and `functionName` set to `"confirmSubmission"`
 */
export const useSimulateDataVaultConfirmSubmission =
  /*#__PURE__*/ createUseSimulateContract({
    abi: dataVaultAbi,
    functionName: 'confirmSubmission',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link dataVaultAbi}__ and `functionName` set to `"finalizeComputation"`
 */
export const useSimulateDataVaultFinalizeComputation =
  /*#__PURE__*/ createUseSimulateContract({
    abi: dataVaultAbi,
    functionName: 'finalizeComputation',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link dataVaultAbi}__ and `functionName` set to `"processBatch"`
 */
export const useSimulateDataVaultProcessBatch =
  /*#__PURE__*/ createUseSimulateContract({
    abi: dataVaultAbi,
    functionName: 'processBatch',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link dataVaultAbi}__ and `functionName` set to `"publishResult"`
 */
export const useSimulateDataVaultPublishResult =
  /*#__PURE__*/ createUseSimulateContract({
    abi: dataVaultAbi,
    functionName: 'publishResult',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link dataVaultAbi}__ and `functionName` set to `"submitData"`
 */
export const useSimulateDataVaultSubmitData =
  /*#__PURE__*/ createUseSimulateContract({
    abi: dataVaultAbi,
    functionName: 'submitData',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link dataVaultAbi}__ and `functionName` set to `"triggerComputation"`
 */
export const useSimulateDataVaultTriggerComputation =
  /*#__PURE__*/ createUseSimulateContract({
    abi: dataVaultAbi,
    functionName: 'triggerComputation',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link dataVaultAbi}__
 */
export const useWatchDataVaultEvent = /*#__PURE__*/ createUseWatchContractEvent(
  { abi: dataVaultAbi },
)

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link dataVaultAbi}__ and `eventName` set to `"ComputationBatchProcessed"`
 */
export const useWatchDataVaultComputationBatchProcessedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: dataVaultAbi,
    eventName: 'ComputationBatchProcessed',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link dataVaultAbi}__ and `eventName` set to `"ComputationCompleted"`
 */
export const useWatchDataVaultComputationCompletedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: dataVaultAbi,
    eventName: 'ComputationCompleted',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link dataVaultAbi}__ and `eventName` set to `"ComputationStarted"`
 */
export const useWatchDataVaultComputationStartedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: dataVaultAbi,
    eventName: 'ComputationStarted',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link dataVaultAbi}__ and `eventName` set to `"DataSubmitted"`
 */
export const useWatchDataVaultDataSubmittedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: dataVaultAbi,
    eventName: 'DataSubmitted',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link dataVaultAbi}__ and `eventName` set to `"ResultPublished"`
 */
export const useWatchDataVaultResultPublishedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: dataVaultAbi,
    eventName: 'ResultPublished',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link dataVaultAbi}__ and `eventName` set to `"SubmissionValidated"`
 */
export const useWatchDataVaultSubmissionValidatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: dataVaultAbi,
    eventName: 'SubmissionValidated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link dataVaultAbi}__ and `eventName` set to `"VaultCancelled"`
 */
export const useWatchDataVaultVaultCancelledEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: dataVaultAbi,
    eventName: 'VaultCancelled',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link medYieldConditionResolverAbi}__
 */
export const useReadMedYieldConditionResolver =
  /*#__PURE__*/ createUseReadContract({ abi: medYieldConditionResolverAbi })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link medYieldConditionResolverAbi}__ and `functionName` set to `"binding"`
 */
export const useReadMedYieldConditionResolverBinding =
  /*#__PURE__*/ createUseReadContract({
    abi: medYieldConditionResolverAbi,
    functionName: 'binding',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link medYieldConditionResolverAbi}__ and `functionName` set to `"escrow"`
 */
export const useReadMedYieldConditionResolverEscrow =
  /*#__PURE__*/ createUseReadContract({
    abi: medYieldConditionResolverAbi,
    functionName: 'escrow',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link medYieldConditionResolverAbi}__ and `functionName` set to `"isConditionMet"`
 */
export const useReadMedYieldConditionResolverIsConditionMet =
  /*#__PURE__*/ createUseReadContract({
    abi: medYieldConditionResolverAbi,
    functionName: 'isConditionMet',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link medYieldConditionResolverAbi}__ and `functionName` set to `"supportsInterface"`
 */
export const useReadMedYieldConditionResolverSupportsInterface =
  /*#__PURE__*/ createUseReadContract({
    abi: medYieldConditionResolverAbi,
    functionName: 'supportsInterface',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link medYieldConditionResolverAbi}__
 */
export const useWriteMedYieldConditionResolver =
  /*#__PURE__*/ createUseWriteContract({ abi: medYieldConditionResolverAbi })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link medYieldConditionResolverAbi}__ and `functionName` set to `"onConditionSet"`
 */
export const useWriteMedYieldConditionResolverOnConditionSet =
  /*#__PURE__*/ createUseWriteContract({
    abi: medYieldConditionResolverAbi,
    functionName: 'onConditionSet',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link medYieldConditionResolverAbi}__
 */
export const useSimulateMedYieldConditionResolver =
  /*#__PURE__*/ createUseSimulateContract({ abi: medYieldConditionResolverAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link medYieldConditionResolverAbi}__ and `functionName` set to `"onConditionSet"`
 */
export const useSimulateMedYieldConditionResolverOnConditionSet =
  /*#__PURE__*/ createUseSimulateContract({
    abi: medYieldConditionResolverAbi,
    functionName: 'onConditionSet',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link medYieldConditionResolverAbi}__
 */
export const useWatchMedYieldConditionResolverEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: medYieldConditionResolverAbi,
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link medYieldConditionResolverAbi}__ and `eventName` set to `"BindingSet"`
 */
export const useWatchMedYieldConditionResolverBindingSetEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: medYieldConditionResolverAbi,
    eventName: 'BindingSet',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link medYieldHubAbi}__
 */
export const useReadMedYieldHub = /*#__PURE__*/ createUseReadContract({
  abi: medYieldHubAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link medYieldHubAbi}__ and `functionName` set to `"bountyCount"`
 */
export const useReadMedYieldHubBountyCount =
  /*#__PURE__*/ createUseReadContract({
    abi: medYieldHubAbi,
    functionName: 'bountyCount',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link medYieldHubAbi}__ and `functionName` set to `"getVault"`
 */
export const useReadMedYieldHubGetVault = /*#__PURE__*/ createUseReadContract({
  abi: medYieldHubAbi,
  functionName: 'getVault',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link medYieldHubAbi}__ and `functionName` set to `"owner"`
 */
export const useReadMedYieldHubOwner = /*#__PURE__*/ createUseReadContract({
  abi: medYieldHubAbi,
  functionName: 'owner',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link medYieldHubAbi}__ and `functionName` set to `"pendingOwner"`
 */
export const useReadMedYieldHubPendingOwner =
  /*#__PURE__*/ createUseReadContract({
    abi: medYieldHubAbi,
    functionName: 'pendingOwner',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link medYieldHubAbi}__ and `functionName` set to `"relayer"`
 */
export const useReadMedYieldHubRelayer = /*#__PURE__*/ createUseReadContract({
  abi: medYieldHubAbi,
  functionName: 'relayer',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link medYieldHubAbi}__ and `functionName` set to `"templateRegistry"`
 */
export const useReadMedYieldHubTemplateRegistry =
  /*#__PURE__*/ createUseReadContract({
    abi: medYieldHubAbi,
    functionName: 'templateRegistry',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link medYieldHubAbi}__ and `functionName` set to `"templateRegistryContract"`
 */
export const useReadMedYieldHubTemplateRegistryContract =
  /*#__PURE__*/ createUseReadContract({
    abi: medYieldHubAbi,
    functionName: 'templateRegistryContract',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link medYieldHubAbi}__ and `functionName` set to `"vaultDeployer"`
 */
export const useReadMedYieldHubVaultDeployer =
  /*#__PURE__*/ createUseReadContract({
    abi: medYieldHubAbi,
    functionName: 'vaultDeployer',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link medYieldHubAbi}__
 */
export const useWriteMedYieldHub = /*#__PURE__*/ createUseWriteContract({
  abi: medYieldHubAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link medYieldHubAbi}__ and `functionName` set to `"acceptOwnership"`
 */
export const useWriteMedYieldHubAcceptOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: medYieldHubAbi,
    functionName: 'acceptOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link medYieldHubAbi}__ and `functionName` set to `"closeBounty"`
 */
export const useWriteMedYieldHubCloseBounty =
  /*#__PURE__*/ createUseWriteContract({
    abi: medYieldHubAbi,
    functionName: 'closeBounty',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link medYieldHubAbi}__ and `functionName` set to `"createBounty"`
 */
export const useWriteMedYieldHubCreateBounty =
  /*#__PURE__*/ createUseWriteContract({
    abi: medYieldHubAbi,
    functionName: 'createBounty',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link medYieldHubAbi}__ and `functionName` set to `"onComputationComplete"`
 */
export const useWriteMedYieldHubOnComputationComplete =
  /*#__PURE__*/ createUseWriteContract({
    abi: medYieldHubAbi,
    functionName: 'onComputationComplete',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link medYieldHubAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useWriteMedYieldHubRenounceOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: medYieldHubAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link medYieldHubAbi}__ and `functionName` set to `"setRelayer"`
 */
export const useWriteMedYieldHubSetRelayer =
  /*#__PURE__*/ createUseWriteContract({
    abi: medYieldHubAbi,
    functionName: 'setRelayer',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link medYieldHubAbi}__ and `functionName` set to `"setTemplateRegistry"`
 */
export const useWriteMedYieldHubSetTemplateRegistry =
  /*#__PURE__*/ createUseWriteContract({
    abi: medYieldHubAbi,
    functionName: 'setTemplateRegistry',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link medYieldHubAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useWriteMedYieldHubTransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: medYieldHubAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link medYieldHubAbi}__
 */
export const useSimulateMedYieldHub = /*#__PURE__*/ createUseSimulateContract({
  abi: medYieldHubAbi,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link medYieldHubAbi}__ and `functionName` set to `"acceptOwnership"`
 */
export const useSimulateMedYieldHubAcceptOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: medYieldHubAbi,
    functionName: 'acceptOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link medYieldHubAbi}__ and `functionName` set to `"closeBounty"`
 */
export const useSimulateMedYieldHubCloseBounty =
  /*#__PURE__*/ createUseSimulateContract({
    abi: medYieldHubAbi,
    functionName: 'closeBounty',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link medYieldHubAbi}__ and `functionName` set to `"createBounty"`
 */
export const useSimulateMedYieldHubCreateBounty =
  /*#__PURE__*/ createUseSimulateContract({
    abi: medYieldHubAbi,
    functionName: 'createBounty',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link medYieldHubAbi}__ and `functionName` set to `"onComputationComplete"`
 */
export const useSimulateMedYieldHubOnComputationComplete =
  /*#__PURE__*/ createUseSimulateContract({
    abi: medYieldHubAbi,
    functionName: 'onComputationComplete',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link medYieldHubAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useSimulateMedYieldHubRenounceOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: medYieldHubAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link medYieldHubAbi}__ and `functionName` set to `"setRelayer"`
 */
export const useSimulateMedYieldHubSetRelayer =
  /*#__PURE__*/ createUseSimulateContract({
    abi: medYieldHubAbi,
    functionName: 'setRelayer',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link medYieldHubAbi}__ and `functionName` set to `"setTemplateRegistry"`
 */
export const useSimulateMedYieldHubSetTemplateRegistry =
  /*#__PURE__*/ createUseSimulateContract({
    abi: medYieldHubAbi,
    functionName: 'setTemplateRegistry',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link medYieldHubAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useSimulateMedYieldHubTransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: medYieldHubAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link medYieldHubAbi}__
 */
export const useWatchMedYieldHubEvent =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: medYieldHubAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link medYieldHubAbi}__ and `eventName` set to `"BountyCancelled"`
 */
export const useWatchMedYieldHubBountyCancelledEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: medYieldHubAbi,
    eventName: 'BountyCancelled',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link medYieldHubAbi}__ and `eventName` set to `"BountyCompleted"`
 */
export const useWatchMedYieldHubBountyCompletedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: medYieldHubAbi,
    eventName: 'BountyCompleted',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link medYieldHubAbi}__ and `eventName` set to `"BountyCreated"`
 */
export const useWatchMedYieldHubBountyCreatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: medYieldHubAbi,
    eventName: 'BountyCreated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link medYieldHubAbi}__ and `eventName` set to `"BountyExpired"`
 */
export const useWatchMedYieldHubBountyExpiredEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: medYieldHubAbi,
    eventName: 'BountyExpired',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link medYieldHubAbi}__ and `eventName` set to `"OwnershipTransferStarted"`
 */
export const useWatchMedYieldHubOwnershipTransferStartedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: medYieldHubAbi,
    eventName: 'OwnershipTransferStarted',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link medYieldHubAbi}__ and `eventName` set to `"OwnershipTransferred"`
 */
export const useWatchMedYieldHubOwnershipTransferredEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: medYieldHubAbi,
    eventName: 'OwnershipTransferred',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link medYieldHubAbi}__ and `eventName` set to `"RelayerUpdated"`
 */
export const useWatchMedYieldHubRelayerUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: medYieldHubAbi,
    eventName: 'RelayerUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link medYieldHubAbi}__ and `eventName` set to `"TemplateRegistryUpdated"`
 */
export const useWatchMedYieldHubTemplateRegistryUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: medYieldHubAbi,
    eventName: 'TemplateRegistryUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link medYieldHubAbi}__ and `eventName` set to `"VaultDeployed"`
 */
export const useWatchMedYieldHubVaultDeployedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: medYieldHubAbi,
    eventName: 'VaultDeployed',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link templateRegistryAbi}__
 */
export const useReadTemplateRegistry = /*#__PURE__*/ createUseReadContract({
  abi: templateRegistryAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link templateRegistryAbi}__ and `functionName` set to `"getActiveTemplate"`
 */
export const useReadTemplateRegistryGetActiveTemplate =
  /*#__PURE__*/ createUseReadContract({
    abi: templateRegistryAbi,
    functionName: 'getActiveTemplate',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link templateRegistryAbi}__ and `functionName` set to `"getTemplate"`
 */
export const useReadTemplateRegistryGetTemplate =
  /*#__PURE__*/ createUseReadContract({
    abi: templateRegistryAbi,
    functionName: 'getTemplate',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link templateRegistryAbi}__ and `functionName` set to `"isActiveTemplate"`
 */
export const useReadTemplateRegistryIsActiveTemplate =
  /*#__PURE__*/ createUseReadContract({
    abi: templateRegistryAbi,
    functionName: 'isActiveTemplate',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link templateRegistryAbi}__ and `functionName` set to `"owner"`
 */
export const useReadTemplateRegistryOwner = /*#__PURE__*/ createUseReadContract(
  { abi: templateRegistryAbi, functionName: 'owner' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link templateRegistryAbi}__ and `functionName` set to `"pendingOwner"`
 */
export const useReadTemplateRegistryPendingOwner =
  /*#__PURE__*/ createUseReadContract({
    abi: templateRegistryAbi,
    functionName: 'pendingOwner',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link templateRegistryAbi}__ and `functionName` set to `"templateCount"`
 */
export const useReadTemplateRegistryTemplateCount =
  /*#__PURE__*/ createUseReadContract({
    abi: templateRegistryAbi,
    functionName: 'templateCount',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link templateRegistryAbi}__ and `functionName` set to `"templates"`
 */
export const useReadTemplateRegistryTemplates =
  /*#__PURE__*/ createUseReadContract({
    abi: templateRegistryAbi,
    functionName: 'templates',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link templateRegistryAbi}__
 */
export const useWriteTemplateRegistry = /*#__PURE__*/ createUseWriteContract({
  abi: templateRegistryAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link templateRegistryAbi}__ and `functionName` set to `"acceptOwnership"`
 */
export const useWriteTemplateRegistryAcceptOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: templateRegistryAbi,
    functionName: 'acceptOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link templateRegistryAbi}__ and `functionName` set to `"activateTemplate"`
 */
export const useWriteTemplateRegistryActivateTemplate =
  /*#__PURE__*/ createUseWriteContract({
    abi: templateRegistryAbi,
    functionName: 'activateTemplate',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link templateRegistryAbi}__ and `functionName` set to `"deactivateTemplate"`
 */
export const useWriteTemplateRegistryDeactivateTemplate =
  /*#__PURE__*/ createUseWriteContract({
    abi: templateRegistryAbi,
    functionName: 'deactivateTemplate',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link templateRegistryAbi}__ and `functionName` set to `"registerTemplate"`
 */
export const useWriteTemplateRegistryRegisterTemplate =
  /*#__PURE__*/ createUseWriteContract({
    abi: templateRegistryAbi,
    functionName: 'registerTemplate',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link templateRegistryAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useWriteTemplateRegistryRenounceOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: templateRegistryAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link templateRegistryAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useWriteTemplateRegistryTransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: templateRegistryAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link templateRegistryAbi}__
 */
export const useSimulateTemplateRegistry =
  /*#__PURE__*/ createUseSimulateContract({ abi: templateRegistryAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link templateRegistryAbi}__ and `functionName` set to `"acceptOwnership"`
 */
export const useSimulateTemplateRegistryAcceptOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: templateRegistryAbi,
    functionName: 'acceptOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link templateRegistryAbi}__ and `functionName` set to `"activateTemplate"`
 */
export const useSimulateTemplateRegistryActivateTemplate =
  /*#__PURE__*/ createUseSimulateContract({
    abi: templateRegistryAbi,
    functionName: 'activateTemplate',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link templateRegistryAbi}__ and `functionName` set to `"deactivateTemplate"`
 */
export const useSimulateTemplateRegistryDeactivateTemplate =
  /*#__PURE__*/ createUseSimulateContract({
    abi: templateRegistryAbi,
    functionName: 'deactivateTemplate',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link templateRegistryAbi}__ and `functionName` set to `"registerTemplate"`
 */
export const useSimulateTemplateRegistryRegisterTemplate =
  /*#__PURE__*/ createUseSimulateContract({
    abi: templateRegistryAbi,
    functionName: 'registerTemplate',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link templateRegistryAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useSimulateTemplateRegistryRenounceOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: templateRegistryAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link templateRegistryAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useSimulateTemplateRegistryTransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: templateRegistryAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link templateRegistryAbi}__
 */
export const useWatchTemplateRegistryEvent =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: templateRegistryAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link templateRegistryAbi}__ and `eventName` set to `"OwnershipTransferStarted"`
 */
export const useWatchTemplateRegistryOwnershipTransferStartedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: templateRegistryAbi,
    eventName: 'OwnershipTransferStarted',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link templateRegistryAbi}__ and `eventName` set to `"OwnershipTransferred"`
 */
export const useWatchTemplateRegistryOwnershipTransferredEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: templateRegistryAbi,
    eventName: 'OwnershipTransferred',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link templateRegistryAbi}__ and `eventName` set to `"TemplateActivated"`
 */
export const useWatchTemplateRegistryTemplateActivatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: templateRegistryAbi,
    eventName: 'TemplateActivated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link templateRegistryAbi}__ and `eventName` set to `"TemplateDeactivated"`
 */
export const useWatchTemplateRegistryTemplateDeactivatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: templateRegistryAbi,
    eventName: 'TemplateDeactivated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link templateRegistryAbi}__ and `eventName` set to `"TemplateRegistered"`
 */
export const useWatchTemplateRegistryTemplateRegisteredEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: templateRegistryAbi,
    eventName: 'TemplateRegistered',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link vaultDeployerAbi}__
 */
export const useReadVaultDeployer = /*#__PURE__*/ createUseReadContract({
  abi: vaultDeployerAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link vaultDeployerAbi}__ and `functionName` set to `"hub"`
 */
export const useReadVaultDeployerHub = /*#__PURE__*/ createUseReadContract({
  abi: vaultDeployerAbi,
  functionName: 'hub',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link vaultDeployerAbi}__
 */
export const useWriteVaultDeployer = /*#__PURE__*/ createUseWriteContract({
  abi: vaultDeployerAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link vaultDeployerAbi}__ and `functionName` set to `"deployVault"`
 */
export const useWriteVaultDeployerDeployVault =
  /*#__PURE__*/ createUseWriteContract({
    abi: vaultDeployerAbi,
    functionName: 'deployVault',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link vaultDeployerAbi}__ and `functionName` set to `"setHub"`
 */
export const useWriteVaultDeployerSetHub = /*#__PURE__*/ createUseWriteContract(
  { abi: vaultDeployerAbi, functionName: 'setHub' },
)

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link vaultDeployerAbi}__
 */
export const useSimulateVaultDeployer = /*#__PURE__*/ createUseSimulateContract(
  { abi: vaultDeployerAbi },
)

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link vaultDeployerAbi}__ and `functionName` set to `"deployVault"`
 */
export const useSimulateVaultDeployerDeployVault =
  /*#__PURE__*/ createUseSimulateContract({
    abi: vaultDeployerAbi,
    functionName: 'deployVault',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link vaultDeployerAbi}__ and `functionName` set to `"setHub"`
 */
export const useSimulateVaultDeployerSetHub =
  /*#__PURE__*/ createUseSimulateContract({
    abi: vaultDeployerAbi,
    functionName: 'setHub',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link vaultDeployerAbi}__
 */
export const useWatchVaultDeployerEvent =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: vaultDeployerAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link vaultDeployerAbi}__ and `eventName` set to `"HubSet"`
 */
export const useWatchVaultDeployerHubSetEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: vaultDeployerAbi,
    eventName: 'HubSet',
  })

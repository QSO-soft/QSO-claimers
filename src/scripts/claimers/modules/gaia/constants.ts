import { getAddress, Hex } from 'viem';

export const CLAIM_CONTRACT: Hex = getAddress('0x8a2725a6f04816a5274ddd9feadd3bd0c253c1a6');
export const TOKEN_CONTRACT: Hex = getAddress('0x2EE7097BfdD98fCE2AC08A1896038a7cd9aaEd81');

export const ABI = [
  {
    inputs: [
      {
        internalType: 'address payable',
        name: '_treasury',
        type: 'address',
      },
      {
        internalType: 'string',
        name: 'name',
        type: 'string',
      },
      {
        internalType: 'string',
        name: 'version',
        type: 'string',
      },
      {
        internalType: 'address[]',
        name: '_tokenLockups',
        type: 'address[]',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [],
    name: 'ECDSAInvalidSignature',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'length',
        type: 'uint256',
      },
    ],
    name: 'ECDSAInvalidSignatureLength',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 's',
        type: 'bytes32',
      },
    ],
    name: 'ECDSAInvalidSignatureS',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'currentNonce',
        type: 'uint256',
      },
    ],
    name: 'InvalidAccountNonce',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidShortString',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ReentrancyGuardReentrantCall',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'token',
        type: 'address',
      },
    ],
    name: 'SafeERC20FailedOperation',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: 'str',
        type: 'string',
      },
    ],
    name: 'StringTooLong',
    type: 'error',
  },
  {
    anonymous: !1,
    inputs: [
      {
        indexed: !0,
        internalType: 'bytes16',
        name: 'id',
        type: 'bytes16',
      },
    ],
    name: 'CampaignCancelled',
    type: 'event',
  },
  {
    anonymous: !1,
    inputs: [
      {
        indexed: !0,
        internalType: 'bytes16',
        name: 'id',
        type: 'bytes16',
      },
      {
        components: [
          {
            internalType: 'address',
            name: 'manager',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'token',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'amount',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'start',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'end',
            type: 'uint256',
          },
          {
            internalType: 'enum ClaimCampaigns.TokenLockup',
            name: 'tokenLockup',
            type: 'uint8',
          },
          {
            internalType: 'bytes32',
            name: 'root',
            type: 'bytes32',
          },
          {
            internalType: 'bool',
            name: 'delegating',
            type: 'bool',
          },
        ],
        indexed: !1,
        internalType: 'struct ClaimCampaigns.Campaign',
        name: 'campaign',
        type: 'tuple',
      },
      {
        indexed: !1,
        internalType: 'uint256',
        name: 'totalClaimers',
        type: 'uint256',
      },
    ],
    name: 'CampaignStarted',
    type: 'event',
  },
  {
    anonymous: !1,
    inputs: [
      {
        indexed: !0,
        internalType: 'bytes16',
        name: 'id',
        type: 'bytes16',
      },
      {
        components: [
          {
            internalType: 'address',
            name: 'tokenLocker',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'start',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'cliff',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'period',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'periods',
            type: 'uint256',
          },
        ],
        indexed: !1,
        internalType: 'struct ClaimCampaigns.ClaimLockup',
        name: 'claimLockup',
        type: 'tuple',
      },
    ],
    name: 'ClaimLockupCreated',
    type: 'event',
  },
  {
    anonymous: !1,
    inputs: [
      {
        indexed: !0,
        internalType: 'address',
        name: 'recipient',
        type: 'address',
      },
      {
        indexed: !0,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'Claimed',
    type: 'event',
  },
  {
    anonymous: !1,
    inputs: [],
    name: 'EIP712DomainChanged',
    type: 'event',
  },
  {
    anonymous: !1,
    inputs: [
      {
        indexed: !0,
        internalType: 'bytes16',
        name: 'id',
        type: 'bytes16',
      },
      {
        indexed: !0,
        internalType: 'address',
        name: 'claimer',
        type: 'address',
      },
      {
        indexed: !0,
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
      {
        indexed: !1,
        internalType: 'uint256',
        name: 'amountClaimed',
        type: 'uint256',
      },
      {
        indexed: !1,
        internalType: 'uint256',
        name: 'amountRemaining',
        type: 'uint256',
      },
    ],
    name: 'LockedTokensClaimed',
    type: 'event',
  },
  {
    anonymous: !1,
    inputs: [
      {
        indexed: !0,
        internalType: 'bytes16',
        name: 'id',
        type: 'bytes16',
      },
      {
        indexed: !0,
        internalType: 'address',
        name: 'claimer',
        type: 'address',
      },
      {
        indexed: !1,
        internalType: 'uint256',
        name: 'amountClaimed',
        type: 'uint256',
      },
      {
        indexed: !1,
        internalType: 'uint256',
        name: 'amountRemaining',
        type: 'uint256',
      },
    ],
    name: 'UnlockedTokensClaimed',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'bytes16',
        name: '',
        type: 'bytes16',
      },
    ],
    name: 'campaigns',
    outputs: [
      {
        internalType: 'address',
        name: 'manager',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'token',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'start',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'end',
        type: 'uint256',
      },
      {
        internalType: 'enum ClaimCampaigns.TokenLockup',
        name: 'tokenLockup',
        type: 'uint8',
      },
      {
        internalType: 'bytes32',
        name: 'root',
        type: 'bytes32',
      },
      {
        internalType: 'bool',
        name: 'delegating',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes16[]',
        name: 'campaignIds',
        type: 'bytes16[]',
      },
    ],
    name: 'cancelCampaigns',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address payable',
        name: '_newTreasury',
        type: 'address',
      },
    ],
    name: 'changeTreasury',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes16',
        name: 'campaignId',
        type: 'bytes16',
      },
      {
        internalType: 'bytes32[]',
        name: 'proof',
        type: 'bytes32[]',
      },
      {
        internalType: 'uint256',
        name: 'claimAmount',
        type: 'uint256',
      },
    ],
    name: 'claim',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes16',
        name: 'campaignId',
        type: 'bytes16',
      },
      {
        internalType: 'bytes32[]',
        name: 'proof',
        type: 'bytes32[]',
      },
      {
        internalType: 'uint256',
        name: 'claimAmount',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'delegatee',
        type: 'address',
      },
      {
        components: [
          {
            internalType: 'uint256',
            name: 'nonce',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'expiry',
            type: 'uint256',
          },
          {
            internalType: 'uint8',
            name: 'v',
            type: 'uint8',
          },
          {
            internalType: 'bytes32',
            name: 'r',
            type: 'bytes32',
          },
          {
            internalType: 'bytes32',
            name: 's',
            type: 'bytes32',
          },
        ],
        internalType: 'struct ClaimCampaigns.SignatureParams',
        name: 'delegationSignature',
        type: 'tuple',
      },
    ],
    name: 'claimAndDelegate',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes16[]',
        name: 'campaignIds',
        type: 'bytes16[]',
      },
      {
        internalType: 'bytes32[][]',
        name: 'proofs',
        type: 'bytes32[][]',
      },
      {
        internalType: 'uint256[]',
        name: 'claimAmounts',
        type: 'uint256[]',
      },
      {
        internalType: 'address[]',
        name: 'delegatees',
        type: 'address[]',
      },
      {
        components: [
          {
            internalType: 'uint256',
            name: 'nonce',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'expiry',
            type: 'uint256',
          },
          {
            internalType: 'uint8',
            name: 'v',
            type: 'uint8',
          },
          {
            internalType: 'bytes32',
            name: 'r',
            type: 'bytes32',
          },
          {
            internalType: 'bytes32',
            name: 's',
            type: 'bytes32',
          },
        ],
        internalType: 'struct ClaimCampaigns.SignatureParams[]',
        name: 'delegationSignatures',
        type: 'tuple[]',
      },
    ],
    name: 'claimAndDelegateMultiple',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes16',
        name: 'campaignId',
        type: 'bytes16',
      },
      {
        internalType: 'bytes32[]',
        name: 'proof',
        type: 'bytes32[]',
      },
      {
        internalType: 'address',
        name: 'claimer',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'claimAmount',
        type: 'uint256',
      },
      {
        components: [
          {
            internalType: 'uint256',
            name: 'nonce',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'expiry',
            type: 'uint256',
          },
          {
            internalType: 'uint8',
            name: 'v',
            type: 'uint8',
          },
          {
            internalType: 'bytes32',
            name: 'r',
            type: 'bytes32',
          },
          {
            internalType: 'bytes32',
            name: 's',
            type: 'bytes32',
          },
        ],
        internalType: 'struct ClaimCampaigns.SignatureParams',
        name: 'claimSignature',
        type: 'tuple',
      },
      {
        internalType: 'address',
        name: 'delegatee',
        type: 'address',
      },
      {
        components: [
          {
            internalType: 'uint256',
            name: 'nonce',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'expiry',
            type: 'uint256',
          },
          {
            internalType: 'uint8',
            name: 'v',
            type: 'uint8',
          },
          {
            internalType: 'bytes32',
            name: 'r',
            type: 'bytes32',
          },
          {
            internalType: 'bytes32',
            name: 's',
            type: 'bytes32',
          },
        ],
        internalType: 'struct ClaimCampaigns.SignatureParams',
        name: 'delegationSignature',
        type: 'tuple',
      },
    ],
    name: 'claimAndDelegateWithSig',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes16',
        name: '',
        type: 'bytes16',
      },
    ],
    name: 'claimLockups',
    outputs: [
      {
        internalType: 'address',
        name: 'tokenLocker',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'start',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'cliff',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'period',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'periods',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes16[]',
        name: 'campaignIds',
        type: 'bytes16[]',
      },
      {
        internalType: 'bytes32[][]',
        name: 'proofs',
        type: 'bytes32[][]',
      },
      {
        internalType: 'uint256[]',
        name: 'claimAmounts',
        type: 'uint256[]',
      },
    ],
    name: 'claimMultiple',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes16[]',
        name: 'campaignIds',
        type: 'bytes16[]',
      },
      {
        internalType: 'bytes32[][]',
        name: 'proofs',
        type: 'bytes32[][]',
      },
      {
        internalType: 'address',
        name: 'claimer',
        type: 'address',
      },
      {
        internalType: 'uint256[]',
        name: 'claimAmounts',
        type: 'uint256[]',
      },
      {
        components: [
          {
            internalType: 'uint256',
            name: 'nonce',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'expiry',
            type: 'uint256',
          },
          {
            internalType: 'uint8',
            name: 'v',
            type: 'uint8',
          },
          {
            internalType: 'bytes32',
            name: 'r',
            type: 'bytes32',
          },
          {
            internalType: 'bytes32',
            name: 's',
            type: 'bytes32',
          },
        ],
        internalType: 'struct ClaimCampaigns.SignatureParams',
        name: 'claimSignature',
        type: 'tuple',
      },
    ],
    name: 'claimMultipleWithSig',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes16',
        name: 'campaignId',
        type: 'bytes16',
      },
      {
        internalType: 'bytes32[]',
        name: 'proof',
        type: 'bytes32[]',
      },
      {
        internalType: 'address',
        name: 'claimer',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'claimAmount',
        type: 'uint256',
      },
      {
        components: [
          {
            internalType: 'uint256',
            name: 'nonce',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'expiry',
            type: 'uint256',
          },
          {
            internalType: 'uint8',
            name: 'v',
            type: 'uint8',
          },
          {
            internalType: 'bytes32',
            name: 'r',
            type: 'bytes32',
          },
          {
            internalType: 'bytes32',
            name: 's',
            type: 'bytes32',
          },
        ],
        internalType: 'struct ClaimCampaigns.SignatureParams',
        name: 'claimSignature',
        type: 'tuple',
      },
    ],
    name: 'claimWithSig',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes16',
        name: '',
        type: 'bytes16',
      },
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'claimed',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes16',
        name: 'id',
        type: 'bytes16',
      },
      {
        components: [
          {
            internalType: 'address',
            name: 'manager',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'token',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'amount',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'start',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'end',
            type: 'uint256',
          },
          {
            internalType: 'enum ClaimCampaigns.TokenLockup',
            name: 'tokenLockup',
            type: 'uint8',
          },
          {
            internalType: 'bytes32',
            name: 'root',
            type: 'bytes32',
          },
          {
            internalType: 'bool',
            name: 'delegating',
            type: 'bool',
          },
        ],
        internalType: 'struct ClaimCampaigns.Campaign',
        name: 'campaign',
        type: 'tuple',
      },
      {
        components: [
          {
            internalType: 'address',
            name: 'tokenLocker',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'start',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'cliff',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'period',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'periods',
            type: 'uint256',
          },
        ],
        internalType: 'struct ClaimCampaigns.ClaimLockup',
        name: 'claimLockup',
        type: 'tuple',
      },
      {
        internalType: 'address',
        name: 'vestingAdmin',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'totalClaimers',
        type: 'uint256',
      },
    ],
    name: 'createLockedCampaign',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes16',
        name: 'id',
        type: 'bytes16',
      },
      {
        components: [
          {
            internalType: 'address',
            name: 'manager',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'token',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'amount',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'start',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'end',
            type: 'uint256',
          },
          {
            internalType: 'enum ClaimCampaigns.TokenLockup',
            name: 'tokenLockup',
            type: 'uint8',
          },
          {
            internalType: 'bytes32',
            name: 'root',
            type: 'bytes32',
          },
          {
            internalType: 'bool',
            name: 'delegating',
            type: 'bool',
          },
        ],
        internalType: 'struct ClaimCampaigns.Campaign',
        name: 'campaign',
        type: 'tuple',
      },
      {
        internalType: 'uint256',
        name: 'totalClaimers',
        type: 'uint256',
      },
    ],
    name: 'createUnlockedCampaign',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'eip712Domain',
    outputs: [
      {
        internalType: 'bytes1',
        name: 'fields',
        type: 'bytes1',
      },
      {
        internalType: 'string',
        name: 'name',
        type: 'string',
      },
      {
        internalType: 'string',
        name: 'version',
        type: 'string',
      },
      {
        internalType: 'uint256',
        name: 'chainId',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'verifyingContract',
        type: 'address',
      },
      {
        internalType: 'bytes32',
        name: 'salt',
        type: 'bytes32',
      },
      {
        internalType: 'uint256[]',
        name: 'extensions',
        type: 'uint256[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
    ],
    name: 'nonces',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
      {
        internalType: 'bytes',
        name: '',
        type: 'bytes',
      },
    ],
    name: 'onERC721Received',
    outputs: [
      {
        internalType: 'bytes4',
        name: '',
        type: 'bytes4',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'tokenLockers',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes16',
        name: '',
        type: 'bytes16',
      },
    ],
    name: 'usedIds',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'root',
        type: 'bytes32',
      },
      {
        internalType: 'bytes32[]',
        name: 'proof',
        type: 'bytes32[]',
      },
      {
        internalType: 'address',
        name: 'claimer',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'verify',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    stateMutability: 'payable',
    type: 'receive',
  },
];

export const HEADERS = {
  Accept: '*/*',
  'Accept-Encoding': 'gzip, deflate, br',
  'Cache-Control': 'no-cache',
  Origin: 'https://claim.gaianet.foundation',
  Pragma: 'no-cache',
  Priority: 'u=1, i',
  Referer: 'https://claim.gaianet.foundation/',
  'sec-fetch-dest': 'empty',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'cross-site',
};

interface Delegator {
  id: string;
  account: {
    address: Hex;
    name: string;
  };
}
export const DELEGATORS: Delegator[] = [
  { id: '2619816980546323601', account: { address: '0x9b0dF9632CF04178cA890DF302e38EC19A9F145a', name: 'A41' } },
  {
    id: '2597600582898288426',
    account: { address: '0xA57Fb85871deBba95d80D1f375e0A4716C385B92', name: 'Summit Labs' },
  },
  { id: '2587733390732035421', account: { address: '0xADa0974656d69104455B8E950A2B2bC2a61E4ca7', name: 'FACTBLOCK' } },
  { id: '2583541860542710951', account: { address: '0x4D41988635C8117F18BAeEAE18297acac356C9Ab', name: 'SeedGov' } },
  { id: '2570602514684577423', account: { address: '0x6De8448e7d5f58af394CC9540ABe703d0c955dFd', name: 'Proxy' } },
  {
    id: '2558041196236638049',
    account: { address: '0xE42C6CaE1Cf8739588EB97800f13E8337ED116C8', name: 'Stake Capital ' },
  },
  {
    id: '2549509321465529839',
    account: { address: '0xB79294D00848a3A4C00c22D9367F19B4280689D7', name: 'Tan - tanegov.eth' },
  },
  { id: '2545710276116743274', account: { address: '0xB49f8b8613bE240213C1827e2E576044fFEC7948', name: 'Avantgarde' } },
  { id: '2526427948433540675', account: { address: '0x3FB19771947072629C8EEE7995a2eF23B72d4C8A', name: 'PGov' } },
  {
    id: '2646594760910832864',
    account: { address: '0x3eac0AD4Ecbf0A1B8fbe100A15490eF1C8Fb9314', name: 'Ismael Hishon-Rezaizadeh' },
  },
  {
    id: '2631503878096421991',
    account: { address: '0x7AE109A63ff4DC852e063a673b40BED85D22E585', name: 'CalBlockchain' },
  },
  {
    id: '2608341693350544433',
    account: { address: '0x46fcf5993429632C31cab4646c076B33e201d4AF', name: 'Austin | Yale Blockchain Club' },
  },
  { id: '2607151045092050644', account: { address: '0xDa504550c870F9D54d0266d86bFaD864097CF967', name: 'TEB' } },
  {
    id: '2591745057597949768',
    account: { address: '0x2cb48dDF3c74FC61f63C98D40067A835370ca315', name: 'Mantequilla' },
  },
  {
    id: '2590490731558733318',
    account: { address: '0x4dbE12351a751d52e828dC60D10893641847Cd72', name: 'RFD Capital' },
  },
  { id: '2588206060414174379', account: { address: '0x83C6b87b3e24Df61B64f0B0D4BC9741bE6076608', name: 'w3.io' } },
  {
    id: '2575197204822099129',
    account: { address: '0x7e2213f499920c35346F3BF881D86748B12c23b4', name: 'Fracton Ventures' },
  },
  {
    id: '2560729791548360387',
    account: { address: '0x4e0023D201172F33e963C8509549c39431F090f1', name: 'Chase | Offchain Labs' },
  },
  { id: '2541774371727345172', account: { address: '0xE93D59CC0bcECFD4ac204827eF67c5266079E2b5', name: '404 Gov' } },
  {
    id: '2541629078151104150',
    account: { address: '0x4D32D90D6535bD4e7eaBaa27EE72932cB214BbfA', name: 'bitblondy-gov.eth' },
  },
  {
    id: '2530889796608329502',
    account: { address: '0xCDaba8e196D9BF1DabdF6b5D3Bc3BFD175FF81c8', name: 'UMN Blockchain' },
  },
  {
    id: '2529906321717725107',
    account: { address: '0xda8894b8761E3a876E4311265826599DC84b82D5', name: 'Blockchain at Emory' },
  },
  { id: '2525900575212570480', account: { address: '0x657D07095b082BB71ebD93F549f407A97f49094F', name: '0xMims' } },
  {
    id: '2525752633411503507',
    account: { address: '0x5936A4F9382BB2DFa286c515E76b46Ac48Df856A', name: 'Luke H | Eigen Labs' },
  },
  {
    id: '2522458232216093884',
    account: { address: '0x25452934be45Ca48163731Db36a2fE2d655a22cF', name: 'ucalgaryblockchain' },
  },
];

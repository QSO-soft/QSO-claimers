import { getAddress, Hex } from 'viem';

export const CLAIM_TAIKO_CONTRACT: Hex = getAddress('0x95345D5A092623D79a56a016001f7878FA9Da3Ef');
export const TAIKO_TOKEN_CONTRACT: Hex = getAddress('0xA9d23408b9bA935c230493c40C73824Df71A0975');

export const TAIKO_ABI = [
  {
    type: 'function',
    inputs: [],
    name: 'UPGRADE_INTERFACE_VERSION',
    outputs: [
      {
        name: '',
        internalType: 'string',
        type: 'string',
      },
    ],
    stateMutability: 'view',
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
    name: 'blacklist',
    outputs: [
      {
        name: '',
        internalType: 'contract IMinimalBlacklist',
        type: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'user',
        internalType: 'address',
        type: 'address',
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
      },
      {
        name: 'proof',
        internalType: 'bytes32[]',
        type: 'bytes32[]',
      },
    ],
    name: 'claim',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'claimEnd',
    outputs: [
      {
        name: '',
        internalType: 'uint64',
        type: 'uint64',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'claimStart',
    outputs: [
      {
        name: '',
        internalType: 'uint64',
        type: 'uint64',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'user',
        internalType: 'address',
        type: 'address',
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
      },
    ],
    name: 'hasClaimed',
    outputs: [
      {
        name: '',
        internalType: 'bool',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: '_owner',
        internalType: 'address',
        type: 'address',
      },
      {
        name: '_claimStart',
        internalType: 'uint64',
        type: 'uint64',
      },
      {
        name: '_claimEnd',
        internalType: 'uint64',
        type: 'uint64',
      },
      {
        name: '_merkleRoot',
        internalType: 'bytes32',
        type: 'bytes32',
      },
      {
        name: '_token',
        internalType: 'contract IERC20',
        type: 'address',
      },
      {
        name: '_blacklist',
        internalType: 'address',
        type: 'address',
      },
    ],
    name: 'init',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'hash',
        internalType: 'bytes32',
        type: 'bytes32',
      },
    ],
    name: 'isClaimed',
    outputs: [
      {
        name: 'claimed',
        internalType: 'bool',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'merkleRoot',
    outputs: [
      {
        name: '',
        internalType: 'bytes32',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [
      {
        name: '',
        internalType: 'address',
        type: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'paused',
    outputs: [
      {
        name: '',
        internalType: 'bool',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'pendingOwner',
    outputs: [
      {
        name: '',
        internalType: 'address',
        type: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'proxiableUUID',
    outputs: [
      {
        name: '',
        internalType: 'bytes32',
        type: 'bytes32',
      },
    ],
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
    inputs: [
      {
        name: '_claimStart',
        internalType: 'uint64',
        type: 'uint64',
      },
      {
        name: '_claimEnd',
        internalType: 'uint64',
        type: 'uint64',
      },
      {
        name: '_merkleRoot',
        internalType: 'bytes32',
        type: 'bytes32',
      },
    ],
    name: 'setConfig',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'token',
    outputs: [
      {
        name: '',
        internalType: 'contract IERC20',
        type: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
      },
    ],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: '_blacklist',
        internalType: 'address',
        type: 'address',
      },
    ],
    name: 'updateBlacklist',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'newImplementation',
        internalType: 'address',
        type: 'address',
      },
      {
        name: 'data',
        internalType: 'bytes',
        type: 'bytes',
      },
    ],
    name: 'upgradeToAndCall',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: '_token',
        internalType: 'contract IERC20',
        type: 'address',
      },
    ],
    name: 'withdrawERC20',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: !1,
    inputs: [
      {
        name: '_blacklist',
        internalType: 'address',
        type: 'address',
        indexed: !1,
      },
    ],
    name: 'BlacklistUpdated',
  },
  {
    type: 'event',
    anonymous: !1,
    inputs: [
      {
        name: 'hash',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: !1,
      },
    ],
    name: 'Claimed',
  },
  {
    type: 'event',
    anonymous: !1,
    inputs: [
      {
        name: 'claimStart',
        internalType: 'uint64',
        type: 'uint64',
        indexed: !1,
      },
      {
        name: 'claimEnd',
        internalType: 'uint64',
        type: 'uint64',
        indexed: !1,
      },
      {
        name: 'merkleRoot',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: !1,
      },
    ],
    name: 'ConfigChanged',
  },
  {
    type: 'event',
    anonymous: !1,
    inputs: [
      {
        name: 'version',
        internalType: 'uint64',
        type: 'uint64',
        indexed: !1,
      },
    ],
    name: 'Initialized',
  },
  {
    type: 'event',
    anonymous: !1,
    inputs: [
      {
        name: 'previousOwner',
        internalType: 'address',
        type: 'address',
        indexed: !0,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: !0,
      },
    ],
    name: 'OwnershipTransferStarted',
  },
  {
    type: 'event',
    anonymous: !1,
    inputs: [
      {
        name: 'previousOwner',
        internalType: 'address',
        type: 'address',
        indexed: !0,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: !0,
      },
    ],
    name: 'OwnershipTransferred',
  },
  {
    type: 'event',
    anonymous: !1,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: !1,
      },
    ],
    name: 'Paused',
  },
  {
    type: 'event',
    anonymous: !1,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: !1,
      },
    ],
    name: 'Unpaused',
  },
  {
    type: 'event',
    anonymous: !1,
    inputs: [
      {
        name: 'implementation',
        internalType: 'address',
        type: 'address',
        indexed: !0,
      },
    ],
    name: 'Upgraded',
  },
  {
    type: 'error',
    inputs: [],
    name: 'ADDRESS_BLACKLISTED',
  },
  {
    type: 'error',
    inputs: [
      {
        name: 'target',
        internalType: 'address',
        type: 'address',
      },
    ],
    name: 'AddressEmptyCode',
  },
  {
    type: 'error',
    inputs: [],
    name: 'CLAIMED_ALREADY',
  },
  {
    type: 'error',
    inputs: [],
    name: 'CLAIM_NOT_ONGOING',
  },
  {
    type: 'error',
    inputs: [
      {
        name: 'implementation',
        internalType: 'address',
        type: 'address',
      },
    ],
    name: 'ERC1967InvalidImplementation',
  },
  {
    type: 'error',
    inputs: [],
    name: 'ERC1967NonPayable',
  },
  {
    type: 'error',
    inputs: [],
    name: 'EnforcedPause',
  },
  {
    type: 'error',
    inputs: [],
    name: 'ExpectedPause',
  },
  {
    type: 'error',
    inputs: [],
    name: 'FailedInnerCall',
  },
  {
    type: 'error',
    inputs: [],
    name: 'INVALID_PARAMS',
  },
  {
    type: 'error',
    inputs: [],
    name: 'INVALID_PROOF',
  },
  {
    type: 'error',
    inputs: [],
    name: 'InvalidInitialization',
  },
  {
    type: 'error',
    inputs: [],
    name: 'NotInitializing',
  },
  {
    type: 'error',
    inputs: [
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
      },
    ],
    name: 'OwnableInvalidOwner',
  },
  {
    type: 'error',
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
      },
    ],
    name: 'OwnableUnauthorizedAccount',
  },
  {
    type: 'error',
    inputs: [],
    name: 'ReentrancyGuardReentrantCall',
  },
  {
    type: 'error',
    inputs: [],
    name: 'UUPSUnauthorizedCallContext',
  },
  {
    type: 'error',
    inputs: [
      {
        name: 'slot',
        internalType: 'bytes32',
        type: 'bytes32',
      },
    ],
    name: 'UUPSUnsupportedProxiableUUID',
  },
];

export const API_URL = 'https://trailblazer.mainnet.taiko.xyz';

export const HEADERS = {
  Accept: 'application/json, text/plain, */*',
  'Accept-Encoding': 'gzip, deflate, br, zstd',
  'Cache-Control': 'no-cache',
  Origin: 'https://trailblazers.taiko.xyz',
  Pragma: 'no-cache',
  Priority: 'u=1, i',
  Referer: 'https://trailblazers.taiko.xyz/',
  'sec-fetch-dest': 'empty',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'same-site',
};

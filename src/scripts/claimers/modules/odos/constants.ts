import { getAddress, Hex } from 'viem';

export const CLAIM_CONTRACT: Hex = '0x4c8f8055d88705f52c9994969dde61ab574895a3';
export const TOKEN_CONTRACT: Hex = getAddress('0xca73ed1815e5915489570014e024b7EbE65dE679');

export const ABI = [
  {
    inputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'sender',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'recipient',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'payoutToken',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'amount',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'nonce',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'deadline',
            type: 'uint256',
          },
        ],
        internalType: 'struct Claim',
        name: '_claim',
        type: 'tuple',
      },
      {
        components: [
          {
            internalType: 'address',
            name: 'member',
            type: 'address',
          },
          {
            internalType: 'string',
            name: 'agreement',
            type: 'string',
          },
          {
            internalType: 'uint256',
            name: 'nonce',
            type: 'uint256',
          },
        ],
        internalType: 'struct Registration',
        name: '_registration',
        type: 'tuple',
      },
      {
        internalType: 'bytes',
        name: '_claimSignature',
        type: 'bytes',
      },
      {
        internalType: 'bytes',
        name: '_registrationSignature',
        type: 'bytes',
      },
    ],
    name: 'registerAndClaim',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'sender',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'recipient',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'payoutToken',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'amount',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'nonce',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'deadline',
            type: 'uint256',
          },
        ],
        internalType: 'struct Claim',
        name: '_claim',
        type: 'tuple',
      },
      {
        internalType: 'bytes',
        name: '_signature',
        type: 'bytes',
      },
    ],
    name: 'claimReward',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'acceptOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    type: 'function',
    name: 'hasClaimed',
    inputs: [
      {
        name: 'user',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: 'claimed',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'view',
  },
];

export const HEADERS = {
  'Accept-Encoding': 'gzip, deflate, br, zstd',
  'sec-fetch-dest': 'empty',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'same-site',
  Referer: 'https://app.odos.xyz/',
  Origin: 'https://app.odos.xyz',
};

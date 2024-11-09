import { getAddress, Hex } from 'viem';

export const CLAIM_SWELL_CONTRACT: Hex = getAddress('0x342F0D375Ba986A65204750A4AECE3b39f739d75');
export const SWELL_TOKEN_CONTRACT: Hex = getAddress('0x0a6E7Ba5042B38349e437ec6Db6214AEC7B35676');

export const SWELL_ABI = [
  {
    type: 'function',
    inputs: [
      {
        name: 'cumulativeAmount',
        internalType: 'uint256',
        type: 'uint256',
      },
      {
        name: 'amountToLock',
        internalType: 'uint256',
        type: 'uint256',
      },
      {
        name: 'merkleProof',
        internalType: 'bytes32[]',
        type: 'bytes32[]',
      },
    ],
    name: 'claimAndLock',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'user',
        internalType: 'address',
        type: 'address',
      },
    ],
    name: 'cumulativeClaimed',
    outputs: [
      {
        name: '',
        internalType: 'uint256',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
];

export const API_URL = 'https://airdrop.svc.swellnetwork.io/api';

export const HEADERS = {
  Origin: 'https://app.swellnetwork.io',
  Referer: 'https://app.swellnetwork.io/dao/voyage',
  'Accept-Encoding': 'gzip, deflate, br, zstd',
};

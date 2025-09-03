import { getAddress, Hex } from 'viem';

export const CHECKER_CONTRACT: Hex = getAddress('0x87bAa1694381aE3eCaE2660d97fe60404080Eb64');

export const ABI = [
  {
    type: 'function',
    name: 'calculateAllocation',
    inputs: [
      {
        name: '_account',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: 'tokenAllocation',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
];

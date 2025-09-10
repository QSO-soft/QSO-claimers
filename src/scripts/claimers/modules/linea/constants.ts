import { getAddress, Hex } from 'viem';

export const CHECKER_CONTRACT: Hex = getAddress('0x87bAa1694381aE3eCaE2660d97fe60404080Eb64');
export const TOKEN_CONTRACT: Hex = getAddress('0x1789e0043623282D5DCc7F213d703C6D8BAfBB04');

export const ABI = [
  {
    inputs: [{ internalType: 'address', name: '_account', type: 'address' }],
    name: 'calculateAllocation',
    outputs: [{ internalType: 'uint256', name: 'tokenAllocation', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  { inputs: [], name: 'claim', outputs: [], stateMutability: 'nonpayable', type: 'function' },
  {
    inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
    name: 'hasClaimed',
    outputs: [{ internalType: 'bool', name: 'claimed', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
];

export const HEADERS = {
  origin: 'https://linea.build',
  pragma: 'no-cache',
  priority: 'u=1, i',
  referer: 'https://linea.build/',
  'sec-fetch-site': 'cross-site',
};

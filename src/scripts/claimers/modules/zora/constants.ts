import { getAddress, Hex } from 'viem';

export const CLAIM_ZORA_CONTRACT: Hex = getAddress('0x0000000002ba96C69b95E32CAAB8fc38bAB8B3F8');
export const ZORA_TOKEN_CONTRACT: Hex = getAddress('0x1111111111166b7FE7bd91427724B487980aFc69');

export const ZORA_ABI = [
  {
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'accountClaim',
    outputs: [
      {
        components: [
          { internalType: 'uint96', name: 'allocation', type: 'uint96' },
          { internalType: 'bool', name: 'claimed', type: 'bool' },
        ],
        internalType: 'structIZoraTokenCommunityClaim.AccountClaim',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_claimTo', type: 'address' }],
    name: 'claim',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

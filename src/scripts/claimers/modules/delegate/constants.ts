export const CONTRACT = '0x00000000000000447e69651d841bD8D104Bed493';
export const abi = [
  {
    type: 'function',
    name: 'checkDelegateForAll',
    inputs: [
      { name: 'to', type: 'address', internalType: 'address' },
      { name: 'from', type: 'address', internalType: 'address' },
      { name: 'rights', type: 'bytes32', internalType: 'bytes32' },
    ],
    outputs: [{ name: '', type: 'bool', internalType: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'delegateAll',
    inputs: [
      { name: 'to', type: 'address', internalType: 'address' },
      { name: 'rights', type: 'bytes32', internalType: 'bytes32' },
      { name: 'enable', type: 'bool', internalType: 'bool' },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
];

import axios from 'axios';
import { encodePacked, Hex, keccak256 } from 'viem';

import { BaseAxiosConfig, SupportedNetworks } from '../../../../types';

interface GetData {
  network: SupportedNetworks;
  walletAddress: Hex;
  chainId: number;
  config?: BaseAxiosConfig;
}

export interface ProofRes {
  id: number;
  address_handler: Hex;
  allocation: string;
  claim_at: 'string' | null;
  extra: {
    proof: Hex[];
  };
}
export const getProofData = async ({ walletAddress, config }: GetData): Promise<ProofRes> => {
  const { data } = await axios.post(
    'https://acs.clique.tech/allocation',
    {
      address: walletAddress,
      appId: 'somnia',
      batch: 'default',
    },
    config
  );

  return data;
};

export const calculateMerkleProof = (proofElements: Hex[], userAddress: Hex, tokenAmount: bigint) => {
  let currentHash = keccak256(encodePacked(['address', 'uint256'], [userAddress, tokenAmount]));

  proofElements.forEach((proofElement: Hex) => {
    const hashPair = [currentHash, proofElement].sort((hashA: Hex, hashB: Hex) =>
      BigInt(hashA) < BigInt(hashB) ? -1 : +(BigInt(hashA) > BigInt(hashB))
    ) as [Hex, Hex];
    currentHash = keccak256(encodePacked(['bytes32', 'bytes32'], hashPair));
  });

  return currentHash;
};

export const calculateClaimableAllocation = (claimedAllocation: bigint, releasedAllocation: bigint): bigint => {
  return releasedAllocation - claimedAllocation;
};

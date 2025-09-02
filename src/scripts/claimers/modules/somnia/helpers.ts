import axios from 'axios';
import { Hex } from 'viem';

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

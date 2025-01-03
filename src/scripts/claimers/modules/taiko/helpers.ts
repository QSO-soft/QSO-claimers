import axios from 'axios';
import { Hex } from 'viem';

import { defaultTokenAbi } from '../../../../clients/abi';
import { ClientType } from '../../../../helpers';
import { BaseAxiosConfig, SupportedNetworks, TokenContract } from '../../../../types';
import { API_URL, TAIKO_TOKEN_CONTRACT } from './constants';

interface GetData {
  network: SupportedNetworks;
  walletAddress: Hex;
  chainId: number;
  config?: BaseAxiosConfig;
}

interface ProofRes {
  address: string;
  proof: string;
  value: string;
}
export const getProofData = async ({ walletAddress, config }: GetData): Promise<ProofRes> => {
  const { data } = await axios.get(`${API_URL}/s2/claim/proof?address=${walletAddress}`, config);

  return data;
};
interface FinalRes {
  address: string;
  score: string;
  multiplier: string;
  total: string;
}
export const getFinalData = async ({ walletAddress, config }: GetData): Promise<FinalRes> => {
  const { data } = await axios.get(`${API_URL}/user/final?address=${walletAddress}`, config);

  return data;
};

export const getBalance = async (client: ClientType) => {
  const contractInfo: TokenContract = {
    name: 'TAIKO',
    address: TAIKO_TOKEN_CONTRACT,
    abi: defaultTokenAbi,
  };
  const { int: currentBalance, wei: currentBalanceWei } = await client.getBalanceByContract(contractInfo);

  return { currentBalance, currentBalanceWei };
};

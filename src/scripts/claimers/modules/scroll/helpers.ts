import { createRequire } from 'module';

import axios from 'axios';
import { Hex } from 'viem';

import { defaultTokenAbi } from '../../../../clients/abi';
import { ClientType } from '../../../../helpers';
import { BaseAxiosConfig, SupportedNetworks, TokenContract } from '../../../../types';
import { API_URL, SCROLL_TOKEN_CONTRACT } from './constants';

const require = createRequire(import.meta.url);
const cloudscraper = require('cloudscraper');

interface GetData {
  network: SupportedNetworks;
  walletAddress: Hex;
  chainId: number;
  config?: BaseAxiosConfig;
}

interface ProofRes {
  amount: string;
  proof: string;
  claim_status: string;
}
export const getProofData = async ({ walletAddress, config }: GetData): Promise<ProofRes> => {
  const { data } = await axios.post(`${API_URL}/?step=5`, JSON.stringify([walletAddress]), config);

  const dataObj = data.match(/1:(\{.*\})/s)[1] || '{}';
  return JSON.parse(dataObj);
};

export const getBalance = async (client: ClientType) => {
  const contractInfo: TokenContract = {
    name: 'SCR',
    address: SCROLL_TOKEN_CONTRACT,
    abi: defaultTokenAbi,
  };
  const { int: currentBalance, wei: currentBalanceWei } = await client.getBalanceByContract(contractInfo);

  return { currentBalance, currentBalanceWei };
};

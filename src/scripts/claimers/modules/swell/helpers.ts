import { createRequire } from 'module';

import { gotScraping } from 'got-scraping';
import { Hex } from 'viem';

import { defaultTokenAbi } from '../../../../clients/abi';
import { ClientType } from '../../../../helpers';
import { BaseAxiosConfig, SupportedNetworks, TokenContract } from '../../../../types';
import { API_URL, SWELL_TOKEN_CONTRACT } from './constants';

const require = createRequire(import.meta.url);
const cloudscraper = require('cloudscraper');

interface GetData {
  network: SupportedNetworks;
  walletAddress: Hex;
  chainId: number;
  proxyUrl?: string;
  config?: BaseAxiosConfig;
}

interface ProofRes {
  isSybil: boolean;
  proofsHex: string[];
  totalAmount: string;
}
export const getProofData = async ({ walletAddress, config, proxyUrl }: GetData): Promise<ProofRes> => {
  // const { data } = await axios.get(`${API_URL}/airdrop?address=${walletAddress}&opn=1`, config);
  const { body } = await gotScraping({
    url: `${API_URL}/airdrop?address=${walletAddress}&opn=1`,
    headers: config?.headers,
    responseType: 'json',
    proxyUrl,
    useHeaderGenerator: false,
  } as any);

  return body;
};

export const getBalance = async (client: ClientType) => {
  const contractInfo: TokenContract = {
    name: 'SWELL',
    address: SWELL_TOKEN_CONTRACT,
    abi: defaultTokenAbi,
  };
  const { int: currentBalance, wei: currentBalanceWei } = await client.getBalanceByContract(contractInfo);

  return { currentBalance, currentBalanceWei };
};

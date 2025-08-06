import axios from 'axios';
import { Hex, hexToNumber, sliceHex } from 'viem';

import { defaultTokenAbi } from '../../../../clients/abi';
import { ClientType } from '../../../../helpers';
import { BaseAxiosConfig, SupportedNetworks, TokenContract } from '../../../../types';
import { TOKEN_CONTRACT } from './constants';

interface GetData {
  network: SupportedNetworks;
  walletAddress: Hex;
  chainId: number;
  config?: BaseAxiosConfig;
}

export interface ProofRes {
  uuid: string;
  amount: string;
  proof: Hex[];
}
export const getProofData = async ({ walletAddress, config }: GetData): Promise<ProofRes[]> => {
  const { data } = await axios.get(`https://api.hedgey.finance/token-claims/${walletAddress}`, config);

  return data;
};

export const getBalance = async (client: ClientType) => {
  const contractInfo: TokenContract = {
    name: 'GAIA',
    address: TOKEN_CONTRACT,
    abi: defaultTokenAbi,
  };
  const { int: currentBalance, wei: currentBalanceWei } = await client.getBalanceByContract(contractInfo);

  return { currentBalance, currentBalanceWei };
};

export const splitSignature = (signature: `0x${string}`) => {
  return {
    r: sliceHex(signature, 0, 32), // первые 32 байта
    s: sliceHex(signature, 32, 64), // следующие 32 байта
    v: hexToNumber(sliceHex(signature, 64, 65)), // последний байт в число
  };
};

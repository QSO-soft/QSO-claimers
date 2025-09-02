import { defineChain } from 'viem';

import { SOMNIA_TOKEN_CONTRACTS } from '../constants';
import { getTokenContract } from '../helpers';
import { LoggerType } from '../logger';
import { BlastTokens, Networks } from '../types';
import { DefaultClient } from './default-client';

export const somniaTestnet = defineChain({
  id: 5031,
  name: 'somnia',
  nativeCurrency: {
    decimals: 18,
    name: 'SOMI',
    symbol: 'SOMI',
  },
  rpcUrls: {
    default: { http: ['https://explorer.somnia.network'] },
  },
  blockExplorers: {
    default: {
      name: 'Somnia Testnet Explorer',
      url: 'https://api.infra.mainnet.somnia.network',
    },
  },
});

export class SomniaClient extends DefaultClient {
  constructor(privateKey: string, logger: LoggerType) {
    super(privateKey, somniaTestnet, logger, Networks.SOMNIA);
  }

  async getBalanceByToken(tokenName: BlastTokens) {
    const contractInfo = getTokenContract({ contracts: SOMNIA_TOKEN_CONTRACTS, tokenName });
    return this.getBalanceByContract(contractInfo);
  }
}

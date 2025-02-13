import { defineChain } from 'viem';

import { STORY_TOKEN_CONTRACTS } from '../constants';
import { getTokenContract } from '../helpers';
import { LoggerType } from '../logger';
import { Networks, StoryTokens } from '../types';
import { DefaultClient } from './default-client';

export const story = defineChain({
  id: 1514,
  name: 'Story',
  nativeCurrency: {
    decimals: 18,
    name: 'IP',
    symbol: 'IP',
  },
  rpcUrls: {
    default: { http: ['https://mainnet.storyrpc.io'] },
  },
  blockExplorers: {
    default: {
      name: 'Story Explorer',
      url: 'https://www.storyscan.xyz',
    },
  },
});

export class StoryClient extends DefaultClient {
  constructor(privateKey: string, logger: LoggerType) {
    super(privateKey, story, logger, Networks.STORY);
  }

  async getBalanceByToken(tokenName: StoryTokens) {
    const contractInfo = getTokenContract({ contracts: STORY_TOKEN_CONTRACTS, tokenName });
    return this.getBalanceByContract(contractInfo);
  }
}

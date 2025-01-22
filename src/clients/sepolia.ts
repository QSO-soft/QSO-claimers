import { sepolia } from 'viem/chains';

import { SEPOLIA_TOKEN_CONTRACTS } from '../constants';
import { getTokenContract } from '../helpers';
import { LoggerType } from '../logger';
import { Networks, SepoliaTokens } from '../types';
import { DefaultClient } from './default-client';

export class SepoliaClient extends DefaultClient {
  constructor(privateKey: string, logger: LoggerType) {
    super(privateKey, sepolia, logger, Networks.SEPOLIA);
  }

  async getBalanceByToken(tokenName: SepoliaTokens) {
    const contractInfo = getTokenContract({ contracts: SEPOLIA_TOKEN_CONTRACTS, tokenName });
    return this.getBalanceByContract(contractInfo);
  }
}

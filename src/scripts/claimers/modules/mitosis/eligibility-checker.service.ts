import axios from 'axios';
import { DataSource } from 'typeorm';

import { DefaultClient } from '../../../../clients';
import {
  EntityManager,
  getAxiosConfig,
  getHeaders,
  TransactionCallbackParams,
  TransactionCallbackReturn,
} from '../../../../helpers';
import { Logger } from '../../../../logger';
import { BaseAxiosConfig, ProxyAgent, StringRecord, WalletData } from '../../../../types';
import { MitosisAirdropEntity } from '../../db/entities';
import { AirdropData, ConnectResponse } from './models';

export class EligibilityCheckerService {
  private readonly wallet: WalletData;
  private readonly logger: Logger;
  private readonly client: DefaultClient;
  private readonly proxyAgent?: ProxyAgent;
  private readonly baseHeaders: StringRecord;
  private readonly entityManager: EntityManager<MitosisAirdropEntity>;
  private accountInfo: MitosisAirdropEntity;
  private jwtToken: string;

  constructor(private readonly params: TransactionCallbackParams) {
    // * Base variables
    this.wallet = params.wallet;
    this.logger = params.logger;
    this.proxyAgent = params.proxyAgent;
    this.client = params.client;

    // * Init entity manager
    this.entityManager = new EntityManager({
      dbSource: params.dbSource,
      entityClass: MitosisAirdropEntity,
      wallet: this.wallet,
      // statisticCallback: unloadMitosisAirdropStatistic,
    });

    // * Base headers
    this.baseHeaders = getHeaders({
      referer: 'https://airdrop.mitosis.org/flow',
      origin: 'https://airdrop.mitosis.org',
      'clq-app-id': 'mitosis',
    });
  }

  public async makeEligibilityRegisterHandler(): Promise<TransactionCallbackReturn> {
    await this.getRegister();

    // * Get message to sign
    const messageToSign = await this.getMessageTosSign();

    // * Sign message
    const signature = await this.client.walletClient.signMessage({ message: messageToSign });

    // * Send wallet auth request
    const walletAuthResponse = await this.connectAccount(signature);
    this.jwtToken = walletAuthResponse.jwtToken;

    const registerInfoResponse = await this.getRegister();

    if (registerInfoResponse.option) {
      this.accountInfo = await this.entityManager.updateAccountInfo(
        {
          airdropAmount: +registerInfoResponse.allocation.total,
          airdropRegistered: true,
          airdropRegisterType: registerInfoResponse.option,
          airdropRegisterAddress: registerInfoResponse.airdropAddress,
        },
        true
      );

      return {
        status: 'passed',
        message: `Already registered with ${registerInfoResponse.option} option${
          registerInfoResponse.airdropAddress.toLowerCase() !== this.wallet.walletAddress.toLowerCase()
            ? ` and delegating drop to delegateToAddress ${registerInfoResponse.airdropAddress}`
            : ''
        }`,
      };
    }

    if (+registerInfoResponse.allocation.total === 0) {
      this.accountInfo = await this.entityManager.updateAccountInfo(
        {
          airdropAmount: +registerInfoResponse.allocation.total,
          airdropRegistered: false,
        },
        true
      );

      return {
        status: 'passed',
        message: 'Wallet is not eligible for airdrop',
        tgMessage: 'Wallet is not eligible for airdrop',
      };
    }

    const registerResponse = await this.sendWalletRegister();

    // * Update account info
    this.accountInfo = await this.entityManager.updateAccountInfo(
      {
        airdropAmount: +registerResponse.allocation.total,
        airdropRegistered: true,
        airdropRegisterType: registerResponse.option,
        airdropRegisterAddress: registerResponse.airdropAddress,
      },
      true
    );

    const resultMessage = `Registration completed! Airdrop amount: ${+registerResponse.allocation.total} MITO`;

    return {
      status: 'success',
      message: resultMessage,
      tgMessage: resultMessage,
    };
  }

  public async makeEligibilityCheckHandler(): Promise<TransactionCallbackReturn> {
    await this.getRegister();

    // * Get message to sign
    const messageToSign = await this.getMessageTosSign();

    // * Sign message
    const signature = await this.client.walletClient.signMessage({ message: messageToSign });

    // * Send wallet auth request
    const walletAuthResponse = await this.connectAccount(signature);
    this.jwtToken = walletAuthResponse.jwtToken;

    const registerInfoResponse = await this.getRegister();

    // * Update account info with eligibility data
    this.accountInfo = await this.entityManager.updateAccountInfo(
      {
        airdropAmount: +registerInfoResponse.allocation.total,
        airdropRegistered: true,
        airdropRegisterType: registerInfoResponse.option,
        airdropRegisterAddress: registerInfoResponse.airdropAddress,
      },
      true
    );

    const resultMessage = +registerInfoResponse.allocation.total
      ? `Airdrop amount: ${+registerInfoResponse.allocation.total} MITO`
      : 'Not eligible for airdrop';

    return {
      status: 'success',
      message: resultMessage,
      tgMessage: resultMessage,
    };
  }

  public async initialize(): Promise<void> {
    // * Get the account info
    this.accountInfo = await this.entityManager.getAccountInfo();
  }

  private async getRegister(): Promise<AirdropData> {
    const config = await this.axiosConfig({ authorization: true });

    const response = await axios.get<AirdropData>('https://airdrop.mitosis.org/api/register', config);

    return response.data;
  }

  private async connectAccount(signature: string): Promise<ConnectResponse> {
    const config = await this.axiosConfig();

    const response = await axios.post<ConnectResponse>(
      'https://airdrop.mitosis.org/api/register/connect',
      {
        walletEVM: {
          address: this.wallet.walletAddress,
          chainId: 1,
          signature,
        },
      },
      config
    );

    if (!response.data?.jwtToken) throw new Error('Cannot get auth token');

    return response.data;
  }

  private async getMessageTosSign(): Promise<string> {
    const config = await this.axiosConfig();

    const response = await axios.get<{ message: string }>(
      `https://airdrop.mitosis.org/api/message/tos?address=${this.wallet.walletAddress}`,
      config
    );

    if (!response.data?.message) throw new Error('Cannot get message to sign');

    return response.data?.message;
  }

  private async sendWalletRegister(): Promise<AirdropData> {
    const config = await this.axiosConfig({ authorization: true });

    const registerType = this.params.customSettings?.registerType || 'instant';

    this.logger.info(
      `Registering with "${registerType}" option${
        this.wallet.delegateToAddress &&
        this.wallet.delegateToAddress?.toLowerCase() !== this.wallet.walletAddress.toLowerCase()
          ? ` and delegating drop to delegateToAddress "${this.wallet.delegateToAddress}"`
          : ''
      }`
    );

    const response = await axios.post<AirdropData>(
      'https://airdrop.mitosis.org/api/register',
      {
        airdropAddress: this.wallet.delegateToAddress || this.wallet.walletAddress,
        option: this.params.customSettings?.registerType || 'instant',
      },
      config
    );

    return response.data;
  }

  private async axiosConfig(params: { authorization?: boolean; contentType?: string } = {}): Promise<
    BaseAxiosConfig & {
      validateStatus?: (status: number) => boolean;
    }
  > {
    const { authorization = false, contentType } = params;

    const config = await getAxiosConfig({
      headers: this.getHeaders({ authorization, contentType }),
      proxyAgent: this.proxyAgent,
    });

    return {
      ...config,
      validateStatus: () => true,
    };
  }

  private getHeaders(params: { authorization?: boolean; contentType?: string } = {}): StringRecord {
    const { authorization = false, contentType } = params;

    const headers: StringRecord = {};

    if (authorization && this.jwtToken) {
      headers['clq-jwt'] = this.jwtToken;
    }

    if (contentType) {
      headers['content-type'] = contentType;
    }

    return {
      ...this.baseHeaders,
      ...headers,
    };
  }
}

export const clearMitosisAirdropStatistic = async (dbSource: DataSource, jsonWallets?: WalletData[]) => {
  if (!jsonWallets) return;
  const repo = dbSource.getRepository(MitosisAirdropEntity);
  const existingEntities = await repo.find();
  const existingMap = new Map<string, MitosisAirdropEntity>(
    existingEntities.map((entity) => [entity.walletAddress.toLowerCase(), entity])
  );

  for (const [walletAddress, entity] of existingMap) {
    const stillExists = jsonWallets.some((wallet) => wallet.walletAddress.toLowerCase() === walletAddress);
    if (stillExists) continue;
    await repo.delete(entity.id);
  }
};

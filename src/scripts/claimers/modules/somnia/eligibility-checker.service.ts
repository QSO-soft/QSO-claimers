import axios from 'axios';
import { DataSource } from 'typeorm';

import { DefaultClient } from '../../../../clients';
import {
  CookieManager,
  EntityManager,
  getAxiosConfig,
  getHeaders,
  parseResponse,
  TransactionCallbackParams,
  TransactionCallbackReturn,
  truncateToDecimal,
} from '../../../../helpers';
import { Logger } from '../../../../logger';
import { BaseAxiosConfig, ProxyAgent, StringRecord, SupportedNetworks, WalletData } from '../../../../types';
import { SomniaAirdropEntity } from '../../db/entities';
import { AccountResponse, ConnectResponse, EligibilityResponse, WalletAuthResponse } from './models';

export class EligibilityCheckerService {
  private readonly wallet: WalletData;
  private readonly logger: Logger;
  private readonly client: DefaultClient;
  private readonly proxyAgent?: ProxyAgent;
  private readonly baseHeaders: StringRecord;
  private readonly network: SupportedNetworks;
  private readonly entityManager: EntityManager<SomniaAirdropEntity>;
  private accountInfo: SomniaAirdropEntity;
  private cookieManager: CookieManager;
  private jwtToken: string;

  constructor(private readonly params: TransactionCallbackParams) {
    // * Base variables
    this.wallet = params.wallet;
    this.logger = params.logger;
    this.network = params.network;
    this.proxyAgent = params.proxyAgent;
    this.client = params.client;

    // * Init entity manager
    this.entityManager = new EntityManager({
      dbSource: params.dbSource,
      entityClass: SomniaAirdropEntity,
      wallet: this.wallet,
      // statisticCallback: unloadSomniaAirdropStatistic,
    });

    // * Base headers
    this.baseHeaders = getHeaders({
      referer: 'https://register.somnia.network/flow',
      origin: 'https://register.somnia.network',
    });
  }

  public async makeEligibilityRegisterHandler(): Promise<TransactionCallbackReturn> {
    // * Get message to sign
    const messageToSign = await this.getMessageTosSign();

    // * Sign message
    const signature = await this.client.walletClient.signMessage({ message: messageToSign });

    // * Send wallet auth request
    const walletAuthResponse = await this.sendWalletAuth(signature);
    if (!walletAuthResponse?.jwtToken) {
      throw new Error('Failed to get JWT token | ' + JSON.stringify(walletAuthResponse));
    }

    this.jwtToken = walletAuthResponse.jwtToken;

    // * Get account info with JWT
    let accountResponse = await this.getAccountInfo();
    if (!accountResponse?.allocation?.total) {
      throw new Error('Failed to get allocation info | ' + JSON.stringify(accountResponse));
    }

    const airdropAmount = truncateToDecimal(Number(accountResponse.allocation.total), 2);

    if (airdropAmount === 0)
      return {
        status: 'passed',
        message: 'Wallet is not eligible for airdrop',
        tgMessage: 'Wallet is not eligible for airdrop',
      };

    // * Check if already registered
    if (accountResponse.confirmSocialRegistered) {
      this.accountInfo = await this.entityManager.updateAccountInfo(
        {
          airdropAmount,
          airdropRegistered: true,
        },
        true
      );

      const resultMessage = `Already registered for airdrop! Allocation: ${airdropAmount} $SOMI`;

      return {
        status: 'passed',
        message: resultMessage,
        tgMessage: resultMessage,
      };
    }

    // * Connect account to complete registration
    const connectResponse = await this.connectAccount();
    if (connectResponse?.jwtToken) {
      this.jwtToken = connectResponse.jwtToken;
    }

    // * Verify registration was successful
    accountResponse = await this.getAccountInfo();
    if (!accountResponse.confirmSocialRegistered) {
      throw new Error('Failed to complete social registration | confirmSocialRegistered is still false');
    }

    // * Update account info
    this.accountInfo = await this.entityManager.updateAccountInfo(
      {
        airdropAmount,
        airdropRegistered: true,
      },
      true
    );

    const resultMessage = `Registration completed! Airdrop amount: ${airdropAmount} $SOMI`;

    return {
      status: 'success',
      message: resultMessage,
      tgMessage: resultMessage,
    };
  }

  public async makeEligibilityCheckHandler(): Promise<TransactionCallbackReturn> {
    // * Check eligibility
    const eligibilityResponse = await this.checkEligibility();
    if (!eligibilityResponse?.total)
      throw new Error('Eligibility data not found | ' + JSON.stringify(eligibilityResponse));

    const airdropAmount = truncateToDecimal(Number(eligibilityResponse.total), 2);

    if (airdropAmount === 0)
      return {
        status: 'passed',
        message: 'Wallet is not eligible for airdrop',
        tgMessage: 'Wallet is not eligible for airdrop',
      };

    // * Update account info with eligibility data
    this.accountInfo = await this.entityManager.updateAccountInfo(
      {
        airdropAmount,
      },
      true
    );

    const resultMessage = `Airdrop amount: ${airdropAmount} $SOMI`;

    return {
      status: 'success',
      message: resultMessage,
      tgMessage: resultMessage,
    };
  }

  public async initialize(): Promise<void> {
    // * Get the account info
    this.accountInfo = await this.entityManager.getAccountInfo();

    this.cookieManager = new CookieManager();

    await this.getCookie();
  }

  private async checkEligibility(): Promise<EligibilityResponse> {
    const config = await this.axiosConfig();

    const response = await axios.get<EligibilityResponse>(
      `https://register.somnia.network/api/eligibility?address=${this.client.walletAddress}`,
      config
    );

    return response.data;
  }

  private async sendWalletAuth(signature: string): Promise<WalletAuthResponse> {
    const config = await this.axiosConfig();

    const response = await axios.post<WalletAuthResponse>(
      'https://register.somnia.network/api/account/wallet',
      {
        address: this.client.walletAddress,
        signature,
        chainId: this.client.chainData.id,
      },
      config
    );

    return response.data;
  }

  private async getAccountInfo(): Promise<AccountResponse> {
    const config = await this.axiosConfig({ authorization: true });

    const response = await axios.get<AccountResponse>('https://register.somnia.network/api/account', config);

    return response.data;
  }

  private async connectAccount(): Promise<ConnectResponse> {
    const config = await this.axiosConfig({ authorization: true });

    const response = await axios.post<ConnectResponse>(
      'https://register.somnia.network/api/account/connect',
      {
        confirmSocialRegistered: true,
      },
      config
    );

    return response.data;
  }

  private async getMessageTosSign(): Promise<string> {
    const config = await this.axiosConfig();

    const response = await axios.get<{ message: string }>(
      `https://register.somnia.network/api/message/tos?address=${this.client.walletAddress}`,
      config
    );

    if (!response.data?.message) throw new Error('Cannot get message to sign');

    return response.data?.message;
  }

  private async getRedirectUrlForCookie(): Promise<string> {
    const config = await this.axiosConfig();

    const response = await axios.get(
      'https://ip-info-api.clique.tech/ip/set-cookie?appId=somnia&redirectUrl=https%3A%2F%2Fregister.somnia.network%2Fflow',
      { ...config, maxRedirects: 0 }
    );

    const parsedResponse = parseResponse(response);

    return parsedResponse.redirectLocation!;
  }

  private async getCookie(): Promise<void> {
    const redirectUrl = await this.getRedirectUrlForCookie();

    if (!redirectUrl) throw new Error('cannot find redirect url');

    const config = await this.axiosConfig();
    const response = await axios.get(redirectUrl, { ...config, maxRedirects: 0 });

    const parsedResponse = parseResponse(response);

    this.cookieManager.editCookie(parsedResponse.cookies);

    const clqIpToken = this.cookieManager.getCookieByName('clqIpToken');
    if (!clqIpToken) {
      throw new Error('cannot find clqIpToken cookies');
    } else {
      this.cookieManager = new CookieManager();
      this.cookieManager.editCookie([{ name: 'clqIpToken', value: clqIpToken.value }]);
    }
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

    const headers: StringRecord = {
      cookie: this.cookieManager.rawCookies,
    };

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

export const clearSomniaAirdropStatistic = async (dbSource: DataSource, jsonWallets?: WalletData[]) => {
  if (!jsonWallets) return;
  const repo = dbSource.getRepository(SomniaAirdropEntity);
  const existingEntities = await repo.find();
  const existingMap = new Map<string, SomniaAirdropEntity>(
    existingEntities.map((entity) => [entity.walletAddress.toLowerCase(), entity])
  );

  for (const [walletAddress, entity] of existingMap) {
    const stillExists = jsonWallets.some((wallet) => wallet.walletAddress.toLowerCase() === walletAddress);
    if (stillExists) continue;
    await repo.delete(entity.id);
  }
};

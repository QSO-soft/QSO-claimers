import {
  Chain,
  createPublicClient,
  createWalletClient,
  fallback,
  FallbackTransport,
  formatEther,
  Hex,
  http,
  HttpTransport,
  PublicClient,
  TransactionReceipt,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

import settings from '../_inputs/settings/settings';
import {
  convertPrivateKey,
  decimalToInt,
  getAllRpcs,
  getExplorerLinkByNetwork,
  getGasOptions,
  getRandomBigInt,
  getRpc,
  sleepByRange,
} from '../helpers';
import { LoggerType } from '../logger';
import { Balance, Networks, NumberRange, SupportedNetworks, TokenContract } from '../types';
import { defaultTokenAbi } from './abi';
import { WalletClient } from './common';

const WAIT_TX_ERROR_MESSAGE = 'Transaction sent to the blockchain, but received an error with status';

const TRANSPORT_RETRY_CONFIG = {
  // retryCount: 3,
  // retryDelay: 100,
};
const WAIT_TX_CONFIG = {
  pollingInterval: 30000,
  timeout: 90000,
  // retryDelay: 1000,
  // retryCount: 10,
};

export class DefaultClient {
  privateKey: Hex;
  walletAddress: Hex;
  rpcs: string[];
  publicClient: PublicClient;
  walletClient: WalletClient;
  chainData: Chain;
  logger: LoggerType;
  network: Networks;
  currentRpc: string;
  explorerLink: string;

  constructor(privateKey: string, chainData: Chain, logger: LoggerType, network: Networks) {
    this.logger = logger;
    this.chainData = chainData;
    this.privateKey = convertPrivateKey(privateKey);
    this.network = network;
    this.explorerLink = getExplorerLinkByNetwork(network);
    this.rpcs = getAllRpcs(network);
    this.currentRpc = getRpc(network);
    this.walletClient = this.getWalletClient();
    this.publicClient = this.getPublicClient();
    this.walletAddress = this.walletClient.account.address;
  }

  public getTransport(rpc: string, index = 0): HttpTransport {
    return http(rpc, {
      batch: true,
      fetchOptions: {
        // signal: AbortSignal.timeout(BASE_TIMEOUT),
      },
      key: `${this.chainData.name}-${index}`,
      // timeout: BASE_TIMEOUT,
      ...TRANSPORT_RETRY_CONFIG,
    });
  }
  public getFallbackTransport(): FallbackTransport {
    const currentRpcs =
      this.rpcs?.sort((prev, cur) => {
        if (prev === this.currentRpc) {
          return -1;
        }
        if (cur === this.currentRpc) {
          return 1;
        }

        return 0;
      }) || [];
    const transports = currentRpcs.map((rpc, index) => this.getTransport(rpc, index));

    return fallback(transports, TRANSPORT_RETRY_CONFIG);
  }

  private getPublicClient(): PublicClient {
    return createPublicClient({ chain: this.chainData, transport: this.getTransport(this.currentRpc) });
  }

  private getWalletClient(): WalletClient {
    return createWalletClient({
      chain: this.chainData,
      account: privateKeyToAccount(this.privateKey),
      transport: this.getTransport(this.currentRpc),
    });
  }

  async getNativeBalance(): Promise<Balance> {
    const weiBalance = (await this.publicClient.getBalance({ address: this.walletAddress })) || 0n;
    const intBalance = Number(formatEther(weiBalance));
    const decimals = this.chainData.nativeCurrency.decimals;

    return { wei: weiBalance, int: intBalance, decimals };
  }

  async getDecimalsByContract(contractInfo: TokenContract): Promise<number> {
    return (await this.publicClient.readContract({
      address: contractInfo.address,
      abi: contractInfo.abi,
      functionName: 'decimals',
    })) as number;
  }
  async getBalanceByContract(contractInfo: TokenContract): Promise<Balance> {
    const weiBalance = (await this.publicClient.readContract({
      address: contractInfo.address,
      abi: contractInfo.abi,
      functionName: 'balanceOf',
      args: [this.walletAddress],
    })) as bigint;

    const decimals = await this.getDecimalsByContract(contractInfo);
    const intBalance = decimalToInt({ amount: weiBalance, decimals });

    return { wei: weiBalance, int: intBalance, decimals };
  }

  async getNativeOrContractBalance(isNativeContract: boolean, contractInfo?: TokenContract): Promise<Balance> {
    return isNativeContract ? await this.getNativeBalance() : await this.getBalanceByContract(contractInfo!);
  }

  async getNativeOrContractSymbol(isNativeContract: boolean, contractInfo?: TokenContract): Promise<string> {
    return isNativeContract ? this.chainData.nativeCurrency.symbol : await this.getSymbolByContract(contractInfo!);
  }

  async getSymbolByContract(contractInfo: TokenContract): Promise<string> {
    return (await this.publicClient.readContract({
      address: contractInfo.address,
      abi: contractInfo.abi,
      functionName: 'symbol',
    })) as string;
  }

  async approve(
    tokenContract: Hex,
    projectContract: Hex,
    amount: bigint,
    gweiRange?: NumberRange,
    gasLimitRange?: NumberRange
  ) {
    const randomAmount = getRandomBigInt([
      3000000000000000000000n,
      115792089237316195423570985008687907853269984665640564039457n,
    ]);

    const allowanceAmount = await this.publicClient.readContract({
      address: tokenContract,
      abi: defaultTokenAbi,
      functionName: 'allowance',
      args: [this.walletAddress, projectContract],
    });

    if (allowanceAmount < amount) {
      this.logger.info('Starting an approve transaction');
      const feeOptions = await getGasOptions({
        gweiRange,
        gasLimitRange,
        network: this.network as SupportedNetworks,
        publicClient: this.publicClient,
      });
      const txHash = await this.walletClient.writeContract({
        address: tokenContract,
        abi: defaultTokenAbi,
        functionName: 'approve',
        args: [projectContract, randomAmount],
        ...feeOptions,
      });

      await this.waitTxReceipt(txHash);

      if (txHash) {
        this.logger.success('Approve transaction was confirmed');
      }
    } else {
      this.logger.info(`Contract was already approved for ${allowanceAmount}`);
    }
  }

  async waitTxReceipt(txHash: Hex): Promise<TransactionReceipt | void> {
    try {
      await sleepByRange(settings.delay.beforeTxReceipt);

      const txReceipt = await this.publicClient.waitForTransactionReceipt({
        hash: txHash,
        ...WAIT_TX_CONFIG,
      });

      if (!txReceipt.transactionHash) {
        throw new Error('transactionHash was not found');
      }

      if (txReceipt.status !== 'success') {
        throw new Error(`${WAIT_TX_ERROR_MESSAGE} [${txReceipt.status}]`);
      }

      return txReceipt;
    } catch (err) {
      const errMessage = (err as Error).message;

      if (errMessage.includes(WAIT_TX_ERROR_MESSAGE)) {
        throw err;
      }

      this.logger.warning(`Unable to wait for txReceipt: ${errMessage}`);
      return;
    }
  }
}

export type DefaultClientClass = new (decryptedPrivKey: string, logger: LoggerType) => DefaultClient;

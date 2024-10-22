import {
  Chain,
  ContractFunctionExecutionError,
  createPublicClient,
  createWalletClient,
  fallback,
  FallbackTransport,
  formatEther,
  Hex,
  http,
  HttpTransport,
  InvalidParamsRpcError,
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
  sleep,
  sleepByRange,
} from '../helpers';
import { LoggerType } from '../logger';
import { Balance, Networks, NumberRange, SupportedNetworks, TokenContract } from '../types';
import { defaultTokenAbi } from './abi';
import { WalletClient } from './common';

const WAIT_TX_ERROR_MESSAGE = 'Transaction sent to the blockchain, but received an error with status';
const WAIT_TX_TIMEOUT = 'Timed out while waiting for transaction';
const WAIT_TX_BLOCK_ERROR = 'The Transaction may not be processed on a block yet';

const TRANSPORT_RETRY_CONFIG = {
  // retryCount: 3,
  // retryDelay: 100,
};
const WAIT_TX_CONFIG = {
  pollingInterval: 30000,
  timeout: 200000,
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
      } as any,
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
    const weiBalance = await this.publicClient.getBalance({ address: this.walletAddress });
    const intBalance = Number(formatEther(weiBalance));
    const decimals = this.chainData.nativeCurrency.decimals;

    return { wei: weiBalance, int: intBalance, decimals };
  }

  async getDecimalsByContract(contractInfo: TokenContract, attempt = 3): Promise<number> {
    try {
      return (await this.publicClient.readContract({
        address: contractInfo.address,
        abi: contractInfo.abi,
        functionName: 'decimals',
      })) as number;
    } catch (e) {
      if (e instanceof ContractFunctionExecutionError) {
        if (attempt > 0) {
          await sleep(0.3);
          return this.getDecimalsByContract(contractInfo, attempt - 1);
        }

        throw new Error(`Unable to get balance successfully. Please try to change RPC for ${this.network}`);
      }
      throw e;
    }
  }
  async getJustBalanceByContract(contractInfo: TokenContract, attempt = 3): Promise<bigint> {
    try {
      return (await this.publicClient.readContract({
        address: contractInfo.address,
        abi: contractInfo.abi,
        functionName: 'balanceOf',
        args: [this.walletAddress],
      })) as bigint;
    } catch (e) {
      if (e instanceof ContractFunctionExecutionError) {
        if (attempt > 0) {
          await sleep(0.3);
          return this.getJustBalanceByContract(contractInfo, attempt - 1);
        }

        throw new Error(`Unable to get balance successfully. Please try to change RPC for ${this.network}`);
      }
      throw e;
    }
  }
  async getBalanceByContract(contractInfo: TokenContract): Promise<Balance> {
    const weiBalance = await this.getJustBalanceByContract(contractInfo);

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
      30000000000000000000000n,
      115792089237316195423570985008687907853269984665640564039457n,
    ]);

    const allowanceAmount = await this.publicClient.readContract({
      address: tokenContract,
      abi: defaultTokenAbi,
      functionName: 'allowance',
      args: [this.walletAddress, projectContract],
    });

    if (allowanceAmount === 0n || allowanceAmount < amount) {
      this.logger.info('Starting an approve transaction...');
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

      const waitedTx = await this.waitTxReceipt(txHash);

      if (waitedTx) {
        this.logger.success(`Check approve transaction - ${this.explorerLink}/tx/${txHash}`);

        await sleepByRange(settings.delay.betweenTransactions, {}, this.logger);
      } else {
        throw new Error('Approve failed');
      }
    } else {
      const allowanceMsg = `${allowanceAmount}`.length >= 30 ? 'INFINITE' : allowanceAmount;
      this.logger.info(`Contract was already approved for ${allowanceMsg}`);
    }
  }

  async waitTxReceipt(txHash: Hex): Promise<TransactionReceipt | void> {
    const unableToWaitMsg = 'Unable to wait for txReceipt:';
    const txHashWasntFoundMsg = 'Transaction hash was not found';
    let shouldCheckTx = false;

    try {
      await sleepByRange(settings.delay.beforeTxReceipt);

      const txReceipt = await this.publicClient.waitForTransactionReceipt({
        hash: txHash,
        ...WAIT_TX_CONFIG,
      });

      if (!txReceipt?.transactionHash) {
        throw new Error(txHashWasntFoundMsg);
      }

      if (txReceipt.status !== 'success') {
        throw new Error(`${WAIT_TX_ERROR_MESSAGE} [${txReceipt.status}]`);
      }

      return txReceipt;
    } catch (err) {
      const errMessage = (err as Error).message;

      if (errMessage.includes(WAIT_TX_TIMEOUT) || errMessage.includes(WAIT_TX_BLOCK_ERROR)) {
        shouldCheckTx = true;
      } else {
        throw err;
      }

      // this.logger.warning(`${unableToWaitMsg} ${errMessage}`);
    }

    if (!shouldCheckTx) return;

    await sleepByRange(settings.delay.beforeTxReceipt);

    const maxAttempts = 50;
    let waitAttempt = 0;
    let txReceipt;
    while (!txReceipt && waitAttempt < maxAttempts) {
      try {
        const tx = await this.publicClient.getTransaction({ hash: txHash });
        if (!tx) {
          throw new Error('Unable to wait for transaction: transaction not found');
        }

        txReceipt = await this.publicClient.getTransactionReceipt({ hash: txHash });
      } catch (err) {
        if (err instanceof InvalidParamsRpcError) {
          throw new Error('Unable to wait for transaction: hash not found');
        }

        await sleep(waitAttempt > 50 ? 1 : 0.5);
        waitAttempt++;
      }
    }

    if (!txReceipt?.transactionHash) {
      throw new Error(txHashWasntFoundMsg);
    }

    if (txReceipt.status !== 'success') {
      throw new Error(`${WAIT_TX_ERROR_MESSAGE} [${txReceipt.status}]`);
    }

    return;
  }
}

import {
  decimalToInt,
  getGasOptions,
  getTrimmedLogsAmount,
  intToDecimal,
  TransactionCallbackParams,
  TransactionCallbackReturn,
  transactionWorker,
} from '../../../../helpers';
import { Tokens, TransformedModuleParams } from '../../../../types';
import { abi, CONTRACT } from './constants';

export const execMakeDelegateRegistry = async (params: TransformedModuleParams) =>
  transactionWorker({
    ...params,
    startLogMessage: 'Execute make delegate registry...',
    transactionCallback: makeDelegateRegistry,
  });

const makeDelegateRegistry = async (params: TransactionCallbackParams): TransactionCallbackReturn => {
  const { client, logger, wallet, network, gweiRange, gasLimitRange } = params;
  const { walletAddress, delegateToAddress } = wallet;
  const {
    explorerLink,
    walletClient,
    publicClient,
    chainData: {
      nativeCurrency: { decimals, symbol },
    },
  } = client;

  if (!delegateToAddress) {
    return {
      status: 'error',
      message: 'Please provide delegateToAddress to delegate-wallets.csv',
    };
  }

  const rights = '0x0000000000000000000000000000000000000000000000000000000000000000';
  const isAlreadyDelegated = await publicClient.readContract({
    address: CONTRACT,
    abi,
    functionName: 'checkDelegateForAll',
    args: [delegateToAddress, walletAddress, rights],
  });
  if (isAlreadyDelegated) {
    return {
      status: 'passed',
      message: 'Already delegated',
    };
  }

  const feeOptions = await getGasOptions({
    gweiRange,
    gasLimitRange,
    network,
    publicClient,
  });

  const args = [delegateToAddress, rights, true];
  let fee = 0n;
  if (network === 'eth') {
    fee = intToDecimal({
      amount: 0.005,
      decimals,
    });
  }
  if (network === 'polygon') {
    fee = intToDecimal({
      amount: 1,
      decimals,
    });
  }
  if (network === 'bsc') {
    fee = intToDecimal({
      amount: 0.01,
      decimals,
    });
  }
  if (!fee) {
    const gasPrice = await publicClient.getGasPrice();
    const maxPriorityFeePerGas = (await publicClient.estimateMaxPriorityFeePerGas()) || BigInt(1e9);
    const contractGas = await publicClient.estimateContractGas({
      address: CONTRACT,
      abi,
      functionName: 'delegateAll',
      args,
      ...feeOptions,
    });

    const feeGasPathBigInt = Number(contractGas * (gasPrice + maxPriorityFeePerGas)) * 0.2;
    const feeGasPath = +feeGasPathBigInt.toFixed(0) / 10 ** decimals;
    const feeInt = +feeGasPath.toFixed(5);

    fee = intToDecimal({ amount: feeInt, decimals });
  }

  logger.info(
    `Delegating from ${walletAddress} to ${delegateToAddress} with value [${getTrimmedLogsAmount(
      decimalToInt({
        amount: fee,
        decimals,
      }),
      symbol as Tokens
    )}]...`
  );

  const txHash = await walletClient.writeContract({
    address: CONTRACT,
    abi,
    functionName: 'delegateAll',
    args,
    value: fee,
    ...feeOptions,
  });

  const resMsg = `Delegated registry ${walletAddress} > ${delegateToAddress} in ${network}`;

  return {
    status: 'success',
    tgMessage: resMsg,
    txHash,
    explorerLink,
  };
};

import {
  calculateAmount,
  decimalToInt,
  getGasOptions,
  getTrimmedLogsAmount,
  TransactionCallbackParams,
  TransactionCallbackReturn,
  transactionWorker,
} from '../../../../helpers';
import { TransformedModuleParams } from '../../../../types';

export const execMakeElixirWithdraw = async (params: TransformedModuleParams) =>
  transactionWorker({
    ...params,
    startLogMessage: 'Execute make Elixir withdraw ETH...',
    transactionCallback: makeElixirWithdraw,
  });

const CONTRACT = '0x4265f5D6c0cF127d733EeFA16D66d0df4b650D53';
const abi = [
  {
    type: 'function',
    inputs: [
      {
        name: 'user',
        internalType: 'address',
        type: 'address',
      },
    ],
    name: 'unusedBalance',
    outputs: [
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
      },
    ],
    name: 'withdrawEth',
    outputs: [],
    stateMutability: 'nonpayable',
  },
];
const makeElixirWithdraw = async (params: TransactionCallbackParams): TransactionCallbackReturn => {
  const { client, minTokenBalance, usePercentBalance, minAndMaxAmount, logger, gweiRange, gasLimitRange, network } =
    params;

  const { walletClient, publicClient, explorerLink, walletAddress } = client;

  const token = 'ETH';
  const depositedBalanceWei = (await publicClient.readContract({
    address: CONTRACT,
    abi,
    functionName: 'unusedBalance',
    args: [walletAddress],
  })) as bigint;
  const depositedBalanceInt = decimalToInt({ amount: depositedBalanceWei });
  const logDepositedBalance = getTrimmedLogsAmount(depositedBalanceInt, token);

  if (minTokenBalance && depositedBalanceInt < minTokenBalance) {
    return {
      status: 'passed',
      message: `Deposited balance [${logDepositedBalance}] is lower than minTokenBalance [${minTokenBalance} ${token}]`,
    };
  }

  const amountWei = calculateAmount({
    balance: depositedBalanceWei,
    isBigInt: true,
    minAndMaxAmount,
    usePercentBalance,
  });

  const amountInt = decimalToInt({ amount: amountWei });
  const logAmount = getTrimmedLogsAmount(amountInt, token);

  logger.info(`Withdrawing [${logAmount}]...`);

  const feeOptions = await getGasOptions({
    gweiRange,
    gasLimitRange,
    network,
    publicClient,
  });

  const txHash = await walletClient.writeContract({
    address: CONTRACT,
    abi,
    functionName: 'withdrawEth',
    args: [amountWei],
    ...feeOptions,
  });

  await client.waitTxReceipt(txHash);

  return {
    status: 'success',
    txHash,
    explorerLink,
    tgMessage: `Withdrawn [${logAmount}]`,
  };
};

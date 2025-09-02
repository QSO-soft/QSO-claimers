import { Hex } from 'viem';
import { english, generateMnemonic, mnemonicToAccount } from 'viem/accounts';

import { defaultTokenAbi } from '../../clients/abi';
import { SECOND_ADDRESS_EMPTY_ERROR } from '../../constants';
import {
  calculateAmount,
  decimalToInt,
  getCurrentBalanceByContract,
  getCurrentSymbolByContract,
  getGasOptions,
  getRandomItemFromArray,
  getRandomNumber,
  getTrimmedLogsAmount,
  intToDecimal,
  TransactionCallbackParams,
  TransactionCallbackReturn,
  transactionWorker,
} from '../../helpers';
import { Tokens, TransformedModuleParams } from '../../types';

export const makeTransferToken = async (params: TransactionCallbackParams): TransactionCallbackReturn => {
  const {
    gweiRange,
    gasLimitRange,
    minAndMaxAmount,
    usePercentBalance,
    wallet,
    client,
    network,
    contractAddress,
    logger,
    minTokenBalance,
    balanceToLeft,
    minAmount,
    dbSource,
  } = params;
  const { walletClient, explorerLink, publicClient, walletAddress } = client;
  const { transferAddress: transferAddressProp } = wallet;
  const transferMode: string = 'default';
  const transferAmount = 0;

  let transferAddress = transferAddressProp;

  if (transferMode === 'self') {
    transferAddress = wallet.walletAddress;

    logger.info('Transfer tokens to myself');
  } else if (transferMode === 'random') {
    const mnemonic = generateMnemonic(english);
    const account = mnemonicToAccount(mnemonic);

    transferAddress = account.address;

    logger.info(`Transfer tokens to random address [${transferAddress}]`);
  } else {
    if (!transferAddressProp) {
      return {
        status: 'critical',
        message: SECOND_ADDRESS_EMPTY_ERROR,
      };
    }
    if (transferAddressProp.includes('|')) {
      const transferAddresses = transferAddressProp
        .split('|')
        .filter((transferAddress) => transferAddress && transferAddress.toLowerCase() !== walletAddress.toLowerCase());

      if (!transferAddresses.length) {
        return {
          status: 'critical',
          message: SECOND_ADDRESS_EMPTY_ERROR,
        };
      }

      transferAddress = getRandomItemFromArray(transferAddresses);
    }

    logger.info(`Transfer tokens to transferAddress [${transferAddress}]`);
  }

  const {
    wei: weiBalance,
    int: intBalance,
    decimals,
    isNativeContract,
  } = await getCurrentBalanceByContract({ client, contractAddress });

  const { symbol } = await getCurrentSymbolByContract({ client, contractAddress });
  const tokenSymbol = symbol as Tokens;

  if (intBalance < minTokenBalance) {
    return {
      status: 'passed',
      message: `Balance ${getTrimmedLogsAmount(
        intBalance,
        tokenSymbol
      )} in ${network} is lower than minTokenBalance ${minTokenBalance}`,
    };
  }

  let amount = calculateAmount({
    balance: weiBalance,
    minAndMaxAmount: transferAmount ? [+transferAmount, +transferAmount] : minAndMaxAmount,
    usePercentBalance: transferAmount ? false : usePercentBalance,
    decimals,
    isBigInt: true,
  });

  if (!transferAmount) {
    if (balanceToLeft && balanceToLeft[0] && balanceToLeft[1]) {
      const balanceToLeftInt = getRandomNumber(balanceToLeft);

      const balanceToLeftWei = intToDecimal({
        amount: balanceToLeftInt,
        decimals,
      });

      amount = weiBalance - balanceToLeftWei;

      if (intBalance - balanceToLeftInt <= 0) {
        return {
          status: 'error',
          message: `Balance is ${getTrimmedLogsAmount(
            intBalance,
            tokenSymbol
          )} that is lower than balance to left ${getTrimmedLogsAmount(balanceToLeftInt, tokenSymbol)}`,
        };
      }
    }
  }

  const amountInt = decimalToInt({
    amount,
    decimals,
  });
  const logCalculatedAmount = `${getTrimmedLogsAmount(amountInt, tokenSymbol)}`;

  if (minAmount && amount < minAmount) {
    return {
      status: 'warning',
      message: `Calculated amount [${logCalculatedAmount}] is lower than provided minAmount [${minAmount}]`,
    };
  }

  let txHash;

  const feeOptions = await getGasOptions({
    gweiRange,
    gasLimitRange,
    network,
    publicClient,
  });

  const transferMsg = `Transferring [${logCalculatedAmount}] in ${network} to [${transferAddress}]...`;
  if (isNativeContract) {
    const gasPrice = await publicClient.getGasPrice();

    const { maxFeePerGas } = await publicClient.estimateFeesPerGas();
    const gasLimit = await publicClient.estimateGas({
      account: walletAddress,
      to: transferAddress as Hex,
      value: amount,
      data: '0x',
      // ...feeOptions,
    });

    let value = amount;

    if (usePercentBalance) {
      value = amount - (gasLimit * maxFeePerGas * 15n) / 10n;

      if (network === 'eth') {
        value = amount - gasLimit * maxFeePerGas;
      }
      if (network === 'optimism') {
        value = amount - gasPrice * maxFeePerGas;
      }

      if (value <= 0n) {
        value = amount;
      }
    }

    logger.info(transferMsg);

    txHash = await walletClient.sendTransaction({
      to: transferAddress as Hex,
      value,
      data: '0x',
      ...feeOptions,
    });
  } else {
    logger.info(transferMsg);

    txHash = await walletClient.writeContract({
      address: contractAddress as Hex,
      abi: defaultTokenAbi,
      functionName: 'transfer',
      args: [transferAddress as Hex, amount],
      ...feeOptions,
    });
  }

  await client.waitTxReceipt(txHash);

  const resMsg = `Transferred ${logCalculatedAmount} to ${
    transferMode === 'self'
      ? 'myself'
      : transferMode === 'random'
      ? 'random address ' + transferAddress
      : transferAddress
  } | ${network}`;

  return {
    txHash,
    explorerLink,
    status: 'success',
    tgMessage: resMsg,
  };
};

export const execMakeTransferToken = async (params: TransformedModuleParams) =>
  transactionWorker({
    ...params,
    startLogMessage: `Execute make transfer tokens by contract [${params.contractAddress}]...`,
    transactionCallback: makeTransferToken,
  });

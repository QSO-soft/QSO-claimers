import { Hex } from 'viem';

import {
  CLAIM_STATUSES,
  CLAIM_TX_NOT_FOUND,
  DB_NOT_CONNECTED,
  SECOND_ADDRESS_EMPTY_ERROR,
  ZERO_TRANSFER_AMOUNT,
} from '../../../../constants';
import {
  calculateAmount,
  decimalToInt,
  getAxiosConfig,
  getGasOptions,
  getHeaders,
  getRandomNumber,
  getTrimmedLogsAmount,
  intToDecimal,
  TransactionCallbackParams,
  TransactionCallbackReturn,
  transactionWorker,
} from '../../../../helpers';
import { TransformedModuleParams } from '../../../../types';
import { SomniaAirdropEntity } from '../../db/entities';
import { formatErrMessage, getCheckClaimMessage } from '../../utils';
import { HEADERS } from './constants';
import { getProofData } from './helpers';

export const execMakeTransferClaimSomnia = async (params: TransformedModuleParams) =>
  transactionWorker({
    ...params,
    startLogMessage: 'Execute make transfer claimed SOMI...',
    transactionCallback: makeTransferClaimSomnia,
  });

const makeTransferClaimSomnia = async (params: TransactionCallbackParams): TransactionCallbackReturn => {
  const {
    client,
    dbSource,
    minAndMaxAmount,
    usePercentBalance,
    wallet,
    gweiRange,
    gasLimitRange,
    network,
    logger,
    proxyAgent,
    balanceToLeft,
    minTokenBalance,
  } = params;

  const { walletClient, walletAddress, publicClient, explorerLink } = client;

  let currentBalance = 0;
  let amountInt = 0;
  if (!dbSource) {
    return {
      status: 'critical',
      message: DB_NOT_CONNECTED,
    };
  }

  const dbRepo = dbSource.getRepository(SomniaAirdropEntity);

  let walletInDb = await dbRepo.findOne({
    where: {
      walletId: wallet.id,
      index: wallet.index,
    },
  });
  if (walletInDb) {
    await dbRepo.remove(walletInDb);
  }

  const headers = getHeaders(HEADERS);
  const config = await getAxiosConfig({
    proxyAgent,
    headers,
  });
  const dataProps = {
    network,
    config,
    walletAddress,
    chainId: client.chainData.id,
  };

  // const finalRes = await getFinalData(dataProps);

  const created = dbRepo.create({
    walletId: wallet.id,
    index: wallet.index,
    walletAddress,
    network,
    status: 'New',
    // score: finalRes.total,
  });
  walletInDb = await dbRepo.save(created);

  try {
    const results = await getProofData(dataProps);

    if (!results.allocation || !BigInt(results.allocation)) {
      await dbRepo.update(walletInDb.id, {
        status: CLAIM_STATUSES.NOT_ELIGIBLE,
      });

      return {
        status: 'passed',
        message: getCheckClaimMessage(CLAIM_STATUSES.NOT_ELIGIBLE),
      };
    }

    const amountWei = BigInt(results.allocation);
    amountInt = decimalToInt({
      amount: amountWei,
      decimals: 18,
    });

    const { int: currentBalanceInt, wei: currentBalanceWei } = await client.getNativeBalance();
    currentBalance = currentBalanceInt;

    if (!currentBalance) {
      await dbRepo.update(walletInDb.id, {
        status: CLAIM_STATUSES.NOT_CLAIMED,
        claimAmount: amountInt,
        balance: currentBalance,
      });

      const status = getCheckClaimMessage(CLAIM_STATUSES.NOT_CLAIMED);

      return {
        status: 'passed',
        message: status,
        tgMessage: `${status} | Amount: ${amountInt}`,
      };
    }

    if (currentBalance === 0) {
      await dbRepo.update(walletInDb.id, {
        status: CLAIM_STATUSES.CLAIMED_AND_SENT,
        claimAmount: amountInt,
        balance: currentBalance,
      });

      const status = getCheckClaimMessage(CLAIM_STATUSES.CLAIMED_AND_SENT);

      return {
        status: 'passed',
        message: status,
        tgMessage: `${status} | Amount: ${amountInt}`,
      };
    }

    const transferAddress = wallet.transferAddress;
    if (!transferAddress) {
      throw new Error(SECOND_ADDRESS_EMPTY_ERROR);
    }

    logger.info(`Transferring [${getTrimmedLogsAmount(currentBalanceInt, 'SOMI')}}] to ${wallet.transferAddress}...`);

    const feeOptions = await getGasOptions({
      gweiRange,
      gasLimitRange,
      network,
      publicClient,
    });

    let amountToTransfer = calculateAmount({
      balance: currentBalanceWei,
      isBigInt: true,
      minAndMaxAmount,
      usePercentBalance,
      decimals: 18,
    });

    if (balanceToLeft && balanceToLeft[0] && balanceToLeft[1]) {
      const balanceToLeftInt = getRandomNumber(balanceToLeft);

      const balanceToLeftWei = intToDecimal({
        amount: balanceToLeftInt,
        decimals: 18,
      });

      amountToTransfer = currentBalanceWei - balanceToLeftWei;

      if (currentBalanceInt - balanceToLeftInt <= 0) {
        return {
          status: 'warning',
          message: `Balance is ${getTrimmedLogsAmount(
            currentBalanceInt,
            'SOMI'
          )}  that is lower than balance to left ${getTrimmedLogsAmount(balanceToLeftInt, 'SOMI')}`,
        };
      }
    }

    const amountToTransferInt = decimalToInt({
      amount: amountToTransfer,
      decimals: 18,
    });
    if (amountToTransferInt < minTokenBalance) {
      return {
        status: 'passed',
        message: `Balance [${getTrimmedLogsAmount(
          amountToTransferInt,
          'SOMI'
        )}] in ${network} is lower than minTokenBalance ${minTokenBalance}`,
      };
    }

    const gasPrice = await publicClient.getGasPrice();

    const { maxFeePerGas } = await publicClient.estimateFeesPerGas();
    const gasLimit = await publicClient.estimateGas({
      account: walletAddress,
      to: transferAddress as Hex,
      value: amountWei,
      data: '0x',
      // ...feeOptions,
    });

    let value = amountWei;

    if (usePercentBalance) {
      value = amountWei - (gasLimit * maxFeePerGas * 15n) / 10n;

      if (network === 'eth') {
        value = amountWei - gasLimit * maxFeePerGas;
      }
      if (network === 'optimism') {
        value = amountWei - gasPrice * maxFeePerGas;
      }

      if (value <= 0n) {
        value = amountWei;
      }
    }

    logger.info(`Sending ${amountToTransferInt} SOMI to ${transferAddress}...`);

    const txHash = await walletClient.sendTransaction({
      to: transferAddress as Hex,
      value,
      data: '0x',
      ...feeOptions,
    });

    await client.waitTxReceipt(txHash);

    await dbRepo.update(walletInDb.id, {
      status: CLAIM_STATUSES.TRANSFER_SUCCESS,
      claimAmount: amountInt,
      balance: currentBalance - amountToTransferInt,
    });

    return {
      tgMessage: `Sent ${amountToTransferInt} SOMI to ${transferAddress}`,
      status: 'success',
      txHash,
      explorerLink,
      message: getCheckClaimMessage(CLAIM_STATUSES.TRANSFER_SUCCESS),
    };
  } catch (err) {
    const errMessage = formatErrMessage(err);
    await dbRepo.update(walletInDb.id, {
      status: CLAIM_STATUSES.TRANSFER_ERROR,
      balance: currentBalance,
      claimAmount: amountInt,
      error: errMessage,
    });

    if (errMessage === CLAIM_TX_NOT_FOUND || errMessage === ZERO_TRANSFER_AMOUNT) {
      return {
        status: 'warning',
        message: errMessage,
      };
    }

    throw err;
  }
};

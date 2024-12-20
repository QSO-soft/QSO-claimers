import axios from 'axios';
import { getAddress } from 'viem';

import { defaultTokenAbi } from '../../../../clients/abi';
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
  TransactionCallbackParams,
  TransactionCallbackReturn,
  transactionWorker,
} from '../../../../helpers';
import { TransformedModuleParams } from '../../../../types';
import { OdosClaimEntity } from '../../db/entities';
import { formatErrMessage, getCheckClaimMessage } from '../../utils';
import { HEADERS, TOKEN_CONTRACT } from './constants';
import { getBalance, getProofData, signIn } from './helpers';

export const execMakeTransferClaimOdos = async (params: TransformedModuleParams) =>
  transactionWorker({
    ...params,
    startLogMessage: 'Execute make transfer claimed ODOS...',
    transactionCallback: makeTransferClaimOdos,
  });

const makeTransferClaimOdos = async (params: TransactionCallbackParams): TransactionCallbackReturn => {
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
  } = params;

  const { walletClient, walletAddress, publicClient, explorerLink } = client;

  let nativeBalance = 0;
  let currentBalance = 0;
  let amountInt = 0;
  if (!dbSource) {
    return {
      status: 'critical',
      message: DB_NOT_CONNECTED,
    };
  }

  const dbRepo = dbSource.getRepository(OdosClaimEntity);

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

  const created = dbRepo.create({
    walletId: wallet.id,
    index: wallet.index,
    walletAddress,
    network,
    nativeBalance,
    status: 'New',
  });
  walletInDb = await dbRepo.save(created);

  try {
    const { int } = await client.getNativeBalance();
    nativeBalance = +int.toFixed(6);

    const proofRes = await getProofData(dataProps);
    if (!proofRes?.claim.amount || !proofRes?.signature) {
      await dbRepo.update(walletInDb.id, {
        status: CLAIM_STATUSES.NOT_ELIGIBLE,
      });

      return {
        status: 'passed',
        message: getCheckClaimMessage(CLAIM_STATUSES.NOT_ELIGIBLE),
      };
    }

    const amountWei = BigInt(proofRes.claim.amount);
    amountInt = decimalToInt({
      amount: amountWei,
    });

    const { currentBalance: currentBalanceInt, currentBalanceWei } = await getBalance(client);
    currentBalance = currentBalanceInt;

    const token = await signIn({
      walletAddress,
      walletClient,
      config,
    });
    const headers = getHeaders(HEADERS);
    const authConfig = await getAxiosConfig({
      proxyAgent,
      headers,
      token,
    });

    const { data: claimData } = await axios.get('https://api.odos.xyz/loyalty/me', authConfig);

    if (+claimData.claimableTokenBalance) {
      await dbRepo.update(walletInDb.id, {
        status: CLAIM_STATUSES.NOT_CLAIMED,
        claimAmount: amountInt,
        nativeBalance,
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
        nativeBalance,
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

    const feeOptions = await getGasOptions({
      gweiRange,
      gasLimitRange,
      network,
      publicClient,
    });

    const amountToTransfer = calculateAmount({
      balance: currentBalanceWei,
      isBigInt: true,
      minAndMaxAmount,
      usePercentBalance,
      decimals: 18,
    });

    const isEmptyAmount = amountToTransfer === 0n;

    if (isEmptyAmount) {
      await dbRepo.update(walletInDb.id, {
        status: CLAIM_STATUSES.CLAIMED_AND_SENT,
        claimAmount: amountInt,
        nativeBalance,
        balance: currentBalance,
      });

      return {
        status: 'passed',
        message: getCheckClaimMessage(CLAIM_STATUSES.CLAIMED_AND_SENT),
      };
    }

    const amountToTransferInt = decimalToInt({
      amount: amountToTransfer,
      decimals: 18,
    });
    logger.info(`Sending ${amountToTransferInt} ODOS to ${transferAddress}...`);

    const txHash = await walletClient.writeContract({
      address: TOKEN_CONTRACT,
      abi: defaultTokenAbi,
      functionName: 'transfer',
      args: [getAddress(transferAddress), amountToTransfer],
      ...feeOptions,
    });

    await client.waitTxReceipt(txHash);

    await dbRepo.update(walletInDb.id, {
      status: CLAIM_STATUSES.TRANSFER_SUCCESS,
      claimAmount: amountInt,
      nativeBalance,
      balance: currentBalance - amountToTransferInt,
    });

    return {
      tgMessage: `Sent ${amountToTransferInt} ODOS to ${transferAddress}`,
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
      nativeBalance,
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

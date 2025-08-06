import { parse as uuidParse } from 'uuid';
import { bytesToHex, getAddress } from 'viem';

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
import { GaiaClaimEntity } from '../../db/entities';
import { formatErrMessage, getCheckClaimMessage } from '../../utils';
import { ABI, CLAIM_CONTRACT, HEADERS, TOKEN_CONTRACT } from './constants';
import { getBalance, getProofData } from './helpers';

export const execMakeTransferClaimGaia = async (params: TransformedModuleParams) =>
  transactionWorker({
    ...params,
    startLogMessage: 'Execute make transfer claimed GAIA...',
    transactionCallback: makeTransferClaimGaia,
  });

const makeTransferClaimGaia = async (params: TransactionCallbackParams): TransactionCallbackReturn => {
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

  const dbRepo = dbSource.getRepository(GaiaClaimEntity);

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
    nativeBalance,
    status: 'New',
    // score: finalRes.total,
  });
  walletInDb = await dbRepo.save(created);

  try {
    const { int } = await client.getNativeBalance();
    nativeBalance = +int.toFixed(6);

    const proofRes = await getProofData(dataProps);
    const s1Proof = proofRes[0];

    if (!s1Proof?.amount || !s1Proof?.proof.length) {
      await dbRepo.update(walletInDb.id, {
        status: CLAIM_STATUSES.NOT_ELIGIBLE,
      });

      return {
        status: 'passed',
        message: getCheckClaimMessage(CLAIM_STATUSES.NOT_ELIGIBLE),
      };
    }

    amountInt = proofRes.reduce<number>((acc, cur) => {
      return (
        acc +
        decimalToInt({
          amount: BigInt(cur.amount),
          decimals: 18,
        })
      );
    }, 0);

    const { currentBalance: currentBalanceInt, currentBalanceWei } = await getBalance(client);
    currentBalance = currentBalanceInt;

    let hasUnclaimed = false;
    for (const proof of proofRes) {
      const campaignId = bytesToHex(uuidParse(proof.uuid));

      const claimedCurrentCampaing = (await publicClient.readContract({
        address: CLAIM_CONTRACT,
        abi: ABI,
        functionName: 'claimed',
        args: [campaignId, walletAddress],
      })) as bigint;

      if (!claimedCurrentCampaing) {
        hasUnclaimed = true;
      }
    }

    if (hasUnclaimed) {
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
    logger.info(`Sending ${amountToTransferInt} GAIA to ${transferAddress}...`);

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
      tgMessage: `Sent ${amountToTransferInt} GAIA to ${transferAddress}`,
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

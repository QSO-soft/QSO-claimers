import { parse as uuidParse } from 'uuid';
import { bytesToHex } from 'viem';

import { CLAIM_STATUSES, DB_NOT_CONNECTED } from '../../../../constants';
import {
  decimalToInt,
  getAxiosConfig,
  getHeaders,
  TransactionCallbackParams,
  TransactionCallbackReturn,
  transactionWorker,
} from '../../../../helpers';
import { TransformedModuleParams } from '../../../../types';
import { GaiaClaimEntity } from '../../db/entities';
import { formatErrMessage, getCheckClaimMessage } from '../../utils';
import { ABI, CLAIM_CONTRACT, HEADERS } from './constants';
import { getBalance, getProofData } from './helpers';

export const execMakeCheckClaimGaia = async (params: TransformedModuleParams) =>
  transactionWorker({
    ...params,
    startLogMessage: 'Execute make check claim GAIA...',
    transactionCallback: makeCheckClaimGaia,
  });

const makeCheckClaimGaia = async (params: TransactionCallbackParams): TransactionCallbackReturn => {
  const { client, dbSource, network, wallet, proxyAgent } = params;

  const { walletAddress, publicClient } = client;

  if (!dbSource) {
    return {
      status: 'critical',
      message: DB_NOT_CONNECTED,
    };
  }

  let nativeBalance = 0;
  let amountInt = 0;
  let currentBalance = 0;

  const dbRepo = dbSource.getRepository(GaiaClaimEntity);

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

  let walletInDb = await dbRepo.findOne({
    where: {
      walletId: wallet.id,
      index: wallet.index,
    },
  });

  if (walletInDb) {
    await dbRepo.remove(walletInDb);
  }

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

    const { currentBalance: currentBalanceInt } = await getBalance(client);
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

    if (!hasUnclaimed) {
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

      await dbRepo.update(walletInDb.id, {
        status: CLAIM_STATUSES.CLAIMED_NOT_SENT,
        claimAmount: amountInt,
        nativeBalance,
        balance: currentBalance,
      });

      const status = getCheckClaimMessage(CLAIM_STATUSES.CLAIMED_NOT_SENT);

      return {
        status: 'passed',
        message: status,
        tgMessage: `${status} | Amount: ${amountInt}`,
      };
    }

    await dbRepo.update(walletInDb.id, {
      status: CLAIM_STATUSES.NOT_CLAIMED,
      claimAmount: amountInt,
      nativeBalance,
      balance: currentBalance,
    });

    const status = getCheckClaimMessage(CLAIM_STATUSES.NOT_CLAIMED);
    return {
      status: 'success',
      message: status,
      tgMessage: `${status} | Amount: ${amountInt}`,
    };
  } catch (err) {
    await dbRepo.update(walletInDb.id, {
      status: CLAIM_STATUSES.CHECK_ERROR,
      claimAmount: amountInt,
      nativeBalance,
      balance: currentBalance,
      error: formatErrMessage(err),
    });

    throw err;
  }
};

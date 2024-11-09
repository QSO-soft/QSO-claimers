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
import { SwellClaimEntity } from '../../db/entities';
import { formatErrMessage, getCheckClaimMessage } from '../../utils';
import { CLAIM_SWELL_CONTRACT, HEADERS, SWELL_ABI } from './constants';
import { getBalance, getProofData } from './helpers';

export const execMakeCheckClaimSwell = async (params: TransformedModuleParams) =>
  transactionWorker({
    ...params,
    startLogMessage: 'Execute make check claim SWELL...',
    transactionCallback: makeCheckClaimSwell,
  });

const makeCheckClaimSwell = async (params: TransactionCallbackParams): TransactionCallbackReturn => {
  const { client, dbSource, network, wallet, proxyAgent, proxyObject } = params;

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

  const dbRepo = dbSource.getRepository(SwellClaimEntity);

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
    proxyUrl: proxyObject?.url,
  };

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
  });
  walletInDb = await dbRepo.save(created);

  try {
    const contract = CLAIM_SWELL_CONTRACT;

    const { int } = await client.getNativeBalance();
    nativeBalance = +int.toFixed(6);

    const proofRes = await getProofData(dataProps);
    if (!proofRes.proofsHex?.length || !proofRes.totalAmount) {
      await dbRepo.update(walletInDb.id, {
        status: CLAIM_STATUSES.NOT_ELIGIBLE,
        isSybil: proofRes.isSybil,
      });

      return {
        status: 'passed',
        message: getCheckClaimMessage(CLAIM_STATUSES.NOT_ELIGIBLE),
      };
    }

    const amountWei = BigInt(proofRes.totalAmount);
    amountInt = decimalToInt({
      amount: amountWei,
      decimals: 18,
    });

    const { currentBalance: currentBalanceInt } = await getBalance(client);
    currentBalance = currentBalanceInt;

    const claimed = (await publicClient.readContract({
      address: contract,
      abi: SWELL_ABI,
      functionName: 'cumulativeClaimed',
      args: [walletAddress],
    })) as bigint;

    if (claimed) {
      if (currentBalance === 0) {
        await dbRepo.update(walletInDb.id, {
          status: CLAIM_STATUSES.CLAIMED_AND_SENT,
          claimAmount: amountInt,
          nativeBalance,
          balance: currentBalance,
          isSybil: proofRes.isSybil,
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
        isSybil: proofRes.isSybil,
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
      isSybil: proofRes.isSybil,
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

import { CLAIM_STATUSES, DB_NOT_CONNECTED } from '../../../../constants';
import {
  decimalToInt,
  getAxiosConfig,
  getGasOptions,
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

export const execMakeClaimSwell = async (params: TransformedModuleParams) =>
  transactionWorker({
    ...params,
    startLogMessage: 'Execute make claim SWELL...',
    transactionCallback: makeClaimSwell,
  });

const makeClaimSwell = async (params: TransactionCallbackParams): TransactionCallbackReturn => {
  const { client, dbSource, gweiRange, gasLimitRange, wallet, network, proxyAgent, proxyObject } = params;

  const { walletAddress, walletClient, publicClient, explorerLink } = client;

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
    proxyUrl: proxyObject?.url,
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

    const feeOptions = await getGasOptions({
      gweiRange,
      gasLimitRange,
      network,
      publicClient,
    });

    const proof = proofRes.proofsHex;
    const txHash = await walletClient.writeContract({
      address: contract,
      abi: SWELL_ABI,
      functionName: 'claimAndLock',
      args: [amountWei, 0n, proof],
      ...feeOptions,
    });

    await client.waitTxReceipt(txHash);

    await dbRepo.update(walletInDb.id, {
      status: CLAIM_STATUSES.CLAIM_SUCCESS,
      claimAmount: amountInt,
      nativeBalance,
      balance: currentBalance + amountInt,
      isSybil: proofRes.isSybil,
    });

    return {
      tgMessage: `Claimed ${amountInt} SWELL`,
      status: 'success',
      txHash,
      explorerLink,
      message: getCheckClaimMessage(CLAIM_STATUSES.CLAIM_SUCCESS),
    };
  } catch (err) {
    await dbRepo.update(walletInDb.id, {
      status: CLAIM_STATUSES.CLAIM_ERROR,
      claimAmount: amountInt,
      nativeBalance,
      balance: currentBalance,
      error: formatErrMessage(err),
    });

    throw err;
  }
};

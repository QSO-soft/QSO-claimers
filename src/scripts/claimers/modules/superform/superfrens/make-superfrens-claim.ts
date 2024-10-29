import { CLAIM_STATUSES, DB_NOT_CONNECTED } from '../../../../../constants';
import {
  getAxiosConfig,
  getGasOptions,
  getHeaders,
  TransactionCallbackParams,
  TransactionCallbackReturn,
  transactionWorker,
} from '../../../../../helpers';
import { TransformedModuleParams } from '../../../../../types';
import { SuperfrensNftClaimEntity } from '../../../db/entities';
import { formatErrMessage, getCheckClaimMessage } from '../../../utils';
import { CURRENT_TOURNAMENT_ID, getApiHeaders } from './constants';
import { checkTournamentAvailabilityData, getClaimData, getClaimDataStatuses, getIdData } from './helpers';

export const execMakeSuperfrensClaimNFT = async (params: TransformedModuleParams) =>
  transactionWorker({
    ...params,
    startLogMessage: 'Execute make Superfrens claim NFT...',
    transactionCallback: makeSuperfrensClaimNFT,
  });

const makeSuperfrensClaimNFT = async (params: TransactionCallbackParams): TransactionCallbackReturn => {
  const {
    client,
    dbSource,
    gweiRange,
    gasLimitRange,
    wallet,
    network,
    proxyAgent,
    logger,
    nftId = CURRENT_TOURNAMENT_ID,
  } = params;

  const { walletAddress, walletClient, publicClient, explorerLink } = client;

  if (!dbSource) {
    return {
      status: 'critical',
      message: DB_NOT_CONNECTED,
    };
  }

  let nativeBalance = 0;

  const dbRepo = dbSource.getRepository(SuperfrensNftClaimEntity);

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
    nativeBalance,
    tournamentId: nftId,
    status: 'New',
  });
  walletInDb = await dbRepo.save(created);

  try {
    const headers = getHeaders(getApiHeaders(nftId));
    const config = await getAxiosConfig({
      proxyAgent,
      headers,
    });

    const { int } = await client.getNativeBalance();
    nativeBalance = +int.toFixed(6);

    const claimDataProps = {
      walletAddress,
      tournamentID: nftId,
      config,
    };

    logger.info(`Claiming tournament [${nftId}] NFT...`);

    await checkTournamentAvailabilityData(nftId, config);
    await getIdData(config);

    const claimStatus = await getClaimDataStatuses(claimDataProps);

    if (claimStatus === CLAIM_STATUSES.ALREADY_CLAIMED || claimStatus === CLAIM_STATUSES.NOT_ELIGIBLE) {
      await dbRepo.update(walletInDb.id, {
        status: claimStatus,
        nativeBalance,
      });

      const status = getCheckClaimMessage(claimStatus);

      return {
        status: 'passed',
        message: status,
        tgMessage: `${status}`,
      };
    }

    const claimRes = await getClaimData(claimDataProps);

    if (!claimRes.to || !claimRes.transactionData || !claimRes.value) {
      throw new Error('Incorrect claim data');
    }

    const feeOptions = await getGasOptions({
      gweiRange,
      gasLimitRange,
      network,
      publicClient,
    });

    const txHash = await walletClient.sendTransaction({
      to: claimRes.to,
      // value: claimRes.value,
      data: claimRes.transactionData,
      ...feeOptions,
    });

    await client.waitTxReceipt(txHash);

    await dbRepo.update(walletInDb.id, {
      status: CLAIM_STATUSES.CLAIM_SUCCESS,
      nativeBalance,
    });

    const status = getCheckClaimMessage(CLAIM_STATUSES.CLAIM_SUCCESS);

    return {
      status: 'success',
      txHash,
      explorerLink,
      tgMessage: `${status} | Tournament [${nftId}] NFT`,
    };
  } catch (err) {
    const errMessage = formatErrMessage(err);

    if (errMessage.includes(`Tournament with id ${nftId} is not finished yet`)) {
      await dbRepo.update(walletInDb.id, {
        status: CLAIM_STATUSES.NOT_ELIGIBLE,
        nativeBalance,
      });

      return {
        status: 'success',
        message: errMessage,
      };
    }

    if (errMessage.includes('not eligible for superfren claim') || errMessage.includes('tournament user not found')) {
      await dbRepo.update(walletInDb.id, {
        status: CLAIM_STATUSES.NOT_ELIGIBLE,
        nativeBalance,
      });

      const status = getCheckClaimMessage(CLAIM_STATUSES.NOT_ELIGIBLE);

      return {
        status: 'passed',
        message: status,
      };
    }

    await dbRepo.update(walletInDb.id, {
      nativeBalance,
      error: errMessage,
    });

    throw err;
  }
};

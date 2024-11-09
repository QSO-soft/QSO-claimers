import axios from 'axios';

import { DB_NOT_CONNECTED } from '../../../../constants';
import {
  getAxiosConfig,
  getHeaders,
  TransactionCallbackParams,
  TransactionCallbackReturn,
  transactionWorker,
} from '../../../../helpers';
import { TransformedModuleParams } from '../../../../types';
import { SymbioticPointsEntity } from '../../db/entities';

export const execMakeSymbioticCheckPoints = async (params: TransformedModuleParams) =>
  transactionWorker({
    ...params,
    startLogMessage: 'Execute make Symbiotic check points...',
    transactionCallback: makeSymbioticCheckPoints,
  });

const makeSymbioticCheckPoints = async (params: TransactionCallbackParams): TransactionCallbackReturn => {
  const { client, dbSource, wallet, proxyAgent } = params;
  const { walletAddress } = client;

  if (!dbSource) {
    return {
      status: 'critical',
      message: DB_NOT_CONNECTED,
    };
  }

  const dbRepo = dbSource.getRepository(SymbioticPointsEntity);

  const walletInDb = await dbRepo.findOne({
    where: {
      walletId: wallet.id,
      index: wallet.index,
    },
  });
  if (walletInDb) {
    await dbRepo.remove(walletInDb);
  }

  const headers = getHeaders({});
  const config = await getAxiosConfig({
    proxyAgent,
    headers,
  });

  const { data } = await axios.get(`https://app.symbiotic.al/api/v1/points/${walletAddress}`, config);
  const points = data.totalPoints || 0;

  const created = dbRepo.create({
    walletId: wallet.id,
    index: wallet.index,
    walletAddress,
    points,
  });
  await dbRepo.save(created);

  return {
    status: 'success',
    tgMessage: `Points: ${points}`,
  };
};

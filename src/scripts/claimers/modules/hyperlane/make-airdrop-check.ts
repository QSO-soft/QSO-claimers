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
import { HyperlaneAirdropCheckEntity } from '../../db/entities';

export const execMakeHyperlaneAidropCheck = async (params: TransformedModuleParams) =>
  transactionWorker({
    ...params,
    startLogMessage: 'Execute make Hyperlane airdrop check...',
    transactionCallback: makeHyperlaneAidropCheck,
  });

const makeHyperlaneAidropCheck = async (params: TransactionCallbackParams): TransactionCallbackReturn => {
  const { client, proxyAgent, dbSource, wallet } = params;

  const { walletAddress } = client;

  if (!dbSource) {
    return {
      status: 'critical',
      message: DB_NOT_CONNECTED,
    };
  }

  const dbRepo = dbSource.getRepository(HyperlaneAirdropCheckEntity);

  let walletInDb = await dbRepo.findOne({
    where: {
      walletAddress,
    },
  });
  if (walletInDb) {
    await dbRepo.remove(walletInDb);
  }

  const created = dbRepo.create({
    walletId: wallet.id,
    index: wallet.index,
    walletAddress,
  });
  walletInDb = await dbRepo.save(created);

  const headers = getHeaders({
    Origin: 'https://claim.hyperlane.foundation',
    Referer: 'https://claim.hyperlane.foundation/',
  });
  const config = await getAxiosConfig({
    proxyAgent,
    headers,
  });

  const { data } = await axios.get(
    `https://claim.hyperlane.foundation/api/check-eligibility?address=${walletAddress}`,
    config
  );

  const isEligible = data?.response?.isEligible;
  let amount = 0;

  for (const eligibility of data?.response?.eligibilities || []) {
    amount += +(eligibility?.amount || '0');
  }

  await dbRepo.update(walletInDb.id, {
    isEligible,
    amount,
  });

  const message = `Eligible: ${isEligible} | Amount: ${amount}`;
  return {
    status: 'success',
    message,
    tgMessage: message,
  };
};

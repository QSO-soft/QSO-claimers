import axios from 'axios';

import { DB_NOT_CONNECTED } from '../../../../constants';
import {
  getAxiosConfig,
  getFormattedErrorMessage,
  getHeaders,
  getSolviumCaptcha,
  TransactionCallbackParams,
  TransactionCallbackReturn,
  transactionWorker,
} from '../../../../helpers';
import { CookieManager } from '../../../../helpers/coookie.manager';
import { parseResponse } from '../../../../helpers/request-parsing/request-parsing';
import { TransformedModuleParams } from '../../../../types';
import { HyperlaneAirdropCheckEntity } from '../../db/entities';

export const execMakeHyperlaneAidropCheck = async (params: TransformedModuleParams) =>
  transactionWorker({
    ...params,
    startLogMessage: 'Execute make Hyperlane airdrop check...',
    transactionCallback: makeHyperlaneAidropCheck,
  });

const makeHyperlaneAidropCheck = async (params: TransactionCallbackParams): TransactionCallbackReturn => {
  const { client, proxyAgent, dbSource, wallet, logger } = params;

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
  const cookieManager = new CookieManager();

  // * Send Request to get challenge token
  const responseWithChallengeToken = await axios.get('https://claim.hyperlane.foundation/', {
    ...config,
    validateStatus: () => true,
  });

  // * Try to found vercel challenge token
  const challengeToken = responseWithChallengeToken.headers['x-vercel-challenge-token'];
  if (!challengeToken && responseWithChallengeToken.status !== 200)
    throw new Error('Cannot get vercel challenge token');

  // * Solve Vercel Captcha
  if (challengeToken) {
    logger?.info('Solving Vercel Captcha...');
    const solution = await getSolviumCaptcha(proxyAgent, challengeToken).catch((err) => {
      throw new Error(`Failed Solve Vercel Captcha | ${getFormattedErrorMessage(err, 'eth')}`);
    });

    const verifyChallengeTokenResponse = await axios
      .post('https://claim.hyperlane.foundation/.well-known/vercel/security/request-challenge', undefined, {
        ...config,
        headers: {
          ...config.headers,
          'X-Vercel-Challenge-Solution': solution,
          'X-Vercel-Challenge-Token': challengeToken,
          'X-Vercel-Challenge-Version': '2',
        },
        validateStatus: () => true,
      })
      .then((res) => parseResponse(res));

    cookieManager.editCookie(verifyChallengeTokenResponse.cookies);
    config.headers['cookie'] = cookieManager.rawCookies;
    if (verifyChallengeTokenResponse?.status !== 204) throw new Error('Failed Solve Vercel Captcha');
    logger?.info('Versel Captcha Solved And Verified');
  }

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

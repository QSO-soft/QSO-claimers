import axios from 'axios';
import { Hex } from 'viem';

import { DB_NOT_CONNECTED } from '../../../../constants';
import {
  getAxiosConfig,
  getClientByNetwork,
  getFormattedErrorMessage,
  getGasOptions,
  getHeaders,
  getSolviumCaptcha,
  intToDecimal,
  sleep,
  TransactionCallbackParams,
  TransactionCallbackReturn,
  transactionWorker,
} from '../../../../helpers';
import { CookieManager } from '../../../../helpers/coookie.manager';
import { parseResponse } from '../../../../helpers/request-parsing/request-parsing';
import { SupportedNetworks, TransformedModuleParams } from '../../../../types';
import { HyperlaneAirdropCheckEntity } from '../../db/entities';

export const execMakeHyperlaneAidropClaim = async (params: TransformedModuleParams) =>
  transactionWorker({
    ...params,
    startLogMessage: 'Execute make Hyperlane airdrop claim...',
    transactionCallback: makeHyperlaneAidropClaim,
  });

const makeHyperlaneAidropClaim = async (params: TransactionCallbackParams): TransactionCallbackReturn => {
  const { proxyAgent, dbSource, wallet, logger, gweiRange, gasLimitRange } = params;

  const srcToken = 'HYPER';

  if (!dbSource) {
    return {
      status: 'critical',
      message: DB_NOT_CONNECTED,
    };
  }

  // let network = networkProp;
  // if (randomNetworks?.length) {
  //   network = getRandomItemFromArray(randomNetworks);
  // }

  // const client = getClientByNetwork(network, wallet.privKey, logger);

  // const receivingAddress = wallet.delegateToAddress || walletAddress;

  const dbRepo = dbSource.getRepository(HyperlaneAirdropCheckEntity);

  let walletInDb = await dbRepo.findOne({
    where: {
      walletAddress: wallet.walletAddress,
    },
  });
  if (walletInDb) {
    await dbRepo.remove(walletInDb);
  }

  const created = dbRepo.create({
    walletId: wallet.id,
    index: wallet.index,
    walletAddress: wallet.walletAddress,
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
    logger?.success('Vercel Captcha Solved And Verified');
  }

  const { data } = await axios.get(
    `https://claim.hyperlane.foundation/api/claims?address=${wallet.walletAddress}`,
    config
  );

  await sleep(0.5);

  if (data.error || !data?.response?.registrations?.length) {
    if (data.message.includes('No claims found')) {
      return {
        status: 'passed',
        message: 'Not found claims',
      };
    }

    return {
      status: 'error',
      message: data.message || 'Unable to get registrations',
    };
  }

  const registration = data.response.registrations[0];
  const claim = data.response.claims[0];

  const amount = registration.amount;
  const claimNetwork = networkByChainId[registration.chainId] || 'eth';
  const contract = contractByChainId[registration.chainId];
  if (!contract) {
    return {
      status: 'error',
      message: `Chain id ${registration.chainId} is not supported`,
    };
  }

  const client = getClientByNetwork(claimNetwork, wallet.privKey, logger);

  await dbRepo.update(walletInDb.id, {
    isEligible: true,
    amount,
    registrationNetwork: claimNetwork,
    registrationToken: srcToken,
    isClaimed: false,
  });

  const { publicClient } = client;

  const isAlreadyClaimed = await publicClient.readContract({
    address: contract,
    abi,
    functionName: 'isClaimed',
    args: [claim.merkle.index],
  });

  if (isAlreadyClaimed) {
    await dbRepo.update(walletInDb.id, {
      isClaimed: true,
    });

    return {
      status: 'passed',
      message: 'Already claimed',
    };
  }

  logger.info(`Claiming ${amount} ${srcToken} in ${claimNetwork}...`);

  const feeOptions = await getGasOptions({
    gweiRange,
    gasLimitRange,
    network: claimNetwork,
    publicClient,
  });

  const txHash = await client.walletClient.writeContract({
    address: contract,
    abi,
    functionName: 'claim',
    args: [
      claim.merkle.index,
      wallet.walletAddress,
      intToDecimal({
        amount: +registration.amount,
      }),
      claim.merkle.proof,
    ],
    ...feeOptions,
  });

  await client.waitTxReceipt(txHash);

  const message = `Amount: ${amount} ${srcToken} | Network: ${claimNetwork}`;
  return {
    status: 'success',
    message,
    txHash,
    tgMessage: message,
  };
};

const networkByChainId: Record<number, SupportedNetworks> = {
  8453: 'base',
  42161: 'arbitrum',
  10: 'optimism',
  56: 'bsc',
  1: 'eth',
};
const contractByChainId: Record<number, Hex> = {
  8453: '0x3D115377ec8E55A5c18ad620102286ECD068a36c',
  42161: '0x3D115377ec8E55A5c18ad620102286ECD068a36c',
  10: '0x93A2Db22B7c736B341C32Ff666307F4a9ED910F5',
  56: '0xa7D7422cf603E40854D26aF151043e73c1201563',
  1: '0xE5d5e5891a11b3948d84307af7651D684b87e730',
};

const abi = [
  {
    inputs: [
      { internalType: 'uint256', name: 'index', type: 'uint256' },
      { internalType: 'address', name: 'account', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
      { internalType: 'bytes32[]', name: 'merkleProof', type: 'bytes32[]' },
    ],
    name: 'claim',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'index', type: 'uint256' }],
    name: 'isClaimed',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
];

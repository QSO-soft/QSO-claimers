import { gotScraping } from 'got-scraping';

import { DB_NOT_CONNECTED } from '../../../../constants';
import {
  getHeaders,
  sleep,
  TransactionCallbackParams,
  TransactionCallbackReturn,
  transactionWorker,
} from '../../../../helpers';
import { TransformedModuleParams } from '../../../../types';
import { StoryClaimEntity } from '../../db/entities';

export const execMakeStoryClaim = async (params: TransformedModuleParams) =>
  transactionWorker({
    ...params,
    startLogMessage: 'Execute make Story airdrop claim...',
    transactionCallback: makeStoryClaim,
  });

const makeStoryClaim = async (params: TransactionCallbackParams): TransactionCallbackReturn => {
  const { client, proxyObject, logger, dbSource, wallet } = params;

  const { walletClient, explorerLink, walletAddress } = client;

  if (!dbSource) {
    return {
      status: 'critical',
      message: DB_NOT_CONNECTED,
    };
  }

  const dbRepo = dbSource.getRepository(StoryClaimEntity);

  let walletInDb = await dbRepo.findOne({
    where: {
      walletAddress: walletAddress,
    },
  });
  if (walletInDb) {
    await dbRepo.remove(walletInDb);
  }

  const created = dbRepo.create({
    walletId: wallet.id,
    walletIndex: wallet.index,
    walletAddress,
  });
  walletInDb = await dbRepo.save(created);

  const headers = getHeaders({
    Origin: 'https://rewards.story.foundation',
    Referer: 'https://rewards.story.foundation/',
  });

  const nonce = `${Date.now()}`;
  const message = `By signing this message, I confirm ownership of this wallet and that I have read and agree to the Token Claim Terms.\n\nnonce: ${nonce}`;
  const signature = await walletClient.signMessage({
    message,
  });

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const { body: checkBody } = (await gotScraping.post({
    url: 'https://claim.storyapis.com/sign',
    proxyUrl: proxyObject?.url,
    body: JSON.stringify({
      nonce,
      signature,
      wallet: walletAddress,
    }),
    responseType: 'json',
    headers,
    useHeaderGenerator: false,
  })) as any;

  if (checkBody.error) {
    await dbRepo.update(walletInDb.id, {
      status: checkBody.error,
    });

    return {
      status: 'success',
      tgMessage: `Status: ${checkBody.error}`,
    };
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const { body: claimBody } = (await gotScraping.get({
    url: 'https://claim.storyapis.com/claim/process',
    proxyUrl: proxyObject?.url,
    responseType: 'json',
    headers: {
      ...headers,
      authorization: checkBody.msg,
    },
    useHeaderGenerator: false,
  })) as any;

  if (claimBody.error) {
    await dbRepo.update(walletInDb.id, {
      status: claimBody.error,
    });

    return {
      status: 'error',
      message: claimBody.error,
    };
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const { body: addressData } = (await gotScraping.get({
    url: 'https://claim.storyapis.com/address_data',
    proxyUrl: proxyObject?.url,
    responseType: 'json',
    headers: {
      ...headers,
      authorization: checkBody.msg,
    },
    useHeaderGenerator: false,
  })) as any;

  if (addressData.error) {
    await dbRepo.update(walletInDb.id, {
      status: addressData.error,
    });

    return {
      status: 'error',
      message: addressData.error,
    };
  }

  const deadline = BigInt(Math.floor(Date.now() / 1e3) + 86400);

  const amount = +(addressData.msg.merkle_tree.amount || 0) / 10 ** 18;

  if (claimBody.msg.status === 'claimed') {
    await dbRepo.update(walletInDb.id, {
      status: 'claimed',
      amount,
    });

    return {
      status: 'success',
      txHash: claimBody.msg.txHash,
      explorerLink,
      tgMessage: `Status: already claimed | Amount ${amount} IP`,
    };
  }

  if (claimBody.msg.status === 'not_eligible_gitcoin') {
    const message = `${claimBody.msg.detail} ${claimBody.msg.gitCoin.threshold}`;
    await dbRepo.update(walletInDb.id, {
      status: message,
      amount,
    });

    return {
      status: 'success',
      tgMessage: `Status: ${message} | Amount ${amount} IP`,
    };
  }

  if (claimBody.msg.status === 'can_claim') {
    const typedSignature = await walletClient.signTypedData({
      types: {
        ClaimOnBehalfData: [
          {
            name: 'index',
            type: 'uint256',
          },
          {
            name: 'amount',
            type: 'uint256',
          },
          {
            name: 'to',
            type: 'address',
          },
          {
            name: 'proof',
            type: 'bytes32[]',
          },
          {
            name: 'deadline',
            type: 'uint256',
          },
        ],
        EIP712Domain: [
          {
            name: 'name',
            type: 'string',
          },
          {
            name: 'version',
            type: 'string',
          },
          {
            name: 'chainId',
            type: 'uint256',
          },
          {
            name: 'verifyingContract',
            type: 'address',
          },
        ],
      },
      primaryType: 'ClaimOnBehalfData',
      domain: {
        name: 'MerkleClaimer',
        version: '1',
        chainId: BigInt(client.chainData.id),
        verifyingContract: addressData.msg.merkle_tree.contractAddress,
      },
      message: {
        index: addressData.msg.merkle_tree.index,
        amount: addressData.msg.merkle_tree.amount,
        to: walletAddress,
        proof: addressData.msg.merkle_tree.proof,
        deadline,
      },
    });

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const { body: claimStartData } = (await gotScraping.post({
      url: 'https://claim.storyapis.com/claim',
      proxyUrl: proxyObject?.url,
      body: JSON.stringify({
        signature: typedSignature,
        deadline: Number(deadline),
        address: walletAddress,
      }),
      responseType: 'json',
      headers: {
        ...headers,
        authorization: checkBody.msg,
      },
      useHeaderGenerator: false,
    })) as any;

    if (claimStartData.error) {
      await dbRepo.update(walletInDb.id, {
        status: checkBody.error,
      });

      return {
        status: 'error',
        tgMessage: claimStartData.error,
      };
    }
    let txHash;
    let isQueue = true;
    while (isQueue) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const { body: processData } = (await gotScraping.get({
        url: 'https://claim.storyapis.com/claim/process',
        proxyUrl: proxyObject?.url,
        responseType: 'json',
        headers: {
          ...headers,
          authorization: checkBody.msg,
        },
        useHeaderGenerator: false,
      })) as any;

      if (processData.msg.status === 'queued') {
        isQueue = true;

        logger.info('Claiming in queue...');
        await sleep(30);

        continue;
      }
      if (processData.error) {
        await dbRepo.update(walletInDb.id, {
          status: checkBody.error,
        });

        return {
          status: 'error',
          tgMessage: processData.error,
        };
      }
      if (processData.msg.status === 'claimed') {
        isQueue = false;
        txHash = processData.msg.txHash;
        break;
      }

      return {
        status: 'error',
        message: 'Unable to wait claiming queue',
      };
    }

    await dbRepo.update(walletInDb.id, {
      status: 'claimed',
      amount,
    });

    return {
      status: 'success',
      txHash,
      explorerLink,
      tgMessage: `Status: claimed | Amount ${amount} IP`,
    };
  }

  return {
    status: 'error',
  };
};

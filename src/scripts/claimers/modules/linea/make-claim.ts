import { v4 as uuidv4 } from 'uuid';

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
import { LineaClaimEntity } from '../../db/entities';
import { formatErrMessage, getCheckClaimMessage } from '../../utils';
import { ABI, CHECKER_CONTRACT, HEADERS } from './constants';
import { getBalance } from './helpers';

export const execMakeClaimLinea = async (params: TransformedModuleParams) =>
  transactionWorker({
    ...params,
    startLogMessage: 'Execute make claim LINEA...',
    transactionCallback: makeClaimLinea,
  });

const makeClaimLinea = async (params: TransactionCallbackParams): TransactionCallbackReturn => {
  const { client, dbSource, gweiRange, gasLimitRange, wallet, network, proxyAgent, logger } = params;

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

  const dbRepo = dbSource.getRepository(LineaClaimEntity);

  let walletInDb = await dbRepo.findOne({
    where: {
      walletId: wallet.id,
      index: wallet.index,
    },
  });
  if (walletInDb) {
    await dbRepo.remove(walletInDb);
  }

  const reqId = uuidv4();
  const headers = getHeaders(HEADERS);
  const config = await getAxiosConfig({
    proxyAgent,
    headers,
  });
  // const dataProps = {
  //   network,
  //   config,
  //   walletAddress,
  //   chainId: client.chainData.id,
  // };

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

    const allocation = (await publicClient.readContract({
      address: CHECKER_CONTRACT,
      abi: ABI,
      functionName: 'calculateAllocation',
      args: [walletAddress],
    })) as bigint;

    if (!allocation) {
      await dbRepo.update(walletInDb.id, {
        status: CLAIM_STATUSES.NOT_ELIGIBLE,
      });

      return {
        status: 'passed',
        message: getCheckClaimMessage(CLAIM_STATUSES.NOT_ELIGIBLE),
      };
    }

    amountInt = decimalToInt({
      amount: allocation,
    });

    const { currentBalance: currentBalanceInt } = await getBalance(client);
    currentBalance = currentBalanceInt;

    const claimed = (await publicClient.readContract({
      address: CHECKER_CONTRACT,
      abi: ABI,
      functionName: 'hasClaimed',
      args: [walletAddress],
    })) as boolean;

    if (claimed) {
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

    logger.info(`Claiming ${amountInt} LINEA...`);
    // logger.info(`Claiming ${amountInt} LINEA with delegating to ${randomDelegator.account.name}...`);

    // const { data: nonceData } = await axios.get(`https://app.dynamicauth.com/api/v0/sdk/${reqId}/nonce`, config);
    // console.log(nonceData, 'nonceData');
    //
    // const signMsg = `linea.build wants you to sign in with your Ethereum account:
    // ${walletAddress}
    //
    // Welcome to Linea Hub. Signing is the only way we can truly know that you are the owner of the wallet you are connecting. Signing is a safe, gas-less transaction that does not in any way give Linea Hub permission to perform any transactions with your wallet.
    //
    // URI: https://linea.build/hub/airdrop
    // Version: 1
    // Chain ID: 59144
    // Nonce: ${nonceData.nonce}
    // Issued At: ${new Date().toISOString()}
    // Request ID: ${reqId}`;
    //
    // const signature = await walletClient.signMessage({
    //   message: signMsg,
    // });
    //
    // const { data: verifData } = await axios.post(
    //   `https://app.dynamicauth.com/api/v0/sdk/${reqId}/verify`,
    //   {
    //     signedMessage: signature,
    //     messageToSign: signMsg,
    //     publicWalletAddress: walletAddress,
    //     chain: 'EVM',
    //     walletName: 'metamask',
    //     walletProvider: 'browserExtension',
    //     network: '59144',
    //     additionalWalletAddresses: [],
    //     sessionPublicKey: '03016360894f8d7f040dedb94b8824eeb0491aa391c887c7f55b87b7777724ba63',
    //   },
    //   config
    // );

    const feeOptions = await getGasOptions({
      gweiRange,
      gasLimitRange,
      network,
      publicClient,
    });

    const txHash = await walletClient.writeContract({
      address: CHECKER_CONTRACT,
      abi: ABI,
      functionName: 'claim',
      ...feeOptions,
    });

    await client.waitTxReceipt(txHash);

    await dbRepo.update(walletInDb.id, {
      status: CLAIM_STATUSES.CLAIM_SUCCESS,
      claimAmount: amountInt,
      nativeBalance,
      balance: currentBalance + amountInt,
    });

    return {
      tgMessage: `Claimed ${amountInt} LINEA`,
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

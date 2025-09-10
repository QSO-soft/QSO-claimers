import axios from 'axios';

import { CLAIM_STATUSES, DB_NOT_CONNECTED } from '../../../../constants';
import {
  decimalToInt,
  getAxiosConfig,
  getGasOptions,
  getHeaders,
  getTrimmedLogsAmount,
  TransactionCallbackParams,
  TransactionCallbackReturn,
  transactionWorker,
} from '../../../../helpers';
import { TransformedModuleParams } from '../../../../types';
import { SomniaAirdropEntity } from '../../db/entities';
import { formatErrMessage, getCheckClaimMessage } from '../../utils';
import { ABI, CONTRACT, HEADERS } from './constants';
import { calculateClaimableAllocation, calculateMerkleProof, getProofData } from './helpers';

export const execMakeClaimSomnia = async (params: TransformedModuleParams) =>
  transactionWorker({
    ...params,
    startLogMessage: 'Execute make claim SOMI...',
    transactionCallback: makeClaimSomnia,
  });

const makeClaimSomnia = async (params: TransactionCallbackParams): TransactionCallbackReturn => {
  const { client, dbSource, gweiRange, gasLimitRange, wallet, network, proxyAgent, logger } = params;

  const { walletAddress, walletClient, publicClient, explorerLink } = client;

  if (!dbSource) {
    return {
      status: 'critical',
      message: DB_NOT_CONNECTED,
    };
  }

  let amountInt = 0;
  let currentBalance = 0;

  const dbRepo = dbSource.getRepository(SomniaAirdropEntity);

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
  };

  // const finalRes = await getFinalData(dataProps);

  const created = dbRepo.create({
    walletId: wallet.id,
    index: wallet.index,
    walletAddress,
    network,
    status: 'New',
    // score: finalRes.total,
  });
  walletInDb = await dbRepo.save(created);

  try {
    const results = await getProofData(dataProps);

    if (!results.allocation || !BigInt(results.allocation)) {
      await dbRepo.update(walletInDb.id, {
        status: CLAIM_STATUSES.NOT_ELIGIBLE,
      });

      return {
        status: 'passed',
        message: getCheckClaimMessage(CLAIM_STATUSES.NOT_ELIGIBLE),
      };
    }

    const { int: currentBalanceInt } = await client.getNativeBalance();
    currentBalance = currentBalanceInt;

    const terms = '0xaa1798314db57817f8cd6f63f58bff70fd930a346d149d5f3a18e4d2ce03cca9';
    const message = `I hereby authorize this message as confirmation of ownership for the wallet address: ${walletAddress.toLowerCase()}. By signing, I acknowledge that I have read and accepted the Airdrop Terms of Service and Privacy Policy. The SHA-256 hash of the referenced terms and policy is: ${terms}.`;

    const signature = await walletClient.signMessage({
      message,
    });

    const { data } = await axios.post(
      'https://acs.clique.tech/ext/partial_claim',
      {
        deployment: 'NativeDistributor',
        batch: 'default',
        address: walletAddress,
        sig: signature,
        appId: 'somnia',
      },
      config
    );

    if (data.error) {
      throw new Error(data.error);
    }

    const claimedCheck = (await publicClient.readContract({
      address: CONTRACT,
      abi: ABI,
      functionName: 'claimed',
      args: [calculateMerkleProof(results.extra.proof, walletAddress, BigInt(results.allocation)), walletAddress],
    })) as [bigint, bigint];
    const claimedAmount = claimedCheck[1];
    const claimableAllocation = calculateClaimableAllocation(claimedAmount, BigInt(data.released));

    if (!claimableAllocation) {
      amountInt = decimalToInt({
        amount: claimedAmount,
        decimals: 18,
      });

      if (currentBalance === 0) {
        await dbRepo.update(walletInDb.id, {
          status: CLAIM_STATUSES.CLAIMED_AND_SENT,
          claimAmount: amountInt,
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
        balance: currentBalance,
      });

      const status = getCheckClaimMessage(CLAIM_STATUSES.CLAIMED_NOT_SENT);

      return {
        status: 'passed',
        message: status,
        tgMessage: `${status} | Amount: ${amountInt}`,
      };
    }

    amountInt = decimalToInt({
      amount: claimableAllocation,
      decimals: 18,
    });

    logger.info(`Claiming [${getTrimmedLogsAmount(amountInt, 'SOMI')}}]...`);

    // const signObj = {
    //   amount: results.allocation,
    //   batch: 'default',
    //   extra: '',
    //   onBehalfOf: walletAddress,
    //   proof: results.extra.proof,
    //   released: data.released,
    //   signature: data.sig,
    // };
    // const signature2 = await walletClient.signMessage({
    //   message: JSON.stringify(signObj),
    // });
    //
    // const { data: data2 } = await axios.post(
    //   'https://acs.clique.tech/relay/native_distributor/v2_0_0',
    //   {
    //     method: 'Claim',
    //     params: {
    //       ...signObj,
    //       authority: signature2,
    //       appId: 'somnia',
    //     },
    //     appId: 'somnia',
    //   },
    //   config
    // );
    //
    // if (data2.error) {
    //   throw new Error(data2.error);
    // }

    const feeOptions = await getGasOptions({
      gweiRange,
      gasLimitRange,
      network,
      publicClient,
    });

    const txHash = await walletClient.writeContract({
      address: CONTRACT,
      abi: ABI,
      functionName: 'claim',
      args: [results.extra.proof, data.sig, results.allocation, data.released, walletAddress, ''],
      ...feeOptions,
    });

    await client.waitTxReceipt(txHash);

    await dbRepo.update(walletInDb.id, {
      status: CLAIM_STATUSES.CLAIM_SUCCESS,
      claimAmount: amountInt + decimalToInt({ amount: claimedAmount, decimals: 18 }),
      balance: currentBalance + amountInt,
    });

    return {
      tgMessage: `Claimed ${amountInt} SOMI`,
      status: 'success',
      txHash,
      explorerLink,
      message: getCheckClaimMessage(CLAIM_STATUSES.CLAIM_SUCCESS),
    };
  } catch (err) {
    await dbRepo.update(walletInDb.id, {
      status: CLAIM_STATUSES.CLAIM_ERROR,
      claimAmount: amountInt,
      balance: currentBalance,
      error: formatErrMessage(err),
    });

    throw err;
  }
};

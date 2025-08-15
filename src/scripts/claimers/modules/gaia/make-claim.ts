import axios from 'axios';
import { parse as uuidParse } from 'uuid';
import { bytesToHex, Hex, keccak256, toHex } from 'viem';

import { defaultTokenAbi } from '../../../../clients/abi';
import { CLAIM_STATUSES, DB_NOT_CONNECTED } from '../../../../constants';
import {
  decimalToInt,
  getAxiosConfig,
  getGasOptions,
  getHeaders,
  getRandomItemFromArray,
  TransactionCallbackParams,
  TransactionCallbackReturn,
  transactionWorker,
} from '../../../../helpers';
import { TransformedModuleParams } from '../../../../types';
import { GaiaClaimEntity } from '../../db/entities';
import { formatErrMessage, getCheckClaimMessage } from '../../utils';
import { ABI, CLAIM_CONTRACT, DELEGATORS, HEADERS, TOKEN_CONTRACT } from './constants';
import { getBalance, getProofData, ProofRes, splitSignature } from './helpers';

export const execMakeClaimGaia = async (params: TransformedModuleParams) =>
  transactionWorker({
    ...params,
    startLogMessage: 'Execute make claim GAIA...',
    transactionCallback: makeClaimGaia,
  });

const makeClaimGaia = async (params: TransactionCallbackParams): TransactionCallbackReturn => {
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

  const dbRepo = dbSource.getRepository(GaiaClaimEntity);

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
    nativeBalance,
    status: 'New',
    // score: finalRes.total,
  });
  walletInDb = await dbRepo.save(created);

  try {
    const { int } = await client.getNativeBalance();
    nativeBalance = +int.toFixed(6);

    const allProofResults = await getProofData(dataProps);
    const s1Proof = allProofResults[0];

    if (!s1Proof?.amount || !s1Proof?.proof.length) {
      await dbRepo.update(walletInDb.id, {
        status: CLAIM_STATUSES.NOT_ELIGIBLE,
      });

      return {
        status: 'passed',
        message: getCheckClaimMessage(CLAIM_STATUSES.NOT_ELIGIBLE),
      };
    }

    const { currentBalance: currentBalanceInt } = await getBalance(client);
    currentBalance = currentBalanceInt;

    const notClaimedProofs: (ProofRes & { campaignId: Hex })[] = [];
    for (const proof of allProofResults) {
      const campaignId = bytesToHex(uuidParse(proof.uuid));

      const claimedCurrentCampaign = (await publicClient.readContract({
        address: CLAIM_CONTRACT,
        abi: ABI,
        functionName: 'claimed',
        args: [campaignId, walletAddress],
      })) as bigint;

      if (!claimedCurrentCampaign) {
        notClaimedProofs.push({ ...proof, campaignId });
      }
    }

    if (!notClaimedProofs.length) {
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
        claimAmount: allProofResults.reduce<number>((acc, cur) => {
          return (
            acc +
            decimalToInt({
              amount: BigInt(cur.amount),
              decimals: 18,
            })
          );
        }, 0),
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

    amountInt = notClaimedProofs.reduce<number>((acc, cur) => {
      return (
        acc +
        decimalToInt({
          amount: BigInt(cur.amount),
          decimals: 18,
        })
      );
    }, 0);

    const randomDelegator = getRandomItemFromArray(DELEGATORS);

    logger.info(`Claiming ${amountInt / 3} GAIA with delegating to ${randomDelegator.account.name}...`);

    const nonce = await publicClient.readContract({
      abi: defaultTokenAbi,
      address: TOKEN_CONTRACT,
      functionName: 'nonces',
      args: [walletAddress],
    });
    const msg = 'By signing this message, you agree to the terms and conditions of this claim.';
    const msgHex = keccak256(toHex(msg));
    const fullMsg = `${msg} Hash: ${msgHex}`;
    const tokenData = await publicClient.readContract({
      abi: defaultTokenAbi,
      address: TOKEN_CONTRACT,
      functionName: 'eip712Domain',
    });

    const signature = await walletClient.signMessage({
      message: fullMsg,
    });

    for (const proof of notClaimedProofs) {
      const { data } = await axios.post(
        'https://api.hedgey.finance/token-claims/signed-message',
        {
          address: walletAddress,
          chainId: 1,
          message: fullMsg,
          signature,
          uuid: proof.uuid,
        },
        config
      );

      if (data?.message !== 'OK') {
        return {
          status: 'error',
          message: `Unable to sign message: ${JSON.stringify(data) || 'Unknown error'}`,
        };
      }
    }

    const expiry = Math.floor(Date.now() / 1e3) + 1800;

    const typedSignature = await walletClient.signTypedData({
      types: {
        Delegation: [
          {
            name: 'delegatee',
            type: 'address',
          },
          {
            name: 'nonce',
            type: 'uint256',
          },
          {
            name: 'expiry',
            type: 'uint256',
          },
        ],
      },
      primaryType: 'Delegation',
      domain: {
        name: tokenData[1],
        version: tokenData[2],
        chainId: tokenData[3],
        verifyingContract: TOKEN_CONTRACT,
      },
      message: {
        delegatee: randomDelegator.account.address,
        nonce,
        expiry: BigInt(expiry),
      },
    });

    const { v, r, s } = splitSignature(typedSignature);

    const feeOptions = await getGasOptions({
      gweiRange,
      gasLimitRange,
      network,
      publicClient,
    });

    const txHash = await walletClient.writeContract({
      address: CLAIM_CONTRACT,
      abi: ABI,
      functionName: 'claimAndDelegateMultiple',
      args: [
        notClaimedProofs.map((proof) => proof.campaignId),
        notClaimedProofs.map((proof) => proof.proof),
        notClaimedProofs.map((proof) => proof.amount),
        notClaimedProofs.map((_) => randomDelegator.account.address),
        notClaimedProofs.map((_) => ({
          expiry,
          nonce,
          r,
          v,
          s,
          yParity: 0,
        })),
      ],
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
      tgMessage: `Claimed ${amountInt / 3}/${amountInt} GAIA`,
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

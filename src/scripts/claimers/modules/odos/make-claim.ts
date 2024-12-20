import axios from 'axios';
import { encodeFunctionData } from 'viem';

import settings from '../../../../_inputs/settings/settings';
import { CLAIM_STATUSES, DB_NOT_CONNECTED } from '../../../../constants';
import {
  addNumberPercentage,
  decimalToInt,
  getAxiosConfig,
  getGasOptions,
  getHeaders,
  getRandomNumber,
  TransactionCallbackParams,
  TransactionCallbackReturn,
  transactionWorker,
} from '../../../../helpers';
import { TransformedModuleParams } from '../../../../types';
import { OdosClaimEntity } from '../../db/entities';
import { formatErrMessage, getCheckClaimMessage } from '../../utils';
import { ABI, CLAIM_CONTRACT, HEADERS } from './constants';
import { getBalance, getProofData, signIn } from './helpers';

export const execMakeClaimOdos = async (params: TransformedModuleParams) =>
  transactionWorker({
    ...params,
    startLogMessage: 'Execute make claim ODOS...',
    transactionCallback: makeClaimOdos,
  });

const makeClaimOdos = async (params: TransactionCallbackParams): TransactionCallbackReturn => {
  const { client, logger, dbSource, gweiRange, gasLimitRange, wallet, network, proxyAgent } = params;

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

  const dbRepo = dbSource.getRepository(OdosClaimEntity);

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
    const contract = CLAIM_CONTRACT;

    const { int } = await client.getNativeBalance();
    nativeBalance = +int.toFixed(6);

    const proofRes = await getProofData(dataProps);
    if (!proofRes?.claim.amount || !proofRes?.signature) {
      await dbRepo.update(walletInDb.id, {
        status: CLAIM_STATUSES.NOT_ELIGIBLE,
      });

      return {
        status: 'passed',
        message: getCheckClaimMessage(CLAIM_STATUSES.NOT_ELIGIBLE),
      };
    }

    const amountWei = BigInt(proofRes.claim.amount);
    amountInt = decimalToInt({
      amount: amountWei,
    });

    const { currentBalance: currentBalanceInt } = await getBalance(client);
    currentBalance = currentBalanceInt;

    const token = await signIn({
      walletAddress,
      walletClient,
      config,
    });
    const headers = getHeaders(HEADERS);
    const authConfig = await getAxiosConfig({
      proxyAgent,
      headers,
      token,
    });

    const { data: claimData } = await axios.get('https://api.odos.xyz/loyalty/me', authConfig);

    // const claimed = (await publicClient.readContract({
    //   address: CLAIM_CONTRACT,
    //   abi: ABI,
    //   functionName: 'hasClaimed',
    //   args: [walletAddress],
    // })) as boolean;

    if (claimData.isRegistered) {
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

    const feeOptions = await getGasOptions({
      gweiRange,
      gasLimitRange,
      network,
      publicClient,
    });

    const currentNetworkGasMultiplier = settings.gasLimitMultiplier[network];

    // {
    //   logger.info('Accepting ownership...');
    //
    //   const txHash = await walletClient.writeContract({
    //     address: contract,
    //     abi: ABI,
    //     functionName: 'acceptOwnership',
    //     ...feeOptions,
    //   });
    //
    //   await client.waitTxReceipt(txHash);
    // }

    const message = {
      member: walletAddress,
      agreement:
        'By signing this, you agree to be bound by the terms set forth in the Odos DAO LLC Amended and Restated Operating Agreement (as amended from time to time), available at: https://docs.odos.xyz/home/dao/operating-agreement.',
      nonce: 0n,
    };
    const signature = await walletClient.signTypedData({
      types: {
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
        Registration: [
          {
            name: 'member',
            type: 'address',
          },
          {
            name: 'agreement',
            type: 'string',
          },
          {
            name: 'nonce',
            type: 'uint256',
          },
        ],
      },
      primaryType: 'Registration',
      domain: {
        name: 'OdosDaoRegistry',
        version: '1',
        chainId: BigInt(client.chainData.id),
        verifyingContract: '0x8bDA13Bc6DC08d4008C9f3A72C4572C98478502c',
      },
      message,
    });

    const args = [proofRes.claim, message, proofRes.signature, signature];

    let updatedGas;
    if (currentNetworkGasMultiplier) {
      const gasLimitMp = getRandomNumber(currentNetworkGasMultiplier);

      const encodedData = encodeFunctionData({
        abi: ABI,
        functionName: 'registerAndClaim',
        args,
      });

      const gas = await publicClient.estimateGas({
        account: client.walletClient.account,
        to: contract,
        data: encodedData,
        ...feeOptions,
      });

      updatedGas = BigInt(addNumberPercentage(Number(gas), gasLimitMp).toFixed(0));
    }

    const txHash = await walletClient.writeContract({
      address: contract,
      abi: ABI,
      functionName: 'registerAndClaim',
      args,
      ...feeOptions,
      gas: 'gas' in feeOptions ? (feeOptions.gas as bigint) : updatedGas,
    });

    await client.waitTxReceipt(txHash);

    await dbRepo.update(walletInDb.id, {
      status: CLAIM_STATUSES.CLAIM_SUCCESS,
      claimAmount: amountInt,
      nativeBalance,
      balance: currentBalance + amountInt,
    });

    return {
      tgMessage: `Claimed ${amountInt} ODOS`,
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

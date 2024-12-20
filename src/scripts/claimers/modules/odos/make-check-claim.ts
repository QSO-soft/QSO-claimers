import { TransactionCallbackParams, TransactionCallbackReturn, transactionWorker } from '../../../../helpers';
import { TransformedModuleParams } from '../../../../types';

export const execMakeCheckClaimOdos = async (params: TransformedModuleParams) =>
  transactionWorker({
    ...params,
    startLogMessage: 'Execute make check claim ODOS...',
    transactionCallback: makeCheckClaimOdos,
  });

const makeCheckClaimOdos = async (params: TransactionCallbackParams): TransactionCallbackReturn => {
  // const { client, dbSource, network, wallet, proxyAgent } = params;
  //
  // const { walletAddress, publicClient } = client;
  //
  // if (!dbSource) {
  //   return {
  //     status: 'critical',
  //     message: DB_NOT_CONNECTED,
  //   };
  // }
  //
  // let nativeBalance = 0;
  // let amountInt = 0;
  // let currentBalance = 0;
  //
  // const dbRepo = dbSource.getRepository(OdosClaimEntity);
  //
  // const headers = getHeaders(HEADERS);
  // const config = await getAxiosConfig({
  //   proxyAgent,
  //   headers,
  // });
  // const dataProps = {
  //   network,
  //   config,
  //   walletAddress,
  //   chainId: client.chainData.id,
  // };
  //
  // let walletInDb = await dbRepo.findOne({
  //   where: {
  //     walletId: wallet.id,
  //     index: wallet.index,
  //   },
  // });
  //
  // if (walletInDb) {
  //   await dbRepo.remove(walletInDb);
  // }
  //
  // const created = dbRepo.create({
  //   walletId: wallet.id,
  //   index: wallet.index,
  //   walletAddress,
  //   network,
  //   nativeBalance,
  //   status: 'New',
  // });
  // walletInDb = await dbRepo.save(created);
  //
  // try {
  //   const { int } = await client.getNativeBalance();
  //   nativeBalance = +int.toFixed(6);
  //
  //   const proofRes = await getProofData(dataProps);
  //
  //   if (!proofRes?.claimableTokenBalance || !proofRes?.proof) {
  //     await dbRepo.update(walletInDb.id, {
  //       status: CLAIM_STATUSES.NOT_ELIGIBLE,
  //     });
  //
  //     return {
  //       status: 'passed',
  //       message: getCheckClaimMessage(CLAIM_STATUSES.NOT_ELIGIBLE),
  //     };
  //   }
  //
  //   const amountWei = BigInt(proofRes.amount);
  //   amountInt = decimalToInt({
  //     amount: amountWei,
  //   });
  //
  //   const { currentBalance: currentBalanceInt } = await getBalance(client);
  //   currentBalance = currentBalanceInt;
  //
  //   const claimed = (await publicClient.readContract({
  //     address: CLAIM_CONTRACT,
  //     abi: ABI,
  //     functionName: 'hasClaimed',
  //     args: [walletAddress],
  //   })) as boolean;
  //
  //   if (claimed) {
  //     if (currentBalance === 0) {
  //       await dbRepo.update(walletInDb.id, {
  //         status: CLAIM_STATUSES.CLAIMED_AND_SENT,
  //         claimAmount: amountInt,
  //         nativeBalance,
  //         balance: currentBalance,
  //       });
  //
  //       const status = getCheckClaimMessage(CLAIM_STATUSES.CLAIMED_AND_SENT);
  //
  //       return {
  //         status: 'passed',
  //         message: status,
  //         tgMessage: `${status} | Amount: ${amountInt}`,
  //       };
  //     }
  //
  //     await dbRepo.update(walletInDb.id, {
  //       status: CLAIM_STATUSES.CLAIMED_NOT_SENT,
  //       claimAmount: amountInt,
  //       nativeBalance,
  //       balance: currentBalance,
  //     });
  //
  //     const status = getCheckClaimMessage(CLAIM_STATUSES.CLAIMED_NOT_SENT);
  //
  //     return {
  //       status: 'passed',
  //       message: status,
  //       tgMessage: `${status} | Amount: ${amountInt}`,
  //     };
  //   }
  //
  //   const status = getCheckClaimMessage(CLAIM_STATUSES.NOT_CLAIMED);
  //   return {
  //     status: 'success',
  //     message: status,
  //     tgMessage: `${status} | Amount: ${amountInt}`,
  //   };
  // } catch (err) {
  //   await dbRepo.update(walletInDb.id, {
  //     status: CLAIM_STATUSES.CHECK_ERROR,
  //     claimAmount: amountInt,
  //     nativeBalance,
  //     balance: currentBalance,
  //     error: formatErrMessage(err),
  //   });
  //
  //   throw err;
  // }

  return {
    status: 'error',
    message: 'Module will be later',
  };
};

import { TransactionCallbackParams, TransactionCallbackReturn, transactionWorker } from '../../../../helpers';
import { TransformedModuleParams } from '../../../../types';
import { abi, CONTRACT } from './constants';

export const execMakeDelegateRegistry = async (params: TransformedModuleParams) =>
  transactionWorker({
    ...params,
    startLogMessage: 'Execute make delegate registry...',
    transactionCallback: makeDelegateRegistry,
  });

const makeDelegateRegistry = async (params: TransactionCallbackParams): TransactionCallbackReturn => {
  const { client, logger, wallet, network } = params;
  const { walletAddress, delegateToAddress } = wallet;
  const { explorerLink, walletClient, publicClient } = client;

  if (!delegateToAddress) {
    return {
      status: 'error',
      message: 'Please provide delegateToAddress to delegate-wallets.csv',
    };
  }
  logger.info(`Delegating from ${walletAddress} to ${delegateToAddress} in ${network}...`);

  const rights = '0x0000000000000000000000000000000000000000000000000000000000000000';
  const isAlreadyDelegated = await publicClient.readContract({
    address: CONTRACT,
    abi,
    functionName: 'checkDelegateForAll',
    args: [delegateToAddress, walletAddress, rights],
  });
  if (isAlreadyDelegated) {
    return {
      status: 'passed',
      message: 'Already delegated',
    };
  }

  const txHash = await walletClient.writeContract({
    address: CONTRACT,
    abi,
    functionName: 'delegateAll',
    args: [delegateToAddress, rights, true],
    // value,
  });

  const resMsg = `Delegated registry ${walletAddress} > ${delegateToAddress} in ${network}`;

  return {
    status: 'success',
    tgMessage: resMsg,
    txHash,
    explorerLink,
  };
};

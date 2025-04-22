import {
  calculateAdvancedAmount,
  getClientByNetwork,
  getContractData,
  getGasOptions,
  getNativeTokenByNetwork,
  getRandomItemFromArray,
  getRandomNetwork,
  getTrimmedLogsAmount,
  TransactionCallbackParams,
  TransactionCallbackResponse,
  TransactionCallbackReturn,
  transactionWorker,
} from '../../../../helpers';
import { Tokens, TransformedModuleParams } from '../../../../types';

export const execMakeHyperlaneNexusBridge = async (params: TransformedModuleParams) =>
  transactionWorker({
    ...params,
    startLogMessage: 'Execute make Hyperlane Nexus bridge...',
    transactionCallback: makeHyperlaneNexusBridge,
  });

export const makeHyperlaneNexusBridge = async (props: TransactionCallbackParams): TransactionCallbackReturn => {
  const {
    client,
    logger,
    balanceToLeft,
    destinationNetwork: destinationNetworkProp,
    minAndMaxAmount,
    wallet,
    gasLimitRange,
    minAmount,
    usePercentBalance,
    gweiRange,
    network,
    destinationNetworks,
    maxAmount,
    minTokenBalance,
    randomNetworks,
    useUsd,
    nativePrices,
  } = props;
  let destinationNetwork = destinationNetworkProp;
  if (destinationNetworks?.length) {
    destinationNetwork = getRandomItemFromArray(destinationNetworks);
  }

  const destinationClient = getClientByNetwork(destinationNetwork, wallet.privKey, logger);

  const tokenToBridge = 'HYPER';

  let currentNetwork = network;
  let currentClient = client;
  let nativeToken = getNativeTokenByNetwork(currentNetwork);

  const { tokenContractInfo, isNativeToken, token } = getContractData({
    nativeToken,
    network: currentNetwork,
    token: tokenToBridge,
  });
  let currentToken = token;
  let currentTokenContractInfo = tokenContractInfo;

  const randomNetworksLength = randomNetworks?.length || 0;
  if (randomNetworksLength) {
    const res = await getRandomNetwork({
      wallet,
      randomNetworks,
      logger,
      useUsd,
      nativePrices,
      tokenContractInfo: currentTokenContractInfo,
      minTokenBalance,
      client: currentClient,
      network: currentNetwork,
      token: currentToken,
      isNativeToken,
      isWithdrawal: false,
      destinationNetwork,
    });

    if ('status' in res) {
      return res as TransactionCallbackResponse;
    }
    currentClient = res.client;
    currentNetwork = res.network;
    currentToken = res.token;
    currentTokenContractInfo = res.tokenContractInfo;
  }

  const { walletClient, publicClient, explorerLink } = currentClient;

  nativeToken = getNativeTokenByNetwork(currentNetwork);

  const dstChainId = destinationClient.chainData.id;

  const balance = await currentClient.getNativeOrContractBalance(isNativeToken, currentTokenContractInfo);

  const logBal = getTrimmedLogsAmount(balance.int, nativeToken);
  if (!randomNetworksLength && minTokenBalance && balance.int < minTokenBalance) {
    return {
      status: 'passed',
      message: `Balance ${logBal} in ${network} is lower than minTokenBalance ${minTokenBalance}`,
    };
  }

  const { amountWei, amountInt } = calculateAdvancedAmount({
    destToken: getNativeTokenByNetwork(destinationNetwork),
    nativePrices,
    minAndMaxAmount,
    usePercentBalance,
    balanceToLeft,
    balance,
    minAmount,
    maxAmount,
    token: currentToken,
  });

  if (currentNetwork === destinationNetwork) {
    return {
      status: 'error',
      message: `Destination network [${destinationNetwork}] cannot be the same as network [${network}]`,
    };
  }

  const logAmount = getTrimmedLogsAmount(amountInt, currentToken as Tokens);
  const recipientAddress = wallet.transferAddress || wallet.walletAddress;
  const isSameAddress = recipientAddress === wallet.walletAddress;

  logger.info(
    `Making bridge of [${logAmount}] from [${currentNetwork}] to [${destinationNetwork}] with recipient address [${recipientAddress}]`
  );

  const value = (await publicClient.readContract({
    address: currentTokenContractInfo?.address || '0x',
    abi,
    functionName: 'quoteGasPayment',
    args: [dstChainId],
  })) as bigint;

  const feeOptions = await getGasOptions({
    gweiRange,
    gasLimitRange,
    network,
    publicClient,
  });

  const txHash = await walletClient.writeContract({
    address: currentTokenContractInfo?.address || '0x',
    abi,
    functionName: 'transferRemote',
    value,
    args: [dstChainId, `0x000000000000000000000000${recipientAddress.slice(2)}`, amountWei],
    ...feeOptions,
  });

  await currentClient.waitTxReceipt(txHash);

  const recipientMsg = isSameAddress ? '' : ` | Recipient: ${recipientAddress}`;
  return {
    status: 'success',
    txHash,
    explorerLink,
    tgMessage: `Bridge [${currentNetwork}] > [${destinationNetwork}] | Amount [${logAmount}]${recipientMsg}`,
  };
};

const abi = [
  {
    inputs: [
      { internalType: 'uint32', name: '_destination', type: 'uint32' },
      { internalType: 'bytes32', name: '_recipient', type: 'bytes32' },
      { internalType: 'uint256', name: '_amountOrId', type: 'uint256' },
    ],
    name: 'transferRemote',
    outputs: [{ internalType: 'bytes32', name: 'messageId', type: 'bytes32' }],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint32', name: 'destinationDomain', type: 'uint32' }],
    name: 'quoteGasPayment',
    outputs: [{ internalType: 'uint256', name: 'gas', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
];

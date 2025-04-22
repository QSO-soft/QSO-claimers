import { LoggerType } from '../../logger';
import { SupportedNetworks, TokenContract, Tokens, WalletData } from '../../types';
import { ClientType, getClientByNetwork } from '../clients';
import { CryptoCompareResult } from '../currency-handlers';
import { getTrimmedLogsAmount } from '../show-logs';
import { getRandomItemFromArray, shuffleArray } from '../utils';
import { getContractData } from './get-contract-data';

interface GetRandomNetwork {
  wallet: WalletData;
  randomNetworks: SupportedNetworks[];
  logger: LoggerType;
  nativePrices: CryptoCompareResult;
  network: SupportedNetworks;
  client: ClientType;
  token?: Tokens;
  isNativeToken?: boolean;
  tokenContractInfo?: TokenContract;
  minTokenBalance?: number;
  useUsd?: boolean;
  isWithdrawal?: boolean;
  destinationNetwork?: SupportedNetworks;
}
export const getRandomNetwork = async ({
  wallet,
  randomNetworks,
  logger,
  nativePrices,
  minTokenBalance = 0,
  useUsd = false,
  network,
  tokenContractInfo,
  token,
  client,
  isNativeToken,
  destinationNetwork,
  isWithdrawal = true,
}: GetRandomNetwork) => {
  let shuffledNetworks = shuffleArray(randomNetworks);
  if (destinationNetwork) {
    shuffledNetworks = shuffledNetworks.filter((network) => network !== destinationNetwork);
  }

  const nativeToken = client.chainData.nativeCurrency.symbol as Tokens;
  let currentNetwork = network;
  let currentToken = token;
  let currentTokenContractInfo = tokenContractInfo;
  let currentIsNativeToken = isNativeToken === undefined ? true : isNativeToken;
  let currentClient = client;

  const availableNetworks = [];
  for (const network of shuffledNetworks) {
    currentClient = getClientByNetwork(network, wallet.privKey, logger);
    const nativeToken = currentClient.chainData.nativeCurrency.symbol as Tokens;

    const { tokenContractInfo, token, isNativeToken } = getContractData({
      nativeToken,
      network,
      token: currentToken,
    });

    currentNetwork = network;
    currentToken = token;
    currentTokenContractInfo = tokenContractInfo;
    currentIsNativeToken = isNativeToken;

    let currentMinTokenBalance = minTokenBalance;
    if (useUsd && currentMinTokenBalance) {
      const tokenPrice = nativePrices[token];

      if (!tokenPrice) {
        throw new Error(`Unable to get ${token} price`);
      }

      currentMinTokenBalance = currentMinTokenBalance / tokenPrice;
    }

    const balance = await currentClient.getNativeOrContractBalance(isNativeToken, tokenContractInfo);

    if (currentMinTokenBalance && balance.int > currentMinTokenBalance) {
      if (isWithdrawal) {
        const successMessage = `Balance of ${getTrimmedLogsAmount(
          balance.int,
          token
        )} in ${network} network already more than or equals ${getTrimmedLogsAmount(currentMinTokenBalance, token)}`;

        return {
          status: 'passed',
          message: successMessage,
        };
      } else {
        availableNetworks.push({
          network: currentNetwork,
          token: currentToken,
          tokenContractInfo: currentTokenContractInfo,
          isNativeToken: currentIsNativeToken,
          client: currentClient,
        });
      }
    }
  }

  if (availableNetworks.length) {
    const randomNetwork = getRandomItemFromArray(availableNetworks);
    return {
      ...randomNetwork,
      token: randomNetwork.token || nativeToken,
    };
  }

  if (isWithdrawal || !minTokenBalance) {
    return {
      network: currentNetwork,
      token: currentToken || nativeToken,
      tokenContractInfo: currentTokenContractInfo,
      isNativeToken: currentIsNativeToken,
      client: currentClient,
    };
  } else {
    const successMessage = `Balances of provided random networks are lower than minBalance ${minTokenBalance}`;

    return {
      status: 'passed',
      message: successMessage,
    };
  }
};

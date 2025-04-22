import axios from 'axios';

import settings from '../../_inputs/settings/settings';
import { CRYPTO_COMPARE_URL, GECKO_API_URL } from '../../constants/urls';
import type { LoggerType } from '../../logger';
import { ProxyAgent, SUPPORTED_NETWORKS } from '../../types';
import { getNativeTokenByNetwork } from '../clients';
import { getFormattedErrorMessage } from '../main';
import { createRandomProxyAgent, getAxiosConfig, getHeaders, sleep } from '../utils';

const SLEEP_BETWEEN_FAIL = 10;

export const COIN_GECKO_TOKEN_ID_MAP = {
  eth: 'ethereum',
  usdt: 'tether',
  bnb: 'binancecoin',
  sol: 'solana',
  usdc: 'usd-coin',
  avax: 'avalanche-2',
  trx: 'tron',
  dot: 'polkadot',
  matic: 'matic-network',
  dai: 'dai',
  atom: 'cosmos',
  op: 'optimism',
  apt: 'aptos',
  arb: 'arbitrum',
  sui: 'sui',
  ftm: 'fantom',
};
interface CoingeckoResponse {
  data: Record<string, { usd: number }>;
}

export type CoinPricesType = Record<string, number>;

interface GetPrices {
  logger: LoggerType;
  coins: string[];
  proxyAgent?: ProxyAgent;
}

export const getCoinsPriceCoingecko = async (props: GetPrices): Promise<CoinPricesType | void> => {
  const { coins, logger, proxyAgent } = props;
  const lcCoins = coins.map((coin) => coin.toLowerCase());

  const coinPrices: CoinPricesType = {};

  try {
    const headers = getHeaders();
    const config = await getAxiosConfig({
      proxyAgent,
      headers,
    });

    const ids = lcCoins
      .filter((coin) => coin in COIN_GECKO_TOKEN_ID_MAP)
      .map((coin) => COIN_GECKO_TOKEN_ID_MAP[coin as keyof typeof COIN_GECKO_TOKEN_ID_MAP])
      .join();

    if (!ids) {
      return;
    }

    const { data }: CoingeckoResponse = await axios.get(`${GECKO_API_URL}/simple/price`, {
      params: {
        ids,
        vs_currencies: 'usd',
      },
      ...config,
    });

    for (const key in data) {
      const price = data[key as keyof typeof data]?.usd;

      if (typeof price !== 'undefined') {
        coinPrices[key] = price;
      }
    }

    return coinPrices;
  } catch (err) {
    logger.warning(`Unable to get ${coins} price`, { action: 'getCoinPrice' });
    await sleep(SLEEP_BETWEEN_FAIL);
    await getCoinsPriceCoingecko(props);
  }

  return coinPrices;
};

type CryptoCompareResponse = Record<string, { USD: number }> | null;
export type CryptoCompareResult = Record<string, number>;

export const getCoinPriceCryptoCompare = async (props: GetPrices): Promise<CryptoCompareResult> => {
  const { coins, logger, proxyAgent: proxyAgentProp } = props;

  let coinPrice: CryptoCompareResponse = null;

  const coinsString = coins.join(',');
  while (!coinPrice) {
    let proxyAgent;

    if (settings.useProxy) {
      const proxyData = await createRandomProxyAgent();

      if (proxyData) {
        proxyAgent = proxyData.proxyAgent;
      }
    }

    try {
      const headers = getHeaders();
      const config = await getAxiosConfig({
        proxyAgent: proxyAgentProp || proxyAgent,
        headers,
      });

      const response = await axios.get(`${CRYPTO_COMPARE_URL}`, {
        params: {
          fsyms: coinsString,
          tsyms: 'USD',
        },
        ...config,
      });

      if (response.data.Response === 'Error') {
        throw new Error(response.data.Message);
      }

      coinPrice = response.data;
    } catch (err) {
      const errorMessage = getFormattedErrorMessage(err, 'eth');
      logger.error(`Unable to get ${coinsString} price. Reason: ${errorMessage}`, { action: 'getCoinPrice' });
      await sleep(SLEEP_BETWEEN_FAIL);
    }
  }

  return Object.fromEntries(Object.entries(coinPrice).map(([currency, { USD }]) => [currency, USD]));
};

export const getAllNativePrices = async (logger: LoggerType) => {
  // TODO: update later
  const filteredNetworks = SUPPORTED_NETWORKS.filter(
    (network) => network !== 'aptos' && network !== 'holesky' && network !== 'layerZero'
  );

  const allUniqueNativeTokens = [
    ...new Set([
      ...filteredNetworks.map((network) => getNativeTokenByNetwork(network)),
      'USDT',
      'USDC',
      'DAI',
      'WETH',
      'HYPER',
    ]),
  ];

  return await getCoinPriceCryptoCompare({
    logger,
    coins: allUniqueNativeTokens,
  });
};

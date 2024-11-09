import { sep } from 'path';

import axios from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { SocksProxyAgent } from 'socks-proxy-agent';

import { BASE_TIMEOUT, INPUTS_CSV_FOLDER } from '../../constants';
import { LoggerType } from '../../logger';
import {
  JsonProxyObject,
  OptionalPreparedProxyData,
  OptionalProxyObject,
  PreparedProxyData,
  ProxyAgent,
} from '../../types';
import { convertAndWriteToJSON } from '../file-handlers';
import { getAxiosConfig } from './get-axios-config';
import { getUserAgentHeader } from './get-headers';
import { getRandomItemFromArray } from './randomizers';

export const MY_IP_API_URL = 'https://api.myip.com';

export const createProxyAgent = (proxy = '', logger?: LoggerType): ProxyAgent | null => {
  try {
    let proxyAgent = null;

    if (proxy) {
      if (proxy.includes('http')) {
        proxyAgent = new HttpsProxyAgent(proxy);
      }

      if (proxy.includes('socks')) {
        proxyAgent = new SocksProxyAgent(proxy);
      }
    }

    return proxyAgent;
  } catch (err) {
    if (err instanceof Error && err.message.includes('Invalid URL')) {
      logger?.error('You use incorrect proxy format, it should be login:pass@ip:port');
    } else {
      const error = err as Error;
      logger?.error(`Unable to create proxy agent: ${error.message}`);
    }
  }

  return null;
};

export const getRandomProxy = async (logger?: LoggerType) => {
  const inputPath = `${INPUTS_CSV_FOLDER}${sep}proxies.csv`;

  const proxies = (await convertAndWriteToJSON({
    inputPath,
    logger,
  })) as JsonProxyObject[];

  const randomProxy = getRandomItemFromArray(proxies);

  if (randomProxy) {
    return prepareProxy(randomProxy);
  }

  return;
};

export const prepareProxy = (proxyObj: JsonProxyObject, logger?: LoggerType): OptionalPreparedProxyData => {
  try {
    const urlPattern = /^(socks5|http|https):\/\/([^:]+):([^@]+)@([^:]+):(\d+)$/i;
    const match = proxyObj.proxy.match(urlPattern);

    if (!match) {
      logger?.error('Invalid proxy URL format');
      return;
    }

    const [, type, login, pass, ip, port] = match;

    if (!type || !login || !pass || !ip || !port) {
      logger?.error('Invalid proxy URL format');
      return;
    }

    return {
      url: proxyObj.proxy,
      proxyType: type.toUpperCase(),
      proxyIp: ip,
      proxyPort: port,
      proxyLogin: login,
      proxyPass: pass,
      updateProxyLink: proxyObj.updateProxyLink,
    };
  } catch (err) {
    const error = err as Error;
    logger?.error(`Unable to prepare proxy: ${error.message}`);
    return;
  }
};

export const prepareProxyAgent = async (
  proxyData: PreparedProxyData,
  logger?: LoggerType
): Promise<OptionalProxyObject> => {
  const { url, updateProxyLink, ...restProxyData } = proxyData;

  const proxyAgent = createProxyAgent(url, logger);

  if (proxyAgent) {
    const config = await getAxiosConfig({
      proxyAgent,
      withoutAbort: true,
    });

    if (updateProxyLink) {
      try {
        await axios.get(updateProxyLink, {
          headers: {
            'Content-Type': 'text/html',
            Accept: '*/*',
            Connection: 'Keep-Alive',
            'User-Agent': getUserAgentHeader()['User-Agent'],
          },
          timeout: BASE_TIMEOUT,
        });
      } catch (err) {
        const errMsg = (err as Error).message;

        const errPrefix = 'Unable to update proxy ip: ';
        if (errMsg.includes('socket hang up')) {
          logger?.error(errPrefix + 'Please try to remove port from updateProxyLink domain');
        } else if (errMsg.includes('self-signed certificate')) {
          logger?.error(errPrefix + 'Please try to change protocol from https to http');
        } else {
          logger?.error(errPrefix + errMsg);
        }
      }
    }

    // show current IP address
    let currentIp = '';
    if (logger) {
      const message = 'It can be temporal error or proxy doesn`t work';
      try {
        const response = await axios.get(MY_IP_API_URL, config);

        const data = response?.data;

        if (data && !data.error) {
          currentIp = data?.ip;
          logger.info(`Current IP: ${currentIp} | ${data?.country}`);
        } else {
          logger?.warning(`Unable to check current IP: ${data?.error}. ${message}`);
        }
      } catch (err) {
        const error = err as Error;
        logger?.warning(`Unable to check current IP: ${error.message}. ${message}`);
      }
    }

    return {
      proxyAgent,
      url,
      ...restProxyData,
      currentIp,
    };
  }

  return null;
};

export const getProxyAgent = async (
  proxy: string,
  updateProxyLink?: string,
  logger?: LoggerType
): Promise<OptionalProxyObject> => {
  const preparedProxyData = prepareProxy({ proxy, updateProxyLink }, logger);

  if (preparedProxyData) {
    return prepareProxyAgent(preparedProxyData, logger);
  }

  return null;
};

export const createRandomProxyAgent = async (logger?: LoggerType): Promise<OptionalProxyObject> => {
  const proxy = await getRandomProxy();

  if (proxy) {
    return prepareProxyAgent(proxy, logger);
  }

  return null;
};

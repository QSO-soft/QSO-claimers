import { LoggerType } from '../../logger';
import { MaxGas, WalletData } from '../../types';
import { getClientByNetwork } from '../clients';
import { sleep } from '../utils';
import { getCurrentGas } from './get-gas';

interface WaiGasGeneral {
  wallet: WalletData;
  logger: LoggerType;
  sleepSeconds: number;
}
interface WaitGas extends WaiGasGeneral {
  maxGas?: MaxGas;
}

export const waitGas = async ({ maxGas, logger, wallet, sleepSeconds }: WaitGas) => {
  if (!maxGas) {
    return;
  }

  const network = maxGas[0];
  const maxGasValue = maxGas[1];

  if (maxGasValue === 0) {
    return;
  }

  const client = getClientByNetwork(network, wallet.privKey, logger);

  let isGoodGas = false;
  while (!isGoodGas) {
    const currentGas = await getCurrentGas(client.publicClient);

    if (currentGas > maxGasValue) {
      logger.warning(
        `Gwei is too high. Current Gwei [${currentGas}] in ${network} > Max Gwei [${maxGasValue}]. Wait [${sleepSeconds}] sec`,
        {
          action: 'checkGasPrice',
        }
      );
      await sleep(sleepSeconds);
    } else {
      isGoodGas = true;
    }
  }
};

interface WaitGasMultiple extends WaiGasGeneral {
  maxGas: MaxGas[];
}
export const waitGasMultiple = async ({ maxGas, logger, wallet, sleepSeconds }: WaitGasMultiple) => {
  const maxGasWithClients = maxGas
    .filter(([_, value]) => value > 0)
    .map(([network, value]) => ({
      value,
      network,
      client: getClientByNetwork(network, wallet.privKey, logger),
    }));

  if (!maxGasWithClients.length) {
    return;
  }

  let isGoodGas = false;
  while (!isGoodGas) {
    let countOfGoodGas = 0;
    for (const { value, network, client } of maxGasWithClients) {
      const currentGas = await getCurrentGas(client.publicClient);

      if (currentGas > value) {
        logger.warning(
          `Gwei is too high. Current Gwei [${currentGas}] in ${network} > Max Gwei [${value}]. Wait [${sleepSeconds}] sec`,
          {
            action: 'checkGasPrice',
          }
        );

        break;
      } else {
        countOfGoodGas++;
      }
    }

    if (countOfGoodGas === maxGasWithClients.length) {
      isGoodGas = true;
    } else {
      countOfGoodGas = 0;
      await sleep(sleepSeconds);
    }
  }
};

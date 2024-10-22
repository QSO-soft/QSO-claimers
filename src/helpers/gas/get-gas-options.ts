import { formatGwei, parseGwei, PublicClient } from 'viem';

import settings from '../../_inputs/settings/settings';
import { NumberRange, SupportedNetworks } from '../../types';
import { checkLegacyTypeByNetwork } from '../clients';
import { getCurrentGas } from '../gas';
import { addNumberPercentage, getRandomNumber, subtractNumberPercentage } from '../utils';

export const parseCurrentGwei = (gwei: number) => parseGwei(gwei.toString());

interface GetGasOptions {
  publicClient: PublicClient;
  network: SupportedNetworks;
  isLegacy?: boolean;
  gweiRange?: NumberRange;
  gasLimitRange?: NumberRange;
}

export type GetGasOptionsRes =
  | { maxPriorityFeePerGas: bigint; maxFeePerGas: bigint }
  | { gasPrice: bigint }
  | Record<never, never>;
export const getGasOptions = async (params: GetGasOptions): Promise<GetGasOptionsRes> => {
  const { gweiRange, gasLimitRange, network, publicClient } = params;

  const gweiRangeToUse = gweiRange || settings.gweiRange[network];
  const isLegacy =
    typeof params.isLegacy === 'undefined' ? checkLegacyTypeByNetwork(network) || false : params.isLegacy;

  let maxFeePerGas;
  let maxPriorityFeePerGas;
  let gasPrice;

  const percentForGwei = 2;

  const isFeeByGweiRange = !!gweiRangeToUse && gweiRangeToUse[0] !== 0 && gweiRangeToUse[1] !== 0;
  if (isFeeByGweiRange) {
    const currentGwei = addNumberPercentage(getRandomNumber(gweiRangeToUse), percentForGwei);

    if (isLegacy) {
      gasPrice = parseCurrentGwei(currentGwei);
    } else {
      maxFeePerGas = parseCurrentGwei(currentGwei);
      maxPriorityFeePerGas = parseCurrentGwei(subtractNumberPercentage(currentGwei, percentForGwei));
    }
  }

  if (!isFeeByGweiRange) {
    const percentToUpdate = settings.gasMultiplier[network];

    if (percentToUpdate) {
      if (isLegacy) {
        const currentGasPrice = await getCurrentGas(publicClient);
        const currentGwei = addNumberPercentage(currentGasPrice, percentToUpdate);

        gasPrice = parseCurrentGwei(currentGwei);
      } else {
        const estimateFees = await publicClient.estimateFeesPerGas();
        const updatedMaxFeePerGas = addNumberPercentage(
          parseFloat(formatGwei(estimateFees.maxFeePerGas)),
          percentToUpdate
        );
        const updatedMaxPriorityFeePerGas = addNumberPercentage(
          estimateFees.maxPriorityFeePerGas <= 10000n
            ? subtractNumberPercentage(parseFloat(formatGwei(estimateFees.maxFeePerGas)), 2)
            : parseFloat(formatGwei(estimateFees.maxPriorityFeePerGas)),
          percentToUpdate
        );

        maxFeePerGas = parseCurrentGwei(updatedMaxFeePerGas);
        maxPriorityFeePerGas = parseCurrentGwei(updatedMaxPriorityFeePerGas);
      }
    }
  }

  let gasLimitOption = {};
  if (gasLimitRange) {
    gasLimitOption = {
      gas: BigInt(getRandomNumber(gasLimitRange, true)),
    };
  }
  if (maxFeePerGas && maxPriorityFeePerGas && !isLegacy) {
    return {
      ...gasLimitOption,
      maxFeePerGas,
      maxPriorityFeePerGas,
    };
  }

  if (gasPrice && isLegacy) {
    return {
      ...gasLimitOption,
      gasPrice,
    };
  }

  return {
    ...gasLimitOption,
  };
};

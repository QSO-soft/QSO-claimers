import { Hex } from 'viem';

import settings from '../../_inputs/settings/settings';
import { defaultTokenAbi } from '../../clients/abi';
import { calculateAmount, ClientType, getTrimmedLogsAmount, intToDecimal } from '../../helpers';
import { ContractPairs, NumberRange, Pairs, SupportedNetworks, SwapModuleNames, Tokens } from '../../types';
import { SWAP_TOKEN_CONTRACT_BY_NETWORK } from './constants';
import { makeIzumiSwap } from './izumi-swap';
import { makeSyncSwap } from './sync-swap';

export const calculateMinAmountOut = async (minAmountOut: bigint, slippage: number) => {
  const intMinAmount = Number(minAmountOut);

  return Number(Number(intMinAmount - (intMinAmount / 100) * slippage).toFixed(0));
};

export const getDeadline = (mins = 60) => {
  const timestamp = Math.floor(Date.now() / 1000);
  return timestamp + mins * 60;
};

export const getModuleForSwap = (swapModuleName: SwapModuleNames) => {
  switch (swapModuleName) {
    case 'sync-swap':
      return makeSyncSwap;
    case 'izumi-swap':
      return makeIzumiSwap;

    default:
      return;
  }
};

export const getSwapTgMessage = (srcToken: string, dstToken: string, amount: number) =>
  `${srcToken} > ${dstToken} ${getTrimmedLogsAmount(amount, srcToken as Tokens)}`;

interface SwapsDataProps {
  client: ClientType;
  network: SupportedNetworks;
  moduleName: string;
  minAndMaxAmount: NumberRange;
  usePercentBalance?: boolean;
  contractPairs?: ContractPairs;
  pairs?: Pairs;
  minTokenBalance?: number;
  roundAmount?: number;
}
export const getSwapsData = async (props: SwapsDataProps) => {
  const {
    minAndMaxAmount,
    usePercentBalance,
    moduleName,
    client,
    contractPairs,
    pairs,
    minTokenBalance,
    network,
    roundAmount,
  } = props;

  const nativeToken = client.chainData.nativeCurrency.symbol;
  let srcTokenContract: Hex | undefined;
  let dstTokenContract: Hex | undefined;
  let isNativeSrcTokenContract = false;
  let isNativeDstTokenContract = false;
  let srcToken: string = nativeToken;
  let dstToken: string = nativeToken;

  if (contractPairs) {
    const nativeContract = SWAP_TOKEN_CONTRACT_BY_NETWORK[network]?.[nativeToken];

    isNativeSrcTokenContract = contractPairs[0] === 'native';
    isNativeDstTokenContract = contractPairs[1] === 'native';

    srcTokenContract = isNativeSrcTokenContract ? nativeContract : (contractPairs[0] as Hex);
    dstTokenContract = isNativeDstTokenContract ? nativeContract : (contractPairs[1] as Hex);

    srcToken = isNativeSrcTokenContract
      ? nativeToken
      : await client.getSymbolByContract({
          name: 'src',
          address: srcTokenContract as Hex,
          abi: defaultTokenAbi,
        });
    dstToken = isNativeDstTokenContract
      ? nativeToken
      : await client.getSymbolByContract({
          name: 'dst',
          address: dstTokenContract as Hex,
          abi: defaultTokenAbi,
        });
  }

  if (pairs) {
    const [tokenFrom, tokenTo] = pairs;

    srcTokenContract = SWAP_TOKEN_CONTRACT_BY_NETWORK[network]?.[tokenFrom];
    dstTokenContract = SWAP_TOKEN_CONTRACT_BY_NETWORK[network]?.[tokenTo];

    srcToken = tokenFrom;
    dstToken = tokenTo;

    isNativeSrcTokenContract = srcToken === nativeToken;
    isNativeDstTokenContract = dstToken === nativeToken;
  }

  if (!srcTokenContract || !dstTokenContract) {
    return {
      status: 'warning',
      message: `You provided an unsupported token pair [${srcToken}/${dstToken}] in the configuration of [${moduleName}] module`,
    };
  }

  const srcTokenContractInfo = isNativeSrcTokenContract
    ? undefined
    : {
        name: srcTokenContract,
        address: srcTokenContract,
        abi: defaultTokenAbi,
      };
  const balanceSrcToken = await client.getNativeOrContractBalance(isNativeSrcTokenContract, srcTokenContractInfo);

  const minBalance =
    minTokenBalance || settings.minTokenBalance[srcToken as keyof typeof settings.minTokenBalance] || 0;

  if (balanceSrcToken.int <= minBalance) {
    return {
      status: 'warning',
      message: `Balance [${getTrimmedLogsAmount(
        balanceSrcToken.int,
        srcToken as Tokens
      )}] is lower than minTokenBalance [${minBalance}]`,
    };
  }

  let amountToSwapInt = calculateAmount({
    minAndMaxAmount,
    usePercentBalance,
    balance: balanceSrcToken.int,
  });

  if (roundAmount) {
    amountToSwapInt = Number(amountToSwapInt.toFixed(roundAmount));
  }

  const amountToSwapWei = intToDecimal({
    amount: amountToSwapInt,
    decimals: balanceSrcToken.decimals,
  });

  return {
    amountToSwapWei,
    amountToSwapInt,
    balanceSrcToken,
    isNativeSrcTokenContract,
    isNativeDstTokenContract,
    srcTokenContract,
    dstTokenContract,
    dstToken: dstToken as Tokens,
    srcToken: srcToken as Tokens,
  };
};

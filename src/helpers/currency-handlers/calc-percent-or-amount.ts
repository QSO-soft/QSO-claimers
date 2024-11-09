import { AMOUNT_IS_TOO_LOW_ERROR } from '../../constants';
import { LoggerType } from '../../logger';
import { BinanceNetworks, NumberRange, OkxNetworks, SupportedNetworks, TokenContract, WalletData } from '../../types';
import { ClientType, getClientByNetwork } from '../clients';
import { addNumberPercentage, getRandomNumber } from '../utils';
import { CryptoCompareResult } from './coin-price';
import { decimalToInt, ETH_DECIMAL, intToDecimal } from './wei-converter';

interface ICalculateAmount {
  minAndMaxAmount: NumberRange;
  usePercentBalance?: boolean;
  decimals?: number;
}
type NumberCalculateAmount = ICalculateAmount & { isBigInt?: false; balance: number };
type BigIntCalculateAmount = ICalculateAmount & { isBigInt: true; balance: bigint };

const calculatePercentAmount = (balance: number, percent: number) => (balance * percent) / 100;

export function calculateAmount(args: NumberCalculateAmount): number;
export function calculateAmount(args: BigIntCalculateAmount): bigint;
export function calculateAmount({
  balance,
  minAndMaxAmount,
  usePercentBalance,
  isBigInt,
  decimals = ETH_DECIMAL,
}: NumberCalculateAmount | BigIntCalculateAmount): number | bigint {
  let amount = getRandomNumber(minAndMaxAmount);

  if (usePercentBalance) {
    const percentValue = getRandomNumber(minAndMaxAmount, true);

    if (percentValue === 100) {
      return balance;
    }

    if (isBigInt) {
      const intBalance = decimalToInt({ amount: balance, decimals });
      amount = calculatePercentAmount(intBalance, percentValue);
    } else {
      amount = calculatePercentAmount(balance, percentValue);
    }
  }

  if (isBigInt) {
    return intToDecimal({ amount, decimals });
  }

  return amount;
}

export const getExpectedBalance = (expectedBalance?: NumberRange) => {
  const currentExpectedBalance = !!expectedBalance && getRandomNumber(expectedBalance);
  const isTopUpByExpectedBalance = !!currentExpectedBalance && currentExpectedBalance > 0;

  if (!currentExpectedBalance) {
    return {
      currentExpectedBalance: 0,
      isTopUpByExpectedBalance,
    };
  }

  return {
    currentExpectedBalance,
    isTopUpByExpectedBalance,
  };
};

interface GetTopUpOptions {
  isTopUpByExpectedBalance: boolean;
  currentExpectedBalance: number;
  tokenToWithdraw: string;
  client: ClientType;
  wallet: WalletData;
  minAndMaxAmount: NumberRange;
  network: SupportedNetworks | BinanceNetworks | OkxNetworks;
  nativePrices: CryptoCompareResult;
  useUsd?: boolean;
  amount?: number;
  minAmount?: number;
  percentToAdd?: number;
  minTokenBalance?: number;
  expectedBalanceNetwork?: SupportedNetworks;
  logger: LoggerType;
  fee?: number;
  isNativeTokenToWithdraw: boolean;
  withMinAmountError?: boolean;
  tokenContractInfo?: TokenContract;
}
export type GetTopUpOptionsResult =
  | {
      isDone: boolean;
      successMessage: string;
    }
  | {
      currentAmount: number;
      shouldTopUp: boolean;
      prevTokenBalance: number;
      destTokenBalance: number;

      currentMinAmount?: number;
    };

export const getTopUpOptions = async (props: GetTopUpOptions): Promise<GetTopUpOptionsResult> => {
  const {
    isTopUpByExpectedBalance,
    tokenToWithdraw,
    client,
    currentExpectedBalance: currentExpectedBalanceProp,
    amount: amountProp,
    minAmount,
    minAndMaxAmount,
    network,
    percentToAdd,
    minTokenBalance: minTokenBalanceProp = 0,
    wallet,
    fee = 0,
    logger,
    useUsd,
    nativePrices,
    expectedBalanceNetwork,
    tokenContractInfo,
    isNativeTokenToWithdraw,
    withMinAmountError = true,
  } = props;

  let amount = amountProp || getRandomNumber(minAndMaxAmount);
  let minTokenBalance = minTokenBalanceProp;
  let currentExpectedBalance = currentExpectedBalanceProp;
  let currentMinAmount = minAmount;

  if (useUsd) {
    const tokenPrice = nativePrices[tokenToWithdraw];

    if (!tokenPrice) {
      throw new Error(`Unable to get ${tokenToWithdraw} price`);
    }

    amount = amount / tokenPrice;
    minTokenBalance = minTokenBalance / tokenPrice;
    currentExpectedBalance = currentExpectedBalance / tokenPrice;
    currentMinAmount = currentMinAmount ? currentMinAmount / tokenPrice : currentMinAmount;
  }

  const { int: tokenBalance } = await client.getNativeOrContractBalance(isNativeTokenToWithdraw, tokenContractInfo);

  const mainTokenBalance = tokenBalance;

  let currentAmount: number = 0;

  if (mainTokenBalance >= minTokenBalance && minTokenBalance !== 0) {
    const successMessage = `Balance of ${tokenToWithdraw}=${mainTokenBalance.toFixed(
      6
    )} in ${network} network already more than or equals ${minTokenBalance.toFixed(6)}`;

    return {
      isDone: true,
      successMessage,
    };
  }

  let destTokenBalance;
  let destClient;

  if (expectedBalanceNetwork && expectedBalanceNetwork !== network) {
    const client = getClientByNetwork(expectedBalanceNetwork, wallet.privKey, logger);

    const { int } = await client.getNativeOrContractBalance(isNativeTokenToWithdraw, tokenContractInfo);

    destClient = client;
    destTokenBalance = int;
  } else {
    destClient = client;
    destTokenBalance = mainTokenBalance;
  }

  if (isTopUpByExpectedBalance) {
    if (currentExpectedBalance <= destTokenBalance) {
      const successMessage = `Balance of ${destClient.chainData.nativeCurrency.symbol}=${destTokenBalance.toFixed(
        4
      )} in ${network} network already more than or equals ${currentExpectedBalance.toFixed(6)}`;

      return {
        isDone: true,
        successMessage,
      };
    }

    currentAmount = calculateAmountWithFee(currentExpectedBalance - destTokenBalance, fee, percentToAdd);
  } else {
    currentAmount = calculateAmountWithFee(amount, fee, percentToAdd);

    if (currentAmount + destTokenBalance < minTokenBalance && withMinAmountError) {
      throw new Error(AMOUNT_IS_TOO_LOW_ERROR);
    }
  }

  const shouldTopUp = isTopUpByExpectedBalance
    ? destTokenBalance < currentExpectedBalance
    : destTokenBalance < minTokenBalance || minTokenBalance === 0;

  return {
    currentAmount,
    currentMinAmount,
    shouldTopUp,
    prevTokenBalance: tokenBalance,
    destTokenBalance,
  };
};

export const calculateAmountWithFee = (amount: number, fee: number, percentToAdd = 0): number => {
  return +addNumberPercentage(amount + fee, percentToAdd);
};

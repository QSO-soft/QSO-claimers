import { AMOUNT_IS_TOO_LOW_ERROR } from '../../constants';
import { LoggerType } from '../../logger';
import {
  Balance,
  BinanceNetworks,
  NumberRange,
  OkxNetworks,
  SupportedNetworks,
  TokenContract,
  Tokens,
  WalletData,
} from '../../types';
import { ClientType, getClientByNetwork, getNativeTokenByNetwork } from '../clients';
import { CryptoCompareResult, decimalToInt, ETH_DECIMAL, intToDecimal } from '../currency-handlers';
import { getContractData } from '../main';
import { getTrimmedLogsAmount } from '../show-logs';
import { addNumberPercentage, getRandomItemFromArray, getRandomNumber } from '../utils';

interface ICalculateAmount {
  minAndMaxAmount: NumberRange;
  usePercentBalance?: boolean;
  decimals?: number;
}
type NumberCalculateAmount = ICalculateAmount & { isBigInt?: false; balance: number };
type BigIntCalculateAmount = ICalculateAmount & { isBigInt: true; balance: bigint };

export const calculatePercentAmount = (balance: number, percent: number) => (balance * percent) / 100;
const calculateBigIntPercentAmount = (balance: bigint, percent: bigint) => (balance * percent) / 100n;

export function calculateAmount(args: NumberCalculateAmount): number;
export function calculateAmount(args: BigIntCalculateAmount): bigint;
export function calculateAmount({
  balance,
  minAndMaxAmount,
  usePercentBalance,
  isBigInt,
  decimals = ETH_DECIMAL,
}: NumberCalculateAmount | BigIntCalculateAmount): number | bigint {
  let amount: number | bigint = getRandomNumber(minAndMaxAmount);

  if (usePercentBalance) {
    const percentValue = getRandomNumber(minAndMaxAmount, false);

    if (percentValue === 100) {
      return balance;
    }

    if (isBigInt) {
      const amountInt = calculatePercentAmount(Number(balance), percentValue);
      amount = BigInt(+amountInt.toFixed(0));
    } else {
      amount = calculatePercentAmount(balance, +percentValue.toFixed(0));
    }
  } else {
    if (isBigInt) {
      return intToDecimal({ amount, decimals });
    }
  }

  return amount;
}

export const getExpectedBalance = (expectedBalance?: NumberRange) => {
  const currentExpectedBalance =
    !!expectedBalance && expectedBalance[0] && expectedBalance[1] && getRandomNumber(expectedBalance);
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
  client: ClientType;
  isTopUpByExpectedBalance: boolean;
  currentExpectedBalance: number;
  tokenToWithdraw: string;
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
  const balance = await client.getNativeOrContractBalance(isNativeTokenToWithdraw, tokenContractInfo);

  const { int: tokenBalance } = balance;
  const mainTokenBalance = tokenBalance;

  let currentAmount: number = 0;

  if (mainTokenBalance >= minTokenBalance && minTokenBalance !== 0) {
    const successMessage = `Balance of ${getTrimmedLogsAmount(mainTokenBalance, tokenToWithdraw as Tokens)}
   in ${network} network already more than or equals ${getTrimmedLogsAmount(
     minTokenBalance,
     tokenToWithdraw as Tokens
   )}`;

    return {
      isDone: true,
      successMessage,
    };
  }

  let destTokenBalance;

  if (expectedBalanceNetwork && expectedBalanceNetwork !== network) {
    const client = getClientByNetwork(expectedBalanceNetwork, wallet.privKey, logger);

    const { tokenContractInfo, isNativeToken: isNativeTokenToWithdraw } = getContractData({
      nativeToken: client.chainData.nativeCurrency.symbol as Tokens,
      network: expectedBalanceNetwork,
      token: tokenToWithdraw as Tokens,
    });

    const { int } = await client.getNativeOrContractBalance(isNativeTokenToWithdraw, tokenContractInfo);

    destTokenBalance = int;
  } else {
    destTokenBalance = mainTokenBalance;
  }

  if (isTopUpByExpectedBalance) {
    if (currentExpectedBalance <= destTokenBalance) {
      const symbol = getNativeTokenByNetwork(network);
      const successMessage = `Balance of ${getTrimmedLogsAmount(
        destTokenBalance,
        symbol as Tokens
      )} in ${network} network already more than or equals ${getTrimmedLogsAmount(
        currentExpectedBalance,
        symbol as Tokens
      )}`;

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

interface CalculateAdvancedAmount {
  minAndMaxAmount?: NumberRange;
  usePercentBalance: boolean;
  balance: Balance;
  token: Tokens;
  destToken?: Tokens;
  nativePrices: CryptoCompareResult;
  expectedBalance?: NumberRange;
  balanceToLeft?: NumberRange;
  destinationBalance?: Balance;
  minAmount?: number;
  maxAmount?: NumberRange;
  useUsd?: boolean;
}
export const calculateAdvancedAmount = ({
  minAndMaxAmount: minAndMaxAmountProp,
  usePercentBalance,
  balanceToLeft: balanceToLeftProp,
  expectedBalance,
  balance,
  token,
  destinationBalance,
  destToken,
  minAmount: minAmountProp,
  maxAmount: maxAmountProp,
  useUsd,
  nativePrices,
}: CalculateAdvancedAmount) => {
  const { currentExpectedBalance: currentExpectedBalanceProp, isTopUpByExpectedBalance } =
    getExpectedBalance(expectedBalance);

  const logBalance = getTrimmedLogsAmount(balance.int, token);

  let balanceToLeft = balanceToLeftProp;
  let currentExpectedBalance = currentExpectedBalanceProp;
  let minAndMaxAmount = minAndMaxAmountProp;
  let minAmount = minAmountProp;
  let maxAmount = maxAmountProp;

  const tokenPrice = nativePrices[token];

  if (!tokenPrice) {
    throw new Error(`Unable to get ${token} price`);
  }

  const destTokenPrice = nativePrices[destToken || token];

  if (!destTokenPrice) {
    throw new Error(`Unable to get ${destToken} price`);
  }

  if (useUsd) {
    currentExpectedBalance = currentExpectedBalance / destTokenPrice;
    minAmount = (minAmount || 0) / tokenPrice;
  }

  let amountWei = 0n;
  if (balanceToLeft && balanceToLeft[0] && balanceToLeft[1]) {
    if (useUsd) {
      balanceToLeft = [balanceToLeft[0] / tokenPrice || 0, balanceToLeft[1] / tokenPrice || 0];
    }

    const balanceToLeftInt = getRandomNumber(balanceToLeft);

    const balanceToLeftWei = intToDecimal({
      amount: balanceToLeftInt,
      decimals: balance.decimals,
    });

    amountWei = balance.wei - balanceToLeftWei;

    if (balance.int - balanceToLeftInt <= 0) {
      throw new Error(`Balance is ${logBalance} that is lower than balance to left ${balanceToLeftInt}`);
    }
  } else if (isTopUpByExpectedBalance && destinationBalance) {
    // TODO: make it normally
    const sumBalance = balance.int + destinationBalance.int;
    if (expectedBalance && sumBalance - currentExpectedBalance <= 0) {
      if (sumBalance >= expectedBalance[0]) {
        currentExpectedBalance = getRandomItemFromArray([expectedBalance[0], sumBalance]);
      } else {
        throw new Error(`Balance is ${logBalance} that is not enough for expected balance ${currentExpectedBalance}`);
      }
    }

    amountWei = intToDecimal({
      amount: currentExpectedBalance - destinationBalance.int,
      decimals: destinationBalance.decimals,
    });
  } else if (minAndMaxAmount) {
    if (useUsd) {
      minAndMaxAmount = [minAndMaxAmount[0] / tokenPrice || 0, minAndMaxAmount[1] / tokenPrice || 0];
    }

    amountWei = calculateAmount({
      balance: balance.wei,
      isBigInt: true,
      minAndMaxAmount,
      usePercentBalance,
      decimals: balance.decimals,
    });
  }

  if (maxAmount && maxAmount[0] && maxAmount[1]) {
    if (useUsd) {
      maxAmount = [maxAmount[0] / tokenPrice || 0, maxAmount[1] / tokenPrice || 0];
    }

    const maxAmountWei = intToDecimal({
      amount: getRandomNumber(maxAmount),
      decimals: balance.decimals,
    });

    if (amountWei > maxAmountWei) {
      amountWei = maxAmountWei;
    }
  }

  const amountInt = decimalToInt({
    amount: amountWei,
    decimals: balance.decimals,
  });

  if (amountInt < (minAmount || 0)) {
    throw new Error(`Amount ${getTrimmedLogsAmount(amountInt, token)} must be more than ${minAmount || 0}`);
  }

  return {
    amountInt,
    amountWei,
  };
};

import { NumberRange } from '../../types';

export function isInRange(value: number, range: NumberRange) {
  const [min, max] = range;
  return value >= min && value <= max;
}

export function truncateToDecimal(value: number, decimals: number) {
  const factor = Math.pow(10, decimals);
  return Math.floor(value * factor) / factor;
}

export const truncateDecimals = (value: number, decimals: number): number => {
  const factor = 10 ** decimals;
  return Math.floor(value * factor) / factor;
};

export const roundAmountWithDecimals = (
  amount: number | bigint,
  decimalPlaces: number,
  tokenDecimals: number
): number | bigint => {
  if (typeof amount === 'bigint') {
    const factor = 10n ** BigInt(tokenDecimals - decimalPlaces);
    return (amount / factor) * factor;
  } else {
    const factor = 10 ** decimalPlaces;
    return Math.floor(amount * factor) / factor;
  }
};

export function isRangeEmpty(range: NumberRange) {
  return (
    !Array.isArray(range) ||
    range.length !== 2 ||
    typeof range[0] !== 'number' ||
    typeof range[1] !== 'number' ||
    range[0] > range[1] ||
    (range[0] === 0 && range[1] === 0)
  );
}

export const numberToHex = (value: number | bigint): string => '0x' + value.toString(16);

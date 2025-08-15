import type { LoggerType, LoggerData } from '../../logger';
import type { NumberRange } from '../../types';
import { getRandomNumber } from './randomizers';

export const sleep = async (
  seconds: number,
  logTemplate?: LoggerData,
  innerLogger?: LoggerType,
  customMessage?: string
): Promise<void> => {
  const waitMsg = `Fell asleep for ${+seconds.toFixed(2)} seconds`;
  const logMessage = customMessage ? `${customMessage}. ${waitMsg}` : waitMsg;
  innerLogger?.info(logMessage, logTemplate);

  let remainingMs = seconds * 1000;
  const maxMs = 2147483647;

  while (remainingMs > 0) {
    const waitMs = Math.min(remainingMs, maxMs);
    await new Promise((resolve) => setTimeout(resolve, waitMs));
    remainingMs -= waitMs;
  }
};

export const sleepByRange = async (
  delayRange: NumberRange,
  logTemplate?: LoggerData,
  innerLogger?: LoggerType,
  customMsg?: string
) => {
  const delay = getRandomNumber(delayRange, true);

  return sleep(delay, logTemplate, innerLogger, customMsg);
};

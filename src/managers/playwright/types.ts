import { Locator, Frame, Page } from 'patchright';

import { LoggerType } from '../../logger';

export interface BaseProps {
  page: Page;
  frame?: Frame;
  locator: string;
}
export interface ClickProps extends BaseProps {
  isRequired?: boolean;
  maxAttempts?: number;
  delayToWaitElement?: number;
  delayBetweenAttempts?: number;
  hoverFirst?: boolean;
  showAttemptLog?: boolean;
  clickCount?: number;
  shadowLocator?: string;
  delayToMove?: number;
}
export interface ClickByCoordsProps extends BaseProps {
  isRequired?: boolean;
  maxAttempts?: number;
  delayToWaitElement?: number;
  delayBetweenAttempts?: number;
  showAttemptLog?: boolean;
  clickCount?: number;
  shadowLocator?: string;
}
export interface GetElementProps extends BaseProps {
  isRequired?: boolean;
  max_attempts?: number;
  delayToWaitElement?: number;
  delayBetweenAttempts?: number;
  showAttemptLog?: boolean;
  shadowLocator?: string;
}
export interface WaitLocatorProps {
  isRequired?: boolean;
  locator: Locator;
  maxAttempts?: number;
  delayToWaitElement?: number;
  delayBetweenAttempts?: number;
  showAttemptLog?: boolean;
}
export interface GetElementAttributeProps extends BaseProps {
  attribute: string;
}

export interface ClickOnElementOptions {
  isRequired?: boolean;
  maxAttempts?: number;
  waitTime?: number;
}
export interface TypeInInputOptions {
  isRequired?: boolean;
  waitTime?: number;
  page: Page;
  locator: string;
  text: string;
}

export type OpenPageCallback = (page: Page, logger: LoggerType) => void;

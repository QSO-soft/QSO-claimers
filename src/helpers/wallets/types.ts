import { DataSource } from 'typeorm';

import { LoggerType } from '../../logger';
import {
  MoreOrLessString,
  NumberRange,
  NumberString,
  NumberStringRange,
  Route,
  RouteSettings,
  WalletData,
} from '../../types';
import { ClientClass } from '../clients';
import { CryptoCompareResult } from '../currency-handlers';

export type FilterWalletsCb = (args: FilterWallets) => Promise<WalletData[]>;

export interface PrepareWallets {
  route: Route;
  routeSettings: RouteSettings;
  jsonWallets: WalletData[];
  shouldShuffleWallets: boolean;
  logger: LoggerType;
  projectName: string;
  delayBetweenTransactions: NumberRange;
  shouldShuffleModules: boolean;
  nativePrices: CryptoCompareResult;
  dbSource: DataSource;
  filterWalletsCallback?: FilterWalletsCb;
}

export interface PrepareRowFromCsvArgs {
  walletData: WalletData;
  client: ClientClass;
  logger: LoggerType;
  index: number;
}

export interface FilterWallets {
  wallets: WalletData[];
  logger: LoggerType;
  nativePrices: CryptoCompareResult;
  dbSource: DataSource;
}

export interface PrepareFromCsvArgs {
  logger: LoggerType;
  client: ClientClass;
  projectName: string;
}

export type PrepareWalletsData = Omit<PrepareFromCsvArgs, 'logger'> & {
  logsFolderName: string;
};

export type RangeByIdFilter = (NumberStringRange | NumberString | MoreOrLessString)[];

import { DataSource } from 'typeorm';

import { CryptoCompareResult } from '../../helpers';
import { SupportedNetworks, WalletWithModules } from '../../types';

export interface IModuleManager {
  walletWithModules: WalletWithModules;
  walletsTotalCount: number;
  projectName: string;
  baseNetwork: SupportedNetworks;
  dbSource: DataSource;
}
export interface StartModule {
  logsFolderName: string;
  currentWalletIndex: number;
  nativePrices: CryptoCompareResult;
}

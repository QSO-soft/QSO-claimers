import { DataSource } from 'typeorm';
import { Hex } from 'viem';

import {
  Route,
  RouteSettings,
  SavedModules,
  SupportedNetworks,
  TransformedModuleParams,
  WalletWithModules,
} from '../../types';
import { ClientClass, ClientType } from '../clients';
import { CryptoCompareResult } from '../currency-handlers';
import { FilterWalletsCb } from '../wallets';

export type ResponseStatus = 'passed' | 'success' | 'warning' | 'error' | 'critical';

export type TransactionCallbackParams = TransformedModuleParams & {
  client: ClientType;
};

export type BaseTransactionWorkerProps = TransformedModuleParams & {
  startLogMessage?: string;
};
export type BaseTransactionWorkerWithCallbackProps = BaseTransactionWorkerProps & TransactionWorkerCallbackProp;
export type TransactionWorkerProps = BaseTransactionWorkerProps & {
  baseNetwork: SupportedNetworks;
  projectName: string;
  moduleIndex: number;
  isInnerWorker?: boolean;
};
export type TransactionCallbackResponse = {
  status: ResponseStatus;
  message?: string;
  tgMessage?: string;
  txHash?: Hex;
  explorerLink?: string;
};
export type TransactionCallbackReturn = Promise<TransactionCallbackResponse>;
export type TransactionWorkerCallbackProp = {
  transactionCallback: (params: TransactionCallbackParams) => TransactionCallbackReturn;
};
export type TransactionWorkerPropsWithCallback = TransactionWorkerCallbackProp & TransactionWorkerProps;

export type StartModulesCallbackArgs = {
  nativePrices: CryptoCompareResult;
  walletWithModules: WalletWithModules;
  logsFolderName: string;
  walletsTotalCount: number;
  currentWalletIndex: number;
  projectName: string;
  baseNetwork: SupportedNetworks;
  dbSource: DataSource;
};

type StartModulesCallback = (args: StartModulesCallbackArgs) => Promise<any>;

export type BaseMainScriptArgs = {
  clientToPrepareWallets: ClientClass;
  logsFolderName: string;
  startModulesCallback: StartModulesCallback;
  projectName: string;
  baseNetwork: SupportedNetworks;
  dbSource: DataSource;
};
export interface RestartLastArgs extends BaseMainScriptArgs {
  savedModules?: SavedModules;
  walletsWithModules?: WalletWithModules[];
  isDbInitialised?: boolean;
}

export type MainScriptArgs = BaseMainScriptArgs & {
  routeHandler: (route: Route) => RouteSettings;
  // routesField: string;
  routes: Route[];
  filterWalletsCallback?: FilterWalletsCb;
};

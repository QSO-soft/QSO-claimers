import { CLAIM_STATUSES } from '../constants';
import { RangeByIdFilter } from '../helpers';
import { AutoGasNetworks } from '../managers/auto-gas/types';
import { NumberRange } from './common';
import { UserModuleConfig } from './module';
import { SupportedNetworks } from './networks';
import { AvailableSwapTokens, Tokens } from './tokens';

export type MaxGasSetting = Partial<Record<SupportedNetworks, number>>;
export type GasMultiplierSettings = Partial<Record<SupportedNetworks, number>>;

export interface SettingsDelays {
  beforeTxReceipt: NumberRange;
  betweenTransactions: NumberRange;
  betweenModules: NumberRange;
  betweenWallets: NumberRange;
  betweenCheckGas: NumberRange;
  betweenRetries: number;
  betweenRestarts: number;
}

export interface AutoGasNetworkSettings {
  useAutoGas: boolean;
  cex: 'binance' | 'okx';
  minBalance: number;
  withdrawToAmount: NumberRange;
  withdrawSleep: NumberRange;
  expectedBalance?: NumberRange;
}
export type AutoGasSettings = Partial<Record<AutoGasNetworks, AutoGasNetworkSettings>>;

export interface ShuffleSettings {
  wallets: boolean;
  modules: boolean;
}

interface InvitesAmount {}

export interface FilterSettings {
  useFilter: boolean;

  status: (typeof CLAIM_STATUSES)[keyof typeof CLAIM_STATUSES] | null;
}

export type MinTokenBalanceSettings = Partial<Record<AvailableSwapTokens, number>>;
export type TrimLogsAmountSettings = Partial<Record<Tokens, number>> & { default: number };

export interface DefaultSettings {
  // routes?: Route[];

  filters: FilterSettings;
  shuffle: ShuffleSettings;
  threads: number;
  txAttempts: number;
  delay: SettingsDelays;
  maxGas: MaxGasSetting;
  gasMultiplier: GasMultiplierSettings;
  gasLimitMultiplier: Partial<Record<SupportedNetworks, NumberRange | null>>;
  invitesAmount?: InvitesAmount;
  autoGas: AutoGasSettings;
  logsTrimNumber: TrimLogsAmountSettings;
  gweiRange: Partial<Record<SupportedNetworks, NumberRange>>;

  txAttemptsToChangeProxy: number;
  useProxy: boolean;
  useRestartFromNotFinished: boolean;
  useDetailedChecks: boolean;
  useRestartInMain: boolean;
  useSavedModules: boolean;
  idFilter: RangeByIdFilter;

  minTokenBalance: MinTokenBalanceSettings;
}

// =================================================================
export type Route =
  | 'base'
  | 'flow-1'
  | 'flow-2'
  | 'flow-3'
  | 'flow-4'
  | 'one-time'
  | 'low-cost'
  | 'top-up-balance'
  | 'warm-up'
  | 'volume'
  | 'dev'
  | 'checkers'
  | 'new-accounts'
  | 'polyhedra'
  | 'alt-layer'
  | 'layer-zero'
  | 'check-balances'
  | 'taiko'
  | 'scroll'
  | 'superform'
  | 'elixir'
  | 'symbiotic'
  | 'swell'
  | 'odos'
  | 'delegate'
  | 'story';

export type Settings = DefaultSettings;

export type GroupSettings = Record<number, NumberRange>;

export type RouteSettings = {
  modules: UserModuleConfig[];
  groupSettings: GroupSettings;
  countModules: NumberRange;
  limitWalletsToUse: number;
  splitModuleCount?: boolean;
};

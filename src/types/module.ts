import { DataSource } from 'typeorm';
import { Hex } from 'viem';

import { CryptoCompareResult, TransactionCallbackResponse } from '../helpers';
import { LoggerData, LoggerType } from '../logger';
import { Cex, NumberRange, ProxyAgent, ProxyObject, WalletData } from './common';
import { BinanceNetworks, OkxNetworks, SupportedNetworks } from './networks';
import { MinTokenBalanceSettings } from './settings';
import { AvailableRemainSwapTokens, AvailableSwapTokens, Tokens } from './tokens';

export type WorkerResponse = Pick<TransactionCallbackResponse, 'status' | 'message' | 'tgMessage'> & {
  logTemplate: LoggerData;
  txScanUrl?: string;
};

export type FindModuleReturnFc = (params: TransformedModuleParams) => Promise<WorkerResponse>;

export type ModuleNames =
  | 'binance-withdraw'
  | 'okx-withdraw'
  | 'okx-collect'
  | 'okx-wait-balance'
  | 'bitget-collect'
  | 'bitget-deposit'
  | 'bitget-withdraw'
  | 'bitget-wait-balance'
  | 'top-up-eth-mainnet'
  | 'transfer-token'
  | 'balance-checker'
  | 'check-native-balance'
  | 'izumi-swap'
  | 'sync-swap'
  | '1inch-swap'
  | 'odos-swap'
  | 'routernitro-bridge'
  | 'orbiter-bridge'
  | 'relay-bridge'
  | 'meson-bridge'
  | 'polyhedra-claim'
  | 'polyhedra-check-claim'
  | 'polyhedra-transfer-claim'
  | 'layer-zero-claim'
  | 'layer-zero-check-claim'
  | 'layer-zero-transfer-claim'
  | 'taiko-claim'
  | 'taiko-check-claim'
  | 'taiko-transfer-claim'
  | 'swell-claim'
  | 'swell-check-claim'
  | 'swell-transfer-claim'
  | 'scroll-claim'
  | 'scroll-check-claim'
  | 'scroll-transfer-claim'
  | 'odos-claim'
  | 'odos-check-claim'
  | 'odos-transfer-claim'
  | 'superform-superfrens-claim-NFT'
  | 'elixir-withdraw-eth'
  | 'symbiotic-check-points'
  | 'story-claim'
  | 'delegate-registry'
  | 'hyperlane-airdrop-check'
  | 'hyperlane-airdrop-register';

export type SwapModuleNames = Extract<
  ModuleNames,
  'odos-swap' | 'izumi-swap' | 'sync-swap' | '1inch-swap' | 'zkSync-mute-swap'
>;

export type MaxGas = [SupportedNetworks, number];
export type HexOrNative = Hex | 'native';
export type ContractPairs = [HexOrNative, HexOrNative];
export type Pairs = [AvailableSwapTokens, AvailableSwapTokens];
export type NetworksArray = [SupportedNetworks, ...SupportedNetworks[]];
export type OptionalNetworksArray = SupportedNetworks[];
export type TokensArray = [Tokens, ...Tokens[]];

export interface ExtraModuleParams {
  // General
  network?: SupportedNetworks;
  randomNetworks?: OptionalNetworksArray;
  gweiRange?: NumberRange;
  gasLimitRange?: NumberRange;
  maxGas?: MaxGas;
  useInvitesAutosave?: boolean;
  stopWalletOnError?: boolean;
  stopWalletOnPassed?: boolean;
  skipClearInSaved?: boolean;
  stopModulesOnError?: ModuleNames[];
  destinationNetwork?: SupportedNetworks;
  destinationNetworks?: NetworksArray;
  contractAddress?: HexOrNative;
  contractAddresses?: Hex[];
  projectAddresses?: Hex[];

  useUsd?: boolean;
  checkThisMonthTx?: boolean;
  // Swaps / Liquidity / Lending
  srcToken?: AvailableSwapTokens;
  destTokens?: [AvailableSwapTokens, ...AvailableSwapTokens[]];
  pairs?: Pairs;
  networkPairs?: [SupportedNetworks, SupportedNetworks];
  contractPairs?: ContractPairs;
  reverse?: boolean;
  slippage?: number;
  tokenToSupply?: Tokens;
  collateral?: 'disable' | 'enable';
  swapsByToken?: Record<AvailableSwapTokens, [SwapModuleNames, ...SwapModuleNames[]] | 'all'>;
  tokensToRemainSwap?: AvailableRemainSwapTokens[] | 'all';

  // Withdraws
  tokenToWithdraw?: Tokens;
  withdrawAdditionalPercent?: number;
  reservePercentNetworkFee?: number;

  binanceWithdrawNetwork?: BinanceNetworks;
  randomBinanceWithdrawNetworks?: BinanceNetworks[];

  okxWithdrawNetwork?: OkxNetworks;
  randomOkxWithdrawNetworks?: OkxNetworks[];
  okxWithdrawFees?: number;
  okxAccounts?: string[] | 'all';
  collectTokens?: Tokens[];
  randomTokens?: TokensArray;
  withdrawNetwork?: string;
  randomCex?: [Cex, ...Cex[]];
  skipDelaysOnPassed?: boolean;

  // Amounts
  reverseMinAndMaxAmount?: NumberRange;
  minAndMaxAmount?: NumberRange;
  splitAmount?: NumberRange;
  minAmount?: number;
  amount?: number;
  usePercentBalance?: boolean;
  minTokenBalance?: number;
  minBalanceByToken?: MinTokenBalanceSettings;
  minNativeBalance?: number;
  addDonationAmount?: boolean;
  minDestTokenBalance?: number;
  minDestTokenNetwork?: SupportedNetworks;
  minDestNativeBalance?: number;
  balanceToLeft?: NumberRange;

  expectedBalance?: NumberRange;

  minNativeBalanceNetwork?: SupportedNetworks;

  // ZkEra
  zkEraBridgeAmount?: NumberRange;
  checkZkEraBalance?: boolean;

  maxTxsCount?: NumberRange;
  maxFee?: number;
  bytecode?: Hex;

  flows?: [NetworksArray, ...NetworksArray[]];

  waitTime?: number;
  waitBalance?: number;
  waitLiquidityAttempts?: number;

  nftId?: number;
}

export interface DefaultModuleConfig extends ExtraModuleParams {
  count: NumberRange;
  indexGroup: number;
  delay?: NumberRange;
}

export type UserModuleConfig = Partial<DefaultModuleConfig> & {
  moduleName: ModuleNames;
};
export type ModuleConfig = Required<UserModuleConfig>;

export type GroupedModules = Record<number, ModuleConfig[]>;

export type ModuleParams = ModuleConfig & ExtraModuleParams;

export type DefaultModuleConfigs = Record<ModuleNames, DefaultModuleConfig>;

export type TransformedModuleParams = Omit<ModuleParams, 'count'> & {
  moduleIndex: number;
  count: number;
  proxyAgent?: ProxyAgent;
  proxyObject?: ProxyObject;
  isReverse?: boolean;
  logger: LoggerType;
  wallet: WalletData;
  isInnerWorker?: boolean;

  baseNetwork: SupportedNetworks;
  projectName: string;
  nativePrices: CryptoCompareResult;

  dbSource?: DataSource;
};

export type TransformedModuleConfig = Omit<ModuleConfig, 'count'> & {
  count: number;
  isReverse?: boolean;
  isFailed?: boolean;
};

export interface StopModuleOnError {
  errorFrom: ModuleNames;
  moduleToStop: ModuleNames;
}

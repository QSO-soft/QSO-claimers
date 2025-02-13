export type NetworksRecord = Record<Networks, string>;
export type RPCsRecord = Record<Networks, string[]>;

export enum Networks {
  BSC = 'bsc',
  OP_BNB = 'opBNB',
  ETH = 'eth',
  SEPOLIA = 'sepolia',
  TAIKO = 'taiko',

  BLAST = 'blast',
  POLYGON = 'polygon',
  AVALANCHE = 'avalanche',
  ARBITRUM = 'arbitrum',
  OPTIMISM = 'optimism',

  // LAYER_ZERO = 'layerZero',
  ZKSYNC = 'zkSync',
  ZKFAIR = 'zkFair',
  POLYGON_ZKEVM = 'polygon_zkevm',

  BASE = 'base',
  LINEA = 'linea',
  SCROLL = 'scroll',
  FANTOM = 'fantom',
  STORY = 'story',

  CORE = 'core',
  CELO = 'celo',
  ZORA = 'zora',

  GNOSIS = 'gnosis',
  KLAY = 'klay',

  APTOS = 'aptos',
  STARKNET = 'starknet',
}

export const SUPPORTED_NETWORKS = [
  'bsc',
  'opBNB',
  'eth',
  'polygon',
  'arbitrum',
  'avalanche',
  'optimism',
  'zkSync',
  'zkFair',
  'polygon_zkevm',
  'base',
  'linea',
  'scroll',
  'fantom',
  'core',
  'celo',
  'zora',
  'gnosis',
  'klay',
  'aptos',
  'holesky',
  'layerZero',
  'blast',
  'taiko',
  'sepolia',
  'story',
] as const;
export type SupportedNetworks = (typeof SUPPORTED_NETWORKS)[number];

export const BINANCE_NETWORKS = [
  'bsc',
  'opBNB',
  'eth',
  'polygon',
  'arbitrum',
  'avalanche',
  'optimism',
  'zkSync',
  'base',
  'fantom',
  'celo',
  'klay',
] as const;

export type BinanceNetworks = (typeof BINANCE_NETWORKS)[number];

export const OKX_NETWORKS = [
  'bsc',
  'eth',
  'polygon',
  'arbitrum',
  'avalanche',
  'optimism',
  'zkSync',
  'base',
  'linea',
  'fantom',
  'core',
  'celo',
  'klay',
] as const;
export type OkxNetworks = (typeof OKX_NETWORKS)[number];

export interface BinanceTokenData {
  coin: string;
  name: string;
  networkList: BinanceNetworkData[];
}

export interface BinanceNetworkData {
  network: string;
  coin: string;
  withdrawIntegerMultiple: string;
  name: string;
  withdrawFee: string;
  withdrawMin: string;
  withdrawMax: string;
  contractAddress: string;
}

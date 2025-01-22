export enum EvmTokens {
  wstETH = 'wstETH',
  DAI = 'DAI',
  USDT = 'USDT',
  USDC = 'USDC',
}
export enum EthTokens {
  ETH = 'ETH',
  USDT = 'USDT',
  USDC = 'USDC',
  WETH = 'WETH',
  DAI = 'DAI',
}
export enum TaikoTokens {
  ETH = 'ETH',
  USDC = 'USDC',
  USDT = 'USDT',
  'USDC.e' = 'USDC.e',
  WETH = 'WETH',
  TAIKO = 'TAIKO',
}
export enum BnbTokens {
  BNB = 'BNB',
  USDT = 'USDT',
  USDC = 'USDC',
  DAI = 'DAI',
  AI = 'AI',
}
export enum BlastTokens {
  ETH = 'ETH',
  WETH = 'WETH',
  USDB = 'USDB',
}
export enum SepoliaTokens {
  ETH = 'ETH',
  WETH = 'WETH',
}
export enum AvalancheTokens {
  BNB = 'BNB',
  USDT = 'USDT',
  USDC = 'USDC',
  DAI = 'DAI',
}
export enum ArbitrumTokens {
  ETH = 'ETH',
  USDT = 'USDT',
  USDC = 'USDC',
  DAI = 'DAI',
  WETH = 'WETH',
}
export enum ZoraTokens {
  ETH = 'ETH',
  WETH = 'WETH',
}
export enum OptimismTokens {
  ETH = 'ETH',
  USDT = 'USDT',
  USDC = 'USDC',
  WETH = 'WETH',
  DAI = 'DAI',
}
export enum PolygonTokens {
  MATIC = 'MATIC',
  USDT = 'USDT',
  USDC = 'USDC',
  WETH = 'WETH',
  DAI = 'DAI',
}
export enum ZkSyncTokens {
  ETH = 'ETH',
  USDT = 'USDT',
  USDC = 'USDC',
  WETH = 'WETH',
  DAI = 'DAI',
}
export enum BaseTokens {
  ETH = 'ETH',
  USDC = 'USDC',
  USDT = 'USDT',
  WETH = 'WETH',
}
export enum LineaTokens {
  ETH = 'ETH',
  USDT = 'USDT',
  USDC = 'USDC',
  DAI = 'DAI',
  WETH = 'WETH',
}
export enum ScrollTokens {
  ETH = 'ETH',
  USDT = 'USDT',
  USDC = 'USDC',
  WETH = 'WETH',
  DAI = 'DAI',
}

export enum Token {
  ETH = 'ETH',
  USDT = 'USDT',
  USDC = 'USDC',
  BUSD = 'BUSD',
  MATIC = 'MATIC',
}

export type DefaultTokens = 'ETH' | 'USDC' | 'USDT' | 'DAI' | 'WETH';

export type AvailableSwapTokens = DefaultTokens | 'MUTE' | 'BUSD' | 'WBTC' | 'rETH' | 'SIS' | 'PEPE' | 'iZi';

export type AvailableRemainSwapTokens = Exclude<AvailableSwapTokens, 'ETH'>;

const ALL_TOKENS = [
  'ETH',
  'USDC',
  'USDT',
  'DAI',
  'WETH',
  'BNB',
  'MATIC',
  'SOL',
  'MUTE',
  'BUSD',
  'WBTC',
  'rETH',
  'SIS',
  'PEPE',
  '1INCH',
  'AAVE',
  'ACE',
  'AEVO',
  'APE',
  'APT',
  'ARB',
  'ATOM',
  'AVAX',
  'BAL',
  'BETH',
  'BLUR',
  'BONE',
  'CELO',
  'CFX',
  'COMP',
  'CORE',
  'CRV',
  'DAO',
  'DOGE',
  'ELF',
  'EOS',
  'FLM',
  'FLOKI',
  'GALA',
  'GMT',
  'GMX',
  'GPT',
  'ICE',
  'IOTA',
  'IQ',
  'KLAY',
  'LAMB',
  'LINK',
  'LUNA',
  'MAGIC',
  'MANA',
  'MEME',
  'METIS',
  'MINA',
  'MOVR',
  'NEAR',
  'NEO',
  'OP',
  'SHIB',
  'SPELL',
  'STORJ',
  'STRK',
  'SUI',
  'SUN',
  'SUSHI',
  'TIA',
  'TON',
  'UNI',
  'VELO',
  'WOO',
  'XETA',
  'ZETA',
  'ZK',
  'iZi',
  'TAIKO',
  'SCR',
  'SWELL',
  'POL',
  'FTM',
  'xDAI',
] as const;

export type Tokens = (typeof ALL_TOKENS)[number];

export type DebankWalletData = {
  address: string;
  totalValue: number;
  change24h: number;
  rank?: number;
  age?: number;
  followers?: number;
  following?: number;
  chains: DebankChainData[];
  tokens: DebankTokenData[];
  protocols: DebankProtocolData[];
  lastUpdated: string;
};

export type DebankChainData = {
  name: string;
  value: number;
  tokens: DebankTokenData[];
};

export type DebankTokenData = {
  symbol: string;
  name: string;
  balance: number;
  value: number;
  price: number;
  chain: string;
  logo?: string;
  priceChange24h?: number;
};

export type DebankProtocolData = {
  id: string;
  name: string;
  value: number;
  chain?: string;
  category?: string;
  logo?: string;
};

export type ProxyConfig = {
  host: string;
  port: number;
  protocol: 'http' | 'https' | 'socks4' | 'socks5';
  username?: string;
  password?: string;
};

export type DeBankApiResponse = {
  user?: any;
  token_balance_list?: any[];
  apps_list?: any[];
  portfolio_list?: any[] | undefined;
  total_net_curve?: any;
};

export type AggregatedData = {
  totalValue: number;
  totalChange24h: number;
  walletsCount: number;
  topTokens: DebankTokenData[];
  topChains: DebankChainData[];
  topProtocols: DebankProtocolData[];
  wallets: DebankWalletData[];
};

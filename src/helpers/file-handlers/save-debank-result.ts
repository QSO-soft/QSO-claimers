import { DebankCheckerEntity } from '../../scripts/claimers/db/entities';
import { Balances, Tokens } from '../../types';
import { truncateToDecimal } from '../utils';
import { DataForCsv } from './csv-converters';

// * Column names enum for consistent naming
export enum DebankStatColumnNames {
  // * Common columns
  CHAIN = 'Chain',
  TOKEN = 'Token',
  PROTOCOL = 'Protocol',
  WALLETS = 'Wallets',
  BALANCE_USD = 'Balance USD',

  // * Token specific columns
  BALANCE_TOKENS = 'Balance Tokens',
}

interface DebankStatisticAllPossibleKeys {
  allChainKeys: string[];
  allTokenKeys: string[];
  allProtocolKeys: string[];
}

// * Helper functions for common operations
function parseJsonData(items: DebankCheckerEntity[]) {
  return items.map((item) => ({
    item,
    parsedBalances: item.balances ? (JSON.parse(item.balances) as { [network: string]: Balances }) : {},
    parsedBalancesUSD: item.balances_usd
      ? (JSON.parse(item.balances_usd) as { [network: string]: Record<string, number> })
      : {},
    parsedChainBalances: item.chainBalances ? (JSON.parse(item.chainBalances) as { [network: string]: number }) : {},
    parsedProtocolBalances: item.protocolBalances
      ? (JSON.parse(item.protocolBalances) as { [protocol: string]: number })
      : {},
  }));
}

function sortByBalanceDesc<T extends { totalBalance?: number; totalBalanceUSD?: number }>(
  entries: [string, T][]
): [string, T][] {
  return entries.sort(([, statsA], [, statsB]) => {
    const balanceA = statsA.totalBalanceUSD ?? statsA.totalBalance ?? 0;
    const balanceB = statsB.totalBalanceUSD ?? statsB.totalBalance ?? 0;
    return balanceB - balanceA;
  });
}

function getDebankStatisticAllPossibleKeys(items: DebankCheckerEntity[]): DebankStatisticAllPossibleKeys {
  const allChainKeys = new Set<string>();
  const allTokenKeys = new Set<string>();
  const allProtocolKeys = new Set<string>();

  items.forEach(({ balances_usd, chainBalances, protocolBalances }) => {
    const parsedBalancesUSD = balances_usd ? (JSON.parse(balances_usd) as { [network: string]: number }) : {};
    const parsedChainBalances = chainBalances ? (JSON.parse(chainBalances) as { [network: string]: number }) : {};
    const parsedProtocolBalances = protocolBalances
      ? (JSON.parse(protocolBalances) as { [protocol: string]: number })
      : {};

    // * Collect chain keys
    Object.entries(parsedChainBalances).forEach(([network, balance]) => {
      if (balance && balance > 0) {
        allChainKeys.add(`chain_${network}_usd`);
      }
    });

    // * Collect token keys
    Object.entries(parsedBalancesUSD).forEach(([network, networkBalances]) => {
      Object.entries(networkBalances).forEach(([token, balance]) => {
        if (balance && balance > 0) {
          allTokenKeys.add(`token_${network}_${token.toLowerCase()}_usd`);
        }
      });
    });

    // * Collect protocol keys
    Object.entries(parsedProtocolBalances).forEach(([protocol, balance]) => {
      if (balance && balance > 0) {
        allProtocolKeys.add(`protocol_${protocol}_usd`);
      }
    });
  });

  return {
    allChainKeys: Array.from(allChainKeys).sort(),
    allTokenKeys: Array.from(allTokenKeys).sort(),
    allProtocolKeys: Array.from(allProtocolKeys).sort(),
  };
}

export async function getDebankStatisticFullData(items: DebankCheckerEntity[]): Promise<DataForCsv> {
  const { allChainKeys, allTokenKeys, allProtocolKeys } = getDebankStatisticAllPossibleKeys(items);

  // * Create template object with all keys in correct order
  const createTemplateObject = (baseData: Record<string, any>) => {
    const template: Record<string, any> = { ...baseData };

    // * Add all chain keys in order
    allChainKeys.forEach((key) => {
      template[key] = undefined;
    });

    // * Add all token keys in order
    allTokenKeys.forEach((key) => {
      template[key] = undefined;
    });

    // * Add all protocol keys in order
    allProtocolKeys.forEach((key) => {
      template[key] = undefined;
    });

    return template;
  };

  // * Second pass: create ordered objects for each item using template
  return items.map(({ id: _, balances, balances_usd, chainBalances, protocolBalances, ...rest }) => {
    const parsedBalances = balances_usd ? (JSON.parse(balances_usd) as { [network: string]: Balances }) : {};
    const parsedChainBalances = chainBalances ? (JSON.parse(chainBalances) as { [network: string]: number }) : {};
    const parsedProtocolBalances = protocolBalances
      ? (JSON.parse(protocolBalances) as { [protocol: string]: number })
      : {};

    // * Start with template to ensure consistent order
    const orderedResult = createTemplateObject(rest);

    // * Fill chain data
    allChainKeys.forEach((chainKey) => {
      const network = chainKey.replace('chain_', '').replace('_usd', '');
      if (network && network in parsedChainBalances && parsedChainBalances[network]) {
        const balance =
          (parsedChainBalances[network] as number) < 0.01 && (parsedChainBalances[network] as number) > 0
            ? '<0.01'
            : truncateToDecimal(parsedChainBalances[network] as number, 2);
        if (balance) orderedResult[chainKey] = balance;
      }
    });

    // * Fill token data
    allTokenKeys.forEach((tokenKey) => {
      const parts = tokenKey.replace('token_', '').split('_');
      const network = parts[0]!;
      const token = parts
        .slice(1)
        .slice(0, parts.length - 2)
        .join('_')
        ?.toUpperCase() as Tokens;

      if (network && token && network in parsedBalances && parsedBalances[network]) {
        const networkBalances = parsedBalances[network]!;
        if (token in networkBalances && networkBalances[token]) {
          const balance =
            (networkBalances[token] as number) < 0.01 && (networkBalances[token] as number) > 0
              ? '<0.01'
              : truncateToDecimal(networkBalances[token] as number, 2);
          if (balance) orderedResult[tokenKey] = balance;
        }
      }
    });

    // * Fill protocol data
    allProtocolKeys.forEach((protocolKey) => {
      const protocol = protocolKey.replace('protocol_', '').replace('_usd', '');
      if (protocol && protocol in parsedProtocolBalances && parsedProtocolBalances[protocol]) {
        const balance =
          (parsedProtocolBalances[protocol] as number) < 0.01 && (parsedProtocolBalances[protocol] as number) > 0
            ? '<0.01'
            : truncateToDecimal(parsedProtocolBalances[protocol] as number, 2);

        if (balance) orderedResult[protocolKey] = balance;
      }
    });

    return orderedResult;
  });
}

export async function getDebankStatisticChainsData(items: DebankCheckerEntity[]): Promise<DataForCsv> {
  // * Aggregated data for each chain
  const chainStats: Record<string, { walletsCount: number; totalBalance: number }> = {};

  // * Parse data once for all items
  const parsedData = parseJsonData(items);

  // * Process each wallet to aggregate chain statistics
  parsedData.forEach(({ parsedChainBalances }) => {
    Object.entries(parsedChainBalances).forEach(([network, balance]) => {
      if (balance && balance > 0) {
        if (!chainStats[network]) {
          chainStats[network] = { walletsCount: 0, totalBalance: 0 };
        }
        chainStats[network]!.walletsCount += 1;
        chainStats[network]!.totalBalance += balance;
      }
    });
  });

  // * Create result data array
  const resultData: Array<Record<string, any>> = [];

  // * Add chain statistics rows (sorted by balance DESC)
  const sortedChainEntries = sortByBalanceDesc(Object.entries(chainStats));

  for (const [chain, stats] of sortedChainEntries) {
    resultData.push({
      [DebankStatColumnNames.CHAIN]: chain.toUpperCase(),
      [DebankStatColumnNames.WALLETS]: stats.walletsCount,
      [DebankStatColumnNames.BALANCE_USD]:
        stats.totalBalance < 0.01 && stats.totalBalance > 0 ? '<0.01' : truncateToDecimal(stats.totalBalance, 2),
    });
  }

  // * Calculate totals
  const totalChains = sortedChainEntries.length;
  const totalBalance = Object.values(chainStats).reduce((sum, stats) => sum + stats.totalBalance, 0);

  // * Add total row
  resultData.push({
    [DebankStatColumnNames.CHAIN]: `Total: ${totalChains}`,
    [DebankStatColumnNames.WALLETS]: `Total: ${items.length}`,
    [DebankStatColumnNames.BALANCE_USD]: `Total: ${
      totalBalance < 0.01 && totalBalance > 0 ? '<0.01' : truncateToDecimal(totalBalance, 2)
    }`,
  });

  return resultData;
}

export async function getDebankStatisticTokensData(items: DebankCheckerEntity[]): Promise<DataForCsv> {
  // * Aggregated data for each token
  const tokenStats: Record<string, { walletsCount: number; totalTokens: number; totalBalanceUSD: number }> = {};

  // * Parse data once for all items
  const parsedData = parseJsonData(items);

  // * Process each wallet to aggregate token statistics
  parsedData.forEach(({ parsedBalances, parsedBalancesUSD }) => {
    // * Process token balances
    Object.entries(parsedBalances).forEach(([network, networkBalances]) => {
      Object.entries(networkBalances).forEach(([token, tokenAmount]) => {
        if (tokenAmount && tokenAmount > 0) {
          const tokenKey = `${network.toUpperCase()}_${token.toUpperCase()}`;

          if (!tokenStats[tokenKey]) {
            tokenStats[tokenKey] = { walletsCount: 0, totalTokens: 0, totalBalanceUSD: 0 };
          }

          tokenStats[tokenKey]!.walletsCount += 1;
          tokenStats[tokenKey]!.totalTokens += tokenAmount;

          // * Get USD value if available
          if (parsedBalancesUSD[network] && parsedBalancesUSD[network]![token]) {
            tokenStats[tokenKey]!.totalBalanceUSD += parsedBalancesUSD[network]![token]!;
          }
        }
      });
    });
  });

  // * Create result data array
  const resultData: Array<Record<string, any>> = [];

  // * Add token statistics rows (sorted by balance USD DESC)
  const sortedTokenEntries = sortByBalanceDesc(Object.entries(tokenStats));

  for (const [token, stats] of sortedTokenEntries) {
    resultData.push({
      [DebankStatColumnNames.TOKEN]: token,
      [DebankStatColumnNames.WALLETS]: stats.walletsCount,
      [DebankStatColumnNames.BALANCE_TOKENS]:
        stats.totalTokens < 0.000001 && stats.totalTokens > 0 ? '<0.000001' : truncateToDecimal(stats.totalTokens, 6),
      [DebankStatColumnNames.BALANCE_USD]:
        stats.totalBalanceUSD < 0.01 && stats.totalBalanceUSD > 0
          ? '<0.01'
          : truncateToDecimal(stats.totalBalanceUSD, 2),
    });
  }

  // * Calculate totals
  const totalTokens = sortedTokenEntries.length;
  const totalBalanceUSD = Object.values(tokenStats).reduce((sum, stats) => sum + stats.totalBalanceUSD, 0);

  // * Add total row
  resultData.push({
    [DebankStatColumnNames.TOKEN]: `Total: ${totalTokens}`,
    [DebankStatColumnNames.WALLETS]: `Total: ${items.length}`,
    [DebankStatColumnNames.BALANCE_TOKENS]: '',
    [DebankStatColumnNames.BALANCE_USD]: `Total: ${
      totalBalanceUSD < 0.01 && totalBalanceUSD > 0 ? '<0.01' : truncateToDecimal(totalBalanceUSD, 2)
    }`,
  });

  return resultData;
}

export async function getDebankStatisticProtocolsData(items: DebankCheckerEntity[]): Promise<DataForCsv> {
  // * Aggregated data for each protocol
  const protocolStats: Record<string, { walletsCount: number; totalBalance: number }> = {};

  // * Parse data once for all items
  const parsedData = parseJsonData(items);

  // * Process each wallet to aggregate protocol statistics
  parsedData.forEach(({ parsedProtocolBalances }) => {
    Object.entries(parsedProtocolBalances).forEach(([protocol, balance]) => {
      if (balance && balance > 0) {
        if (!protocolStats[protocol]) {
          protocolStats[protocol] = { walletsCount: 0, totalBalance: 0 };
        }
        protocolStats[protocol]!.walletsCount += 1;
        protocolStats[protocol]!.totalBalance += balance;
      }
    });
  });

  // * Create result data array
  const resultData: Array<Record<string, any>> = [];

  // * Add protocol statistics rows (sorted by balance DESC)
  const sortedProtocolEntries = sortByBalanceDesc(Object.entries(protocolStats));

  for (const [protocol, stats] of sortedProtocolEntries) {
    resultData.push({
      [DebankStatColumnNames.PROTOCOL]: protocol.toUpperCase(),
      [DebankStatColumnNames.WALLETS]: stats.walletsCount,
      [DebankStatColumnNames.BALANCE_USD]:
        stats.totalBalance < 0.01 && stats.totalBalance > 0 ? '<0.01' : truncateToDecimal(stats.totalBalance, 2),
    });
  }

  // * Calculate totals
  const totalProtocols = sortedProtocolEntries.length;
  const totalBalance = Object.values(protocolStats).reduce((sum, stats) => sum + stats.totalBalance, 0);

  // * Add total row
  resultData.push({
    [DebankStatColumnNames.PROTOCOL]: `Total: ${totalProtocols}`,
    [DebankStatColumnNames.WALLETS]: `Total: ${items.length}`,
    [DebankStatColumnNames.BALANCE_USD]: `Total: ${
      totalBalance < 0.01 && totalBalance > 0 ? '<0.01' : truncateToDecimal(totalBalance, 2)
    }`,
  });

  return resultData;
}

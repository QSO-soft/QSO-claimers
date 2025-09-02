import dayjs from 'dayjs';
import { BrowserContext, Page } from 'patchright';

import { DefaultClient } from '../../../../clients';
import { EntityManager, sleep, TransactionCallbackParams, TransactionCallbackReturn } from '../../../../helpers';
import { Logger } from '../../../../logger';
import { closeBrowserContext, initPlaywright } from '../../../../managers/playwright';
import { WalletData } from '../../../../types';
import { DebankCheckerEntity } from '../../db/entities';
import { DeBankApiResponse, DebankWalletData } from './models';

export class DebankCheckerService {
  private readonly wallet: WalletData;
  private readonly logger: Logger;
  private readonly client: DefaultClient;
  private readonly entityManager: EntityManager<DebankCheckerEntity>;
  private browserContext: BrowserContext;
  private networkData: DeBankApiResponse = {};
  private tokenBalanceList: any[] = [];
  private portfolioList: any[] = [];
  private appsList: any[] = [];

  constructor(private readonly params: TransactionCallbackParams) {
    // * Base variables
    this.wallet = params.wallet;
    this.logger = params.logger;
    this.client = params.client;

    // * Init entity manager
    this.entityManager = new EntityManager({
      dbSource: params.dbSource,
      entityClass: DebankCheckerEntity,
      wallet: this.wallet,
    });
  }

  public async closeBrowser(): Promise<void> {
    await closeBrowserContext(this.browserContext, this.client.walletAddress);
  }

  public async makeDebankBalanceChecker(): Promise<TransactionCallbackReturn> {
    // * Initialize playwright
    const initPlaywrightResult = await initPlaywright({
      logger: this.logger,
      proxyObject: this.params.proxyObject,
      extensionPaths: [],
      walletAddress: this.client.walletAddress,
    });

    // * Get browser context
    this.browserContext = initPlaywrightResult.browserContext;

    // * Get first page
    const page = this.browserContext.pages()[0]!;

    // * Handle responses
    await this.handleResponses(page);

    this.logger.info('Reviewing balances...');

    // * Go to debank page
    const url = `https://debank.com/profile/${this.client.walletAddress}`;
    await page.goto(url, { waitUntil: 'networkidle', timeout: 120000 });

    // * Wait for "Data updated" text on the page
    await this.waitForDataUpdated(page);

    // * Wait for all network requests to complete
    await this.waitForNetworkRequestsComplete(page);

    // * Check if the UI is fully loaded
    await this.checkUIFullLoaded(page);

    // * Get protocol requests count
    const protocolRequests = await this.getProtocolRequestsCount(page);

    // * If there are no requests to protocols, try to call them manually
    if (!protocolRequests) await this.tryCallPortfolioDataRequestManually(page);

    // * Check if there is portfolio data in the collected data
    await this.tryFindPortfolioDataManually(page);

    // * Update token balance list
    this.networkData.token_balance_list = this.tokenBalanceList.length ? this.tokenBalanceList : [];
    this.networkData.apps_list = this.appsList.length ? this.appsList : [];

    // * Update portfolio list
    this.networkData.portfolio_list = this.portfolioList.length ? this.portfolioList : [];

    const walletData = await this.processWalletData(this.networkData);

    await this.saveBalancesToDatabase(walletData);

    // * Close browser
    await this.closeBrowser();

    const message = `Balance: $${walletData.totalValue.toFixed(2)} | Chains: ${walletData.chains.length} | Tokens: ${
      walletData.tokens.length
    } | Protocols: ${walletData.protocols.length}`;

    return {
      status: 'success',
      message,
      tgMessage: message,
    };
  }

  private async handleResponses(page: Page): Promise<void> {
    page.on('response', async (response: any) => {
      try {
        const url = response.url();

        if (url.includes('api.debank.com/token/balance_list?user_addr=')) {
          if (response.ok()) {
            try {
              const data = await response.json();
              this.tokenBalanceList.push(data);
            } catch (jsonError) {
              this.logger.warning(`Error parsing JSON for tokens ${url}: ${jsonError}`);
            }
          }
        } else if (url.includes('api.debank.com/user?id')) {
          if (response.ok()) {
            try {
              const data = await response.json();
              this.networkData.user = data?.data?.user;
            } catch (jsonError) {
              this.logger.warning(`Error parsing JSON for protocols ${url}: ${jsonError}`);
            }
          }
        } else if (url.includes('api.debank.com/portfolio/app_list?user_id')) {
          if (response.ok()) {
            try {
              const data = await response.json();
              this.appsList = data?.data?.apps;
            } catch (jsonError) {
              this.logger.warning(`Error parsing JSON for protocol apps ${url}: ${jsonError}`);
            }
          }
        } else if (
          url.includes('api.debank.com/portfolio/project_list?user_addr=') ||
          url.includes('api.debank.com/portfolio?user_addr=') ||
          url.includes('api.debank.com/protocol?user_addr=') ||
          url.includes('api.debank.com/user/protocol?user_addr=') ||
          url.includes('api.debank.com/project_list?user_addr=') ||
          url.includes('api.debank.com/user/portfolio?user_addr=') ||
          url.includes('api.debank.com/user/project?user_addr=')
        ) {
          if (response.ok()) {
            try {
              const data = await response.json();
              this.portfolioList.push(data);
            } catch (jsonError) {
              this.logger.warning(`Error parsing JSON for protocols ${url}: ${jsonError}`);
            }
          }
        }
      } catch (e) {
        this.logger.warning(`Error processing response ${response.url()}: ${e}`);
      }
    });
  }

  private async waitForDataUpdated(page: Page): Promise<void> {
    try {
      await page.locator('span', { hasText: 'Data updated' }).waitFor({ state: 'visible', timeout: 30000 });
    } catch (error) {
      this.logger.warning('"Data updated" not found in 30 seconds, continuing...');
    }
  }

  private async waitForNetworkRequestsComplete(page: Page): Promise<void> {
    await page
      .waitForFunction(
        'window.performance.getEntriesByType("resource").filter(r => r.name.includes("api.debank.com")).every(r => r.responseEnd > 0)',
        { timeout: 20000 }
      )
      .catch(() => {
        this.logger.warning('Failed to wait for network requests to complete, continuing...');
      });
  }

  private async getProtocolRequestsCount(page: Page): Promise<number> {
    return await page.evaluate(() => {
      const entries = performance.getEntriesByType('resource');
      return entries.filter(
        (entry) =>
          entry.name.includes('api.debank.com') &&
          (entry.name.includes('portfolio') || entry.name.includes('protocol') || entry.name.includes('project'))
      ).length;
    });
  }

  private async checkUIFullLoaded(page: Page): Promise<void> {
    // * Alternative check - wait for protocol elements on the page
    try {
      const start = Date.now();
      while (Date.now() - start < 10000) {
        const elementsFound = await page.evaluate(
          () => document.querySelectorAll("[class*='protocol'], [class*='project'], [class*='portfolio']").length > 0
        );
        if (elementsFound) break;

        await sleep(0.5);
      }
    } catch (error) {
      this.logger.warning('Protocol elements not found, continuing...');
    }

    // * Additional check - wait for protocol data in DOM
    try {
      const start = Date.now();
      while (Date.now() - start < 15000) {
        const elementsFound = await page.evaluate(
          () =>
            document.querySelectorAll(
              "[data-testid*='protocol'], [data-testid*='project'], [class*='Protocol'], [class*='Project']"
            ).length > 0
        );
        if (elementsFound) break;

        await sleep(0.5);
      }
    } catch (error) {
      this.logger.warning('Protocol elements not found in DOM, continuing...');
    }
  }

  private async tryCallPortfolioDataRequestManually(page: Page): Promise<void> {
    try {
      await page.evaluate(async (address) => {
        const response = await fetch(`https://api.debank.com/portfolio/project_list?user_addr=${address}`);
        if (response.ok) {
          (globalThis as any).manualProtocolData = await response.json();
        }
      }, this.client.walletAddress);

      // * Wait a little for the request to complete
      await sleep(3);

      // * Check if we received the data
      const manualData = await page.evaluate(() => {
        return (globalThis as any).manualProtocolData;
      });

      if (manualData) {
        this.logger.info('Portfolio data received through manual API call');
        this.portfolioList.push(manualData);
      }
    } catch (error) {
      this.logger.warning(`Error while calling API protocols manually: ${error}`);
    }
  }

  private async tryFindPortfolioDataManually(page: Page): Promise<void> {
    if (this.portfolioList.length) return;

    // * Try to find portfolio data manually
    try {
      const protocolData = await page.evaluate(() => {
        // * Try to find portfolio data in global variables or localStorage
        const globalData = (globalThis as any).__NEXT_DATA__;
        if (globalData && globalData.props && globalData.props.pageProps) {
          return globalData.props.pageProps;
        }

        // * Try to find portfolio data in other possible places
        const appData = (globalThis as any).appData;
        if (appData && appData.protocols) {
          return { protocols: appData.protocols };
        }

        return null;
      });

      if (protocolData) this.portfolioList.push(protocolData);
    } catch (error) {
      this.logger.warning(`Error while getting portfolio data through JavaScript: ${error}`);
    }
  }

  private async saveBalancesToDatabase(walletData: DebankWalletData) {
    const balances: Record<string, Record<string, number>> = {};
    const balancesUSD: Record<string, Record<string, number>> = {};
    const chainBalances: Record<string, number> = {};
    const protocolBalances: Record<string, number> = {};

    // * Save chains balances
    for (const chain of walletData.chains) {
      balances[chain.name] = {};
      balancesUSD[chain.name] = {};
      if (chain.value > this.params.customSettings.minChainBalance) {
        chainBalances[chain.name] = chain.value;
      }

      chain.tokens.forEach((token) => {
        balances[chain.name]![token.symbol] = token.balance;
        balancesUSD[chain.name]![token.symbol] = token.value;
      });
    }

    // * Save protocols balances
    for (const protocol of walletData.protocols) {
      if (protocol.value > this.params.customSettings.minProtocolBalance) {
        protocolBalances[protocol.id] = protocol.value;
      }
    }

    // * Save balances to database
    this.entityManager.updateAccountInfo({
      totalValueUSD: walletData.totalValue.toFixed(2),
      lastUpdatedAt: walletData.lastUpdated,
      balances: JSON.stringify(balances),
      balances_usd: JSON.stringify(balancesUSD),
      chainBalances: JSON.stringify(chainBalances),
      protocolBalances: JSON.stringify(protocolBalances),
      age: walletData.age,
      rank: walletData.rank,
    });
  }

  private getDebankAgeFromUnix(unixTimestamp: number): number {
    if (!unixTimestamp) return 0;
    const pastDate = dayjs.unix(unixTimestamp);
    const now = dayjs();
    return now.diff(pastDate, 'day');
  }

  private async processWalletData(networkData: DeBankApiResponse): Promise<DebankWalletData> {
    const walletData: DebankWalletData = {
      address: this.client.walletAddress,
      totalValue: 0,
      change24h: 0,
      chains: [],
      tokens: [],
      protocols: [],
      lastUpdated: new Date().toISOString(),
    };

    // * Handle user data
    if (networkData.user) {
      walletData.rank = networkData.user?.rank_at || '';
      walletData.age = this.getDebankAgeFromUnix(networkData.user?.desc?.born_at);
    }

    // * Variables for calculating the change over the last 24 hours
    let totalValue = 0;
    let weightedChange24h = 0;

    // * Handle tokens - without duplicates
    let totalTokensValue = 0;

    if (networkData.token_balance_list) {
      networkData.token_balance_list.forEach((chainData: any) => {
        const tokens = chainData.data || chainData.tokens || [];

        if (Array.isArray(tokens)) {
          tokens.forEach((token: any) => {
            if (token.amount > 0) {
              const tokenValue = token.amount * (token.price || 0) || 0;
              totalTokensValue += tokenValue;
              if (tokenValue < this.params.customSettings.minTokenBalance) return;

              // * Add each token separately without checking for duplicates
              walletData.tokens.push({
                symbol: token.display_symbol || token.symbol,
                name: token.name,
                balance: token.amount,
                value: tokenValue,
                price: token.price || 0,
                chain: token.chain || 'unknown',
                logo: token.logo_url,
                priceChange24h: token.price_24h_change || 0,
              });

              // * Add to the total change over the last 24 hours (weighted by value)
              if (token.price_24h_change !== undefined) {
                const tokenChangeContribution = tokenValue * token.price_24h_change;
                weightedChange24h += tokenChangeContribution;
                totalValue += tokenValue;
              }
            }
          });
        }
      });

      // * Sort tokens by value for analysis
      // const sortedTokens = walletData.tokens.sort((a, b) => b.value - a.value);

      // * Log the value by chains
      //   const chainValues = new Map<string, number>();
      //   walletData.tokens.forEach((token) => {
      //     const currentValue = chainValues.get(token.chain) || 0;
      //     chainValues.set(token.chain, currentValue + token.value);
      //   });
    }

    // * Handle protocols - final version
    let totalProtocolsValue = 0;

    if (networkData.portfolio_list && networkData.portfolio_list.length > 0) {
      networkData.portfolio_list.forEach((portfolioData: any, index: number) => {
        // * Process protocol data from portfolio_list
        if (portfolioData.data && Array.isArray(portfolioData.data)) {
          const protocols = portfolioData.data;

          protocols.forEach((protocol: any) => {
            let protocolTotalValue = 0;

            // * Process portfolio_item_list for each protocol
            if (protocol.portfolio_item_list && Array.isArray(protocol.portfolio_item_list)) {
              protocol.portfolio_item_list.forEach((item: any) => {
                // * Use net_usd_value from stats
                const itemValue = item.stats?.net_usd_value || 0;
                protocolTotalValue += itemValue;
              });
            }

            totalProtocolsValue += protocolTotalValue;

            this.logger.dev.info(`Protocol ${protocol.name}: total cost = $${protocolTotalValue.toFixed(6)}`);

            if (protocolTotalValue < this.params.customSettings.minProtocolBalance) return;

            walletData.protocols.push({
              id: protocol.id || 'unknown',
              name: protocol.name || 'Unknown Protocol',
              value: protocolTotalValue,
              chain: protocol.chain || 'unknown',
              category: 'defi',
              logo: protocol.logo_url || undefined,
            });
            this.logger.dev.info(`Added protocol: ${protocol.name} - $${protocolTotalValue.toFixed(2)}`);
          });
        } else {
          this.logger.dev.info(
            `portfolioData[${index}] does not contain array data` +
              JSON.stringify({
                hasData: !!portfolioData.data,
                dataType: typeof portfolioData.data,
              })
          );
        }
      });
    }

    if (networkData.apps_list && networkData.apps_list.length > 0) {
      for (const protocol of networkData.apps_list) {
        if (!protocol.is_visible) continue;

        let protocolTotalValue = 0;

        if (protocol.portfolio_item_list && Array.isArray(protocol.portfolio_item_list)) {
          protocol.portfolio_item_list.forEach((item: any) => {
            const itemValue = item.stats?.net_usd_value || 0;
            protocolTotalValue += itemValue;
          });
        }

        totalProtocolsValue += protocolTotalValue;

        this.logger.dev.info(`Protocol ${protocol.name}: total cost = $${protocolTotalValue.toFixed(6)}`);

        if (protocolTotalValue < this.params.customSettings.minProtocolBalance) continue;

        walletData.protocols.push({
          id: protocol.id || 'unknown',
          name: protocol.name || 'Unknown Protocol',
          value: protocolTotalValue,
          logo: protocol.logo_url || undefined,
        });
        this.logger.dev.info(`Added protocol: ${protocol.name} - $${protocolTotalValue.toFixed(2)}`);
      }
    }

    this.logger.dev.info(`Total protocols value: $${totalProtocolsValue.toFixed(2)}`);

    // Calculate the total balance from the sum of tokens and protocols
    walletData.totalValue = totalTokensValue + totalProtocolsValue;

    // Calculate the change over the last 24 hours (weighted by value)
    walletData.change24h = totalValue > 0 ? weightedChange24h / totalValue : 0;

    this.logger.dev.info(`Total token value: $${totalTokensValue.toFixed(2)}`);
    this.logger.dev.info(`Total protocol value: $${totalProtocolsValue.toFixed(2)}`);
    this.logger.dev.info(`Final total value: $${walletData.totalValue.toFixed(2)}`);

    // Group tokens by chains
    const chainMap = new Map<string, any>();

    walletData.tokens.forEach((token) => {
      if (!chainMap.has(token.chain)) {
        chainMap.set(token.chain, {
          name: token.chain,
          value: 0,
          tokens: [],
        });
      }

      const chain = chainMap.get(token.chain);
      chain.value += token.value;
      chain.tokens.push(token);
    });

    walletData.chains = Array.from(chainMap.values());

    // Sort chains by value
    walletData.chains.sort((a, b) => b.value - a.value);

    // Final logging
    this.logger.dev.info(`Final wallet balance for ${this.client.walletAddress}: $${walletData.totalValue.toFixed(2)}`);
    this.logger.dev.info(`Total number of tokens: ${walletData.tokens.length}`);
    this.logger.dev.info(`Total number of protocols: ${walletData.protocols.length}`);
    this.logger.dev.info(`Total number of chains: ${walletData.chains.length}`);

    return walletData;
  }
}

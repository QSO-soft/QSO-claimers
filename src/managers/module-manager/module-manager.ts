import { DataSource } from 'typeorm';

import settings from '../../_inputs/settings/settings';
import { NOT_SAVE_FAILED_WALLET_ERRORS, SOMETHING_WENT_WRONG } from '../../constants';
import {
  createRandomProxyAgent,
  getProxyAgent,
  initLocalLogger,
  msgToTemplateTransform,
  showLogPreparedModules,
  sleepByRange,
} from '../../helpers';
import { clearSavedWallet, markSavedModulesAsError } from '../../helpers/modules/save-modules';
import { LoggerData } from '../../logger';
import { getGlobalModule } from '../../modules';
import {
  FindModuleReturnFc,
  ModuleNames,
  ProxyAgent,
  ProxyObject,
  SupportedNetworks,
  TransformedModuleConfig,
  TransformedModuleParams,
  WalletData,
} from '../../types';
import { sendMsgToTG } from '../telegram';
import { getTgMessageByStatus, transformMdMessage } from '../telegram/helpers';
import { IModuleManager, StartModule } from './types';

let walletIndex: number = 1;
let successCount: number = 0;
let errorCount: number = 0;

export abstract class ModuleManager {
  private wallet: WalletData;
  private modules: TransformedModuleConfig[];
  private baseNetwork: SupportedNetworks;
  private projectName: string;
  private walletsTotalCount: number;
  private dbSource: DataSource;

  constructor({ walletWithModules, walletsTotalCount, baseNetwork, projectName, dbSource }: IModuleManager) {
    this.wallet = walletWithModules.wallet;
    this.modules = walletWithModules.modules;
    this.walletsTotalCount = walletsTotalCount;
    this.projectName = projectName;
    this.baseNetwork = baseNetwork;
    this.dbSource = dbSource;
  }

  abstract findModule(_moduleName: ModuleNames): FindModuleReturnFc | undefined;

  async startModules({ logsFolderName, nativePrices }: StartModule) {
    const walletId = this.wallet.id;
    const logger = initLocalLogger(logsFolderName, walletId);
    logger.setLoggerMeta({ wallet: this.wallet, moduleName: 'Module Manager' });
    const logTemplate: LoggerData = {
      status: 'in progress',
      action: 'startModules',
    };

    const preparedModules = this.modules;
    showLogPreparedModules(preparedModules, logger);

    let proxyObject: ProxyObject | undefined;
    let proxyAgent: ProxyAgent | undefined;
    let currentIp: string = '';

    if (settings.useProxy) {
      const walletProxy = this.wallet.proxy;
      const updateProxyLink = this.wallet.updateProxyLink;
      const isWalletProxyExist = !!walletProxy;
      const walletProxyData = isWalletProxyExist ? await getProxyAgent(walletProxy, updateProxyLink, logger) : null;
      const proxyData = walletProxyData || (await createRandomProxyAgent(logger));

      if (!proxyData) {
        logger.error('You do not use proxy! Fill the _inputs/csv/proxies.csv file');
      } else {
        const { proxyAgent: proxyAgentData, currentIp: currentIpData, ...proxyObjectData } = proxyData;
        proxyAgent = proxyAgentData;
        proxyObject = proxyObjectData;
        currentIp = currentIpData;
      }
    }

    await sleepByRange(settings.delay.betweenWallets, logTemplate, logger);

    let errorMessage = '';

    const telegramPrefixMsg =
      transformMdMessage(`[${walletIndex}/${this.walletsTotalCount}] [${this.wallet.id}]: `) +
      `[${this.wallet.walletAddress}](https://debank.com/profile/${this.wallet.walletAddress})\n`;

    if (walletIndex === +this.walletsTotalCount) {
      walletIndex = 1;
    } else {
      walletIndex++;
    }

    const modulesResult: { msg: string; moduleName: string; status: string }[] = [];

    let shouldStopReversedModule = false;
    for (let moduleIndex = 0; moduleIndex < preparedModules.length; moduleIndex++) {
      const markAsErrorData = {
        wallet: this.wallet,
        projectName: this.projectName,
        moduleIndex,
      };

      const module = preparedModules[moduleIndex] as TransformedModuleConfig;

      const { moduleName } = module;
      logger.setLoggerMeta({ moduleName });

      if (module.reverse && module.isReverse && shouldStopReversedModule) {
        shouldStopReversedModule = false;
        logger.warning('Stop producing current REVERSED MODULE, because of error on previous one', logTemplate);
        continue;
      }

      let currentModuleRunner: FindModuleReturnFc | undefined = getGlobalModule(moduleName);

      if (!currentModuleRunner) {
        currentModuleRunner = this.findModule(moduleName);
      }

      if (!currentModuleRunner) {
        logger.error(`Module [${moduleName}] not found`, logTemplate);
        return;
      }

      const moduleParams: TransformedModuleParams = {
        ...module,
        dbSource: this.dbSource,
        nativePrices,
        projectName: this.projectName,
        baseNetwork: this.baseNetwork,
        proxyAgent,
        proxyObject,
        wallet: this.wallet,
        logger,
        moduleIndex,
      };

      const isModuleWithReverse = module.reverse && !module.isReverse;

      try {
        const {
          status,
          message,
          txScanUrl,
          tgMessage,
          logTemplate: moduleLogTemplate,
        } = await currentModuleRunner(moduleParams);
        const messageToTg = tgMessage || message;

        if (status === 'passed' && module.stopWalletOnPassed) {
          logger.success('Stop producing current PASSED WALLET, because stopWalletOnPassed is true', {
            ...logTemplate,
          });

          clearSavedWallet(this.wallet, this.projectName);
          if (tgMessage) {
            modulesResult.push({
              msg: getTgMessageByStatus(
                'success',
                moduleName,
                tgMessage,
                txScanUrl
                  ? {
                      url: txScanUrl,
                      msg: 'Transaction',
                    }
                  : undefined
              ),
              moduleName,
              status: 'success',
            });
          }

          break;
        }

        if (status === 'passed' && isModuleWithReverse) {
          shouldStopReversedModule = false;
        }

        if (status === 'success') {
          if (isModuleWithReverse) {
            shouldStopReversedModule = false;
          }

          modulesResult.push({
            msg: getTgMessageByStatus(
              'success',
              moduleName,
              tgMessage,
              txScanUrl
                ? {
                    url: txScanUrl,
                    msg: 'Transaction',
                  }
                : undefined
            ),
            moduleName,
            status: 'success',
          });
        }

        if (status === 'warning' || status === 'critical' || status === 'error') {
          const messageWithModuleTemplate = msgToTemplateTransform(message || SOMETHING_WENT_WRONG, {
            ...moduleLogTemplate,
          });

          if (isModuleWithReverse) {
            shouldStopReversedModule = true;
          }

          if (status === 'error') {
            modulesResult.push({
              msg: getTgMessageByStatus('error', moduleName, messageToTg),
              moduleName,
              status: 'error',
            });
            throw new Error(messageWithModuleTemplate);
          }

          if (status === 'warning') {
            const errorMsg = `${messageWithModuleTemplate}${
              module.stopWalletOnError
                ? ', stop producing current WALLET, because stopWalletOnError is true for current module'
                : ''
            }`;

            modulesResult.push({
              msg: getTgMessageByStatus('warning', moduleName, tgMessage || errorMsg),
              moduleName,
              status: 'warning',
            });

            logger.error(errorMsg, {
              ...logTemplate,
            });

            markSavedModulesAsError(markAsErrorData);

            if (module.stopWalletOnError) {
              // Stop all modules and stop wallet
              break;
            }
          }

          if (status === 'critical') {
            logger.error(`${messageWithModuleTemplate}, stop producing current WALLET`, {
              ...logTemplate,
            });

            errorMessage = message || SOMETHING_WENT_WRONG;

            await sendMsgToTG({
              message: `${telegramPrefixMsg} ${getTgMessageByStatus('critical', moduleName, messageToTg)}`,
              type: 'criticalErrors',
              logger,
            });
            modulesResult.push({
              msg: getTgMessageByStatus('error', moduleName, messageToTg),
              moduleName,
              status: 'error',
            });

            markSavedModulesAsError(markAsErrorData);

            // Stop all modules and stop wallet
            break;
          }
        }
      } catch (e) {
        const error = e as Error;
        errorMessage = error.message;

        if (isModuleWithReverse) {
          shouldStopReversedModule = true;
        }

        if (module.stopWalletOnError) {
          const errorMsg = `${errorMessage}, stop producing current WALLET${
            module.stopWalletOnError ? ', because stopWalletOnError is true for current module' : ''
          }`;

          await sendMsgToTG({
            message: `${telegramPrefixMsg} ${getTgMessageByStatus('critical', moduleName, errorMsg)}`,
            type: 'criticalErrors',
            logger,
          });

          modulesResult.push({
            msg: getTgMessageByStatus('warning', moduleName, errorMsg),
            moduleName,
            status: 'warning',
          });

          logger.error(errorMsg, {
            ...logTemplate,
          });

          markSavedModulesAsError(markAsErrorData);

          // Stop all modules and stop wallet
          break;
        }

        logger.error(`${errorMessage}, stop producing current ${moduleName} MODULE`, {
          ...logTemplate,
        });

        markSavedModulesAsError(markAsErrorData);

        const shouldNotSaveFailedWallet = NOT_SAVE_FAILED_WALLET_ERRORS.find((error) => errorMessage.includes(error));
        if (!module.stopWalletOnError && shouldNotSaveFailedWallet) {
          errorMessage = '';
        }
      } finally {
        if (!isModuleWithReverse) {
          await sleepByRange(settings.delay.betweenModules, { ...logTemplate }, logger);
        }
      }
    }

    if (errorCount + successCount >= +this.walletsTotalCount) {
      errorCount = 0;
      successCount = 0;
    }
    if (modulesResult.some(({ status }) => status === 'error' || status === 'warning' || status === 'critical')) {
      errorCount++;
    } else {
      successCount++;
    }
    if (modulesResult.length) {
      const resultArr = modulesResult
        .reduce<any[]>((acc, cur) => {
          const { moduleName, status } = cur;

          const alredyExisted = acc.filter((cur) => cur.moduleName === moduleName && cur.status === status);
          const alredyExistedGroup = alredyExisted.filter((cur) => !!cur.grouped);

          if (alredyExistedGroup.length) {
            return acc.map((cur) =>
              cur.moduleName === moduleName && cur.status === status
                ? {
                    ...cur,
                    grouped: cur.grouped + 1,
                  }
                : cur
            );
          }

          const MAX_TO_GROUP = 25;
          if (alredyExisted.length === MAX_TO_GROUP - 1) {
            const result = [];
            let alreadyAdded = false;

            for (const cur of acc) {
              if (cur.moduleName === moduleName && cur.status === status) {
                if (alreadyAdded) {
                  continue;
                } else {
                  alreadyAdded = true;
                  result.push({
                    ...cur,
                    grouped: MAX_TO_GROUP,
                  });
                }
              } else {
                result.push(cur);
              }
            }

            return result;
          }

          return [...acc, cur];
        }, [])
        .map(({ msg, grouped, moduleName, status }) =>
          grouped ? getTgMessageByStatus(status, moduleName, `Count: ${grouped}`) : msg
        );

      const proxyMsg = `Proxy: ${proxyObject ? (currentIp ? currentIp.replaceAll('.', '\\.') : '❓') : '❌'}\n`;
      await sendMsgToTG({
        message: `\\[🟢 ${successCount} \\| ❌ ${errorCount}\\]\n${telegramPrefixMsg}${proxyMsg}\n__**Modules:**__\n${resultArr.join(
          '\n'
        )}`,
      });
    }

    logger.success(`There are no more modules for current wallet [${this.wallet.walletAddress}]. Next wallet...`, {
      ...logTemplate,
    });

    return errorMessage
      ? {
          wallet: this.wallet,
          errorMessage,
        }
      : { wallet: this.wallet };
  }
}

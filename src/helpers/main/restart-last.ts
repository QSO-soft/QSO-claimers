import settings from '../../_inputs/settings/settings';
import { Moralis } from '../../managers/moralis';
import { saveResultsFromDb } from '../../scripts/claimers/utils';
import { WalletWithModules } from '../../types';
import { getAllNativePrices } from '../currency-handlers';
import { saveFailedWalletsToCSV } from '../file-handlers';
import { getSavedModules, savePreparedModules, updateSavedModulesFinishStatus } from '../modules/save-modules';
import { initLocalLogger } from '../show-logs';
import { prepareSavedWalletsWithModules, prepareWalletsData } from '../wallets';
import { startWithThreads } from './threads';
import { RestartLastArgs } from './types';

export const restartLast = async ({
  logsFolderName,
  projectName,
  baseNetwork,
  clientToPrepareWallets,
  dbSource: dbSourceProp,
  isDbInitialised = false,
  savedModules: savedModulesProp,
  walletsWithModules: walletsWithModulesProp,
  startModulesCallback,
}: RestartLastArgs) => {
  const dbSource = isDbInitialised ? dbSourceProp : await dbSourceProp?.initialize();

  await prepareWalletsData({ projectName, logsFolderName, client: clientToPrepareWallets });

  const { threads } = settings;

  const savedModules = savedModulesProp || getSavedModules(projectName);
  const lastRoute = savedModules.route || '';
  const logger = initLocalLogger(logsFolderName, lastRoute);
  logger.setLoggerMeta({ moduleName: 'RestartLast' });

  const moralis = new Moralis();
  await moralis.init(logger);

  try {
    const walletsWithModulesToRestart = walletsWithModulesProp || prepareSavedWalletsWithModules(savedModules);

    if (!walletsWithModulesToRestart || !walletsWithModulesToRestart.length) {
      logger.success('Nothing to restart');
      return;
    }

    logger.success(`We are starting to work on [${walletsWithModulesToRestart.length}] wallets`);

    savePreparedModules({
      walletsWithModules: walletsWithModulesToRestart,
      route: lastRoute,
      projectName,
    });

    logger.success(`Starting script in [${threads}] threads`);

    const nativePrices = await getAllNativePrices(logger);

    const threadsResults = await startWithThreads<WalletWithModules>({
      size: threads,
      array: walletsWithModulesToRestart,
      dbSource,
      projectName,
      walletsWithModules: walletsWithModulesToRestart,
      callback: async (walletWithModules: WalletWithModules, _, currentWalletIndex) =>
        startModulesCallback({
          nativePrices,
          walletWithModules,
          logsFolderName,
          walletsTotalCount: walletsWithModulesToRestart.length,
          currentWalletIndex,
          baseNetwork,
          projectName,
          dbSource,
        }),
      logger,
    });

    const results = threadsResults.flat();
    if (dbSource) {
      await saveResultsFromDb({
        dbSource,
        projectName,
        walletsWithModules: walletsWithModulesToRestart,
      });
    }

    updateSavedModulesFinishStatus({ projectName });
    saveFailedWalletsToCSV({ results, logger, projectName });
  } catch (error) {
    logger.error(`${error}`);
  }

  return;
};

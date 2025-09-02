import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

import settings from '../../_inputs/settings/settings';
import { Moralis } from '../../managers/moralis';
import { DebankCheckerEntity } from '../../scripts/claimers/db/entities';
import { clearMitosisAirdropStatistic } from '../../scripts/claimers/modules/mitosis/eligibility-checker.service';
// import { clearSomniaAirdropStatistic } from '../../scripts/claimers/modules/somnia/eligibility-checker.service';
import { saveResultsFromDb } from '../../scripts/claimers/utils';
import { WalletWithModules } from '../../types';
import { getAllNativePrices } from '../currency-handlers';
import { saveFailedWalletsToCSV } from '../file-handlers';
import {
  clearSavedModules,
  getSavedModules,
  savePreparedModules,
  updateSavedModulesFinishStatus,
} from '../modules/save-modules';
import { initLocalLogger, showLogSelectedModules } from '../show-logs';
import { sleep } from '../utils';
import { prepareSavedWalletsWithModules, prepareWalletsData, prepareWalletsWithModules } from '../wallets';
import { restartLast } from './restart-last';
import { startWithThreads } from './threads';
import { MainScriptArgs } from './types';

dayjs.extend(duration);

export const runMainScript = async (props: MainScriptArgs) => {
  const {
    clientToPrepareWallets,
    logsFolderName,
    routeHandler,
    projectName,
    routes,
    startModulesCallback,
    filterWalletsCallback,
    dbSource: dbSourceProp,
    baseNetwork,
    ...restProps
  } = props;

  const dbSource = await dbSourceProp.initialize();

  const jsonWallets = await prepareWalletsData({
    logsFolderName,
    projectName,
    client: clientToPrepareWallets,
  });

  const logger = initLocalLogger(logsFolderName, 'main');
  logger.setLoggerMeta({ moduleName: 'Main' });

  const moralis = new Moralis();
  await moralis.init(logger);

  const { threads } = settings;

  for (const route of routes) {
    const logger = initLocalLogger(logsFolderName, `${route}`);
    logger.setLoggerMeta({ moduleName: 'Main' });

    // await clearSomniaAirdropStatistic(dbSource, jsonWallets);
    await clearMitosisAirdropStatistic(dbSource, jsonWallets);

    const entitiesToClear = [DebankCheckerEntity];
    for (const entity of entitiesToClear) {
      const repo = dbSource.getRepository(entity);
      await repo.clear();
    }

    try {
      const routeSettings = routeHandler(route);

      clearSavedModules(projectName);
      showLogSelectedModules(routeSettings, route, logger);

      const areModulesEmpty = routeSettings.modules.length === 0;
      if (areModulesEmpty) {
        logger.error('Modules can not be empty');
        continue;
      }

      const nativePrices = await getAllNativePrices(logger);

      const walletsWithModules = await prepareWalletsWithModules({
        ...restProps,
        route,
        routeSettings,
        logger,
        jsonWallets,
        projectName,
        dbSource,
        filterWalletsCallback,
        nativePrices,
        delayBetweenTransactions: settings.delay.betweenTransactions,
        shouldShuffleModules: settings.shuffle.modules,
        shouldShuffleWallets: settings.shuffle.wallets,
      });
      if (!walletsWithModules?.length) {
        logger.error('Unable to prepare wallets');
        continue;
      }

      if (settings.useSavedModules) {
        savePreparedModules({
          walletsWithModules,
          route,
          projectName,
        });
      }

      logger.success(`Starting script in [${threads}] threads`);

      const results = await startWithThreads<WalletWithModules>({
        size: threads,
        array: walletsWithModules,
        dbSource,
        projectName,
        walletsWithModules,
        callback: async (walletWithModules: WalletWithModules, _, currentWalletIndex) =>
          startModulesCallback({
            nativePrices,
            dbSource,
            walletWithModules,
            logsFolderName,
            walletsTotalCount: walletsWithModules.length,
            currentWalletIndex,
            baseNetwork,
            projectName,
          }),
        logger,
      });

      if (dbSource) {
        await saveResultsFromDb({
          dbSource,
          projectName,
          walletsWithModules,
        });
      }

      if (settings.useSavedModules) {
        updateSavedModulesFinishStatus({ projectName });
      }
      saveFailedWalletsToCSV({ results: results.flat(), logger, projectName });
    } catch (error) {
      logger.error(`${error}`);
      continue;
    }
  }

  if (settings.useRestartInMain) {
    let savedModules = getSavedModules(projectName);
    let walletsWithModulesToRestart = prepareSavedWalletsWithModules(savedModules);

    while (walletsWithModulesToRestart?.length) {
      await restartLast({
        logsFolderName,
        dbSource,
        projectName,
        baseNetwork,
        clientToPrepareWallets,
        isDbInitialised: true,
        startModulesCallback,
        savedModules,
        walletsWithModules: walletsWithModulesToRestart,
      });

      savedModules = getSavedModules(projectName);
      walletsWithModulesToRestart = prepareSavedWalletsWithModules(savedModules);
    }
  }

  const delayBetweenRestarts = settings.delay.betweenRestarts;

  if (delayBetweenRestarts > 0) {
    const secondsFromHours = dayjs.duration(delayBetweenRestarts, 'hour').asSeconds();

    await sleep(secondsFromHours, {}, logger, `Fell asleep for ${delayBetweenRestarts}h before script restarts`);
    await runMainScript(props);
  }

  return;
};

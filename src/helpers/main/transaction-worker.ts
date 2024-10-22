import settings from '../../_inputs/settings/settings';
import { CRITICAL_ERRORS_MAP, PASSED_ERROR_MAP, WARNING_ERRORS_MAP } from '../../constants';
import { LoggerData } from '../../logger';
import { runAutoGas } from '../../managers/auto-gas';
import { MaxGas, ModuleNames, NumberRange, WorkerResponse } from '../../types';
import { getClientByNetwork } from '../clients';
import { waitGas, waitGasMultiple } from '../gas';
import { updateSavedModulesCount } from '../modules/save-modules';
import { checkMultipleOf, createRandomProxyAgent, getRandomNumber, sleep, sleepByRange } from '../utils';
import { getFormattedErrorMessage } from './errors-format';
import { TransactionWorkerPropsWithCallback } from './types';

const DEFAULT_ERROR_MSG = 'Execution was not done successfully';

export const transactionWorker = async (props: TransactionWorkerPropsWithCallback): Promise<WorkerResponse> => {
  const {
    startLogMessage = 'Processing transaction',
    wallet,
    logger,
    baseNetwork,
    count: countTxRange,
    delay,
    transactionCallback,
    projectName,
    moduleIndex,
    proxyAgent,
    proxyObject,
    nativePrices,
    isInnerWorker = false,
  } = props;

  if (countTxRange > 1) {
    logger.success(`Total number of transactions for [${logger.meta.moduleName}] module: [${countTxRange}]`, {
      action: 'transactionWorker',
    });
  }

  const transactionsDelayRange = delay || settings.delay.betweenTransactions;

  let currentProxyAgent = proxyAgent;
  let currentProxyObject = proxyObject;

  const currentNetwork = props.network ? props.network : baseNetwork;

  const client = getClientByNetwork(currentNetwork, wallet.privKey, props.logger);

  let workerResponse: WorkerResponse = {
    status: 'success',
    logTemplate: {},
  };

  for (let txIndex = 0; txIndex < countTxRange; txIndex++) {
    let attempts = settings.txAttempts;

    const logTemplate: LoggerData = {
      txId: txIndex + 1,
      action: 'transactionWorker',
      status: 'in progress',
    };

    workerResponse = {
      ...workerResponse,
      logTemplate,
    };

    while (attempts > 0) {
      try {
        logger.info(startLogMessage, logTemplate);

        const waitGasOptions = {
          logger,
          wallet,
          sleepSeconds: getRandomNumber(settings.delay.betweenCheckGas, true),
        };
        if (props.maxGas) {
          await waitGas({
            maxGas: props.maxGas,
            ...waitGasOptions,
          });
        }

        const maxGasArray = Object.entries(settings.maxGas) as MaxGas[];
        if (maxGasArray.length && !props.maxGas) {
          await waitGasMultiple({
            maxGas: maxGasArray,
            ...waitGasOptions,
          });
        }

        // TODO: move it to constants later
        const modulesWithoutAutogas: ModuleNames[] = [
          'binance-withdraw',
          'okx-withdraw',
          'okx-collect',
          'okx-wait-balance',
          'bitget-collect',
          'bitget-withdraw',
          'bitget-wait-balance',
        ];
        const moduleName = props.moduleName;

        const params = {
          ...props,
          network: currentNetwork,
          proxyAgent: currentProxyAgent,
          proxyObject: currentProxyObject,
          client,
        };

        const shouldRunAutoGas = !modulesWithoutAutogas.includes(moduleName);
        if (shouldRunAutoGas) {
          await runAutoGas(params);
        }

        const response = await transactionCallback({
          ...props,
          network: currentNetwork,
          proxyAgent: currentProxyAgent,
          proxyObject: currentProxyObject,
          client,
        });

        workerResponse = {
          ...workerResponse,
          status: response.status,
          tgMessage: response.tgMessage,
        };

        if (response.txHash && response.explorerLink) {
          const txScanUrl = `${response.explorerLink}/tx/${response.txHash}`;
          workerResponse = {
            ...workerResponse,
            txScanUrl,
          };
          logger.success(`Check your transaction - ${txScanUrl}`, logTemplate);

          updateSavedModulesCount({
            wallet,
            moduleIndex,
            projectName,
          });
        }

        if (response.status === 'success' || response.status === 'passed') {
          const logMessage = response.message || 'Execution was done successfully';

          if (response.status === 'passed' && props.stopWalletOnError) {
            const message = `${logMessage}, stop producing current wallet`;
            logger.success(message, logTemplate);

            updateSavedModulesCount({
              wallet,
              moduleIndex,
              projectName,
            });

            return {
              ...workerResponse,
              status: 'passed',
              message,
            };
          }

          logger.success(logMessage, logTemplate);

          updateSavedModulesCount({
            wallet,
            moduleIndex,
            projectName,
          });
        }

        if (response.status === 'warning' || response.status === 'critical') {
          if (!isInnerWorker && response.status === 'warning' && !props.stopWalletOnError) {
            updateSavedModulesCount({
              wallet,
              moduleIndex,
              projectName,
              setZeroCount: true,
            });
          }

          return {
            ...workerResponse,
            message: response.message || DEFAULT_ERROR_MSG,
          };
        }

        if (response.status === 'error') {
          throw new Error(response.message || DEFAULT_ERROR_MSG);
        }

        if (txIndex !== countTxRange) {
          await sleepByRange(transactionsDelayRange as NumberRange, logTemplate, logger);
        }

        break;
      } catch (e) {
        const errorMessage = getFormattedErrorMessage(e, currentNetwork);

        const criticalMessages = Object.values(CRITICAL_ERRORS_MAP);
        if (criticalMessages.includes(errorMessage)) {
          return {
            ...workerResponse,
            status: 'critical',
            message: errorMessage,
          };
        }

        attempts--;

        const warningMessages = Object.values(WARNING_ERRORS_MAP);
        if (warningMessages.includes(errorMessage)) {
          if (!isInnerWorker && !props.stopWalletOnError && !props.skipClearInSaved) {
            updateSavedModulesCount({
              wallet,
              moduleIndex,
              projectName,
              setZeroCount: true,
            });
          }

          return {
            ...workerResponse,
            status: 'warning',
            message: errorMessage,
          };
        }

        const passedMessages = Object.values(PASSED_ERROR_MAP);
        if (!isInnerWorker && passedMessages.includes(errorMessage) && !props.skipClearInSaved) {
          updateSavedModulesCount({
            wallet,
            moduleIndex,
            projectName,
            setZeroCount: true,
          });

          logger.success(errorMessage, {
            ...logTemplate,
          });

          return {
            ...workerResponse,
            status: 'passed',
          };
        }

        if (attempts > 0 && !isInnerWorker) {
          logger.warning(`${errorMessage}. ${attempts} attempts left`, logTemplate);

          await sleep(settings.delay.betweenRetries, logTemplate, logger);

          const attemptsToChangeProxy = settings.txAttemptsToChangeProxy;
          const currentRetryCount = settings.txAttempts - attempts;

          const shouldUpdateProxy = checkMultipleOf(attemptsToChangeProxy, currentRetryCount);

          if (settings.useProxy && shouldUpdateProxy) {
            const newProxyData = await createRandomProxyAgent(logger);

            if (newProxyData) {
              const { proxyAgent: newProxyAgent, ...newProxyObject } = newProxyData;

              currentProxyAgent = newProxyAgent || proxyAgent;
              currentProxyObject = newProxyObject || proxyObject;
            }
          }
        } else {
          if (!isInnerWorker) {
            logger.warning(`The attempts are over. ${attempts} attempts left`, logTemplate);
          }

          return {
            ...workerResponse,
            status: 'error',
            message: errorMessage,
          };
        }
      }
    }
  }

  return workerResponse;
};

import { TransactionCallbackParams, TransactionCallbackReturn, transactionWorker } from '../../../../helpers';
import { TransformedModuleParams } from '../../../../types';
import { DebankCheckerService } from './debank-checker.service';

export const execMakeDebankBalanceChecker = async (params: TransformedModuleParams) =>
  transactionWorker({
    ...params,
    startLogMessage: 'Execute make Debank balance checker...',
    transactionCallback: makeDebankBalanceCheckerCallback,
  });

export const makeDebankBalanceCheckerCallback = async (
  params: TransactionCallbackParams
): TransactionCallbackReturn => {
  const debankCheckerService = new DebankCheckerService(params);

  try {
    return debankCheckerService.makeDebankBalanceChecker();
  } finally {
    await debankCheckerService.closeBrowser();
  }
};

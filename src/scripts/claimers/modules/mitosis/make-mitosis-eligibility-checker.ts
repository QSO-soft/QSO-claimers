import { TransactionCallbackParams, TransactionCallbackReturn, transactionWorker } from '../../../../helpers';
import { TransformedModuleParams } from '../../../../types';
import { EligibilityCheckerService } from './eligibility-checker.service';

export const execMakeMitosisEligibilityChecker = async (params: TransformedModuleParams) =>
  transactionWorker({
    ...params,
    startLogMessage: 'Execute make Mitosis eligibility checker...',
    transactionCallback: makeMitosisEligibilityCheckerCallback,
  });

export const makeMitosisEligibilityCheckerCallback = async (
  params: TransactionCallbackParams
): TransactionCallbackReturn => {
  const eligibilityCheckerService = new EligibilityCheckerService(params);

  await eligibilityCheckerService.initialize();

  return await eligibilityCheckerService.makeEligibilityCheckHandler();
};

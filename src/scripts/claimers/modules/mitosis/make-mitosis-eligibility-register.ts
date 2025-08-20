import { TransactionCallbackParams, TransactionCallbackReturn, transactionWorker } from '../../../../helpers';
import { TransformedModuleParams } from '../../../../types';
import { EligibilityCheckerService } from './eligibility-checker.service';

export const execMakeMitosisEligibilityRegister = async (params: TransformedModuleParams) =>
  transactionWorker({
    ...params,
    startLogMessage: 'Execute make Mitosis eligibility register...',
    transactionCallback: makeMitosisEligibilityRegisterCallback,
  });

export const makeMitosisEligibilityRegisterCallback = async (
  params: TransactionCallbackParams
): TransactionCallbackReturn => {
  const eligibilityCheckerService = new EligibilityCheckerService(params);

  await eligibilityCheckerService.initialize();

  return await eligibilityCheckerService.makeEligibilityRegisterHandler();
};

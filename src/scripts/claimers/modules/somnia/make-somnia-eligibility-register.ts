import { TransactionCallbackParams, TransactionCallbackReturn, transactionWorker } from '../../../../helpers';
import { TransformedModuleParams } from '../../../../types';
import { EligibilityCheckerService } from './eligibility-checker.service';

export const execMakeSomniaEligibilityRegister = async (params: TransformedModuleParams) =>
  transactionWorker({
    ...params,
    startLogMessage: 'Execute make Somnia eligibility register...',
    transactionCallback: makeSomniaEligibilityRegisterCallback,
  });

export const makeSomniaEligibilityRegisterCallback = async (
  params: TransactionCallbackParams
): TransactionCallbackReturn => {
  const eligibilityCheckerService = new EligibilityCheckerService(params);

  await eligibilityCheckerService.initialize();

  return await eligibilityCheckerService.makeEligibilityRegisterHandler();
};

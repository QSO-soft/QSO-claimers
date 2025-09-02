// import { TransactionCallbackParams, TransactionCallbackReturn, transactionWorker } from '../../../../helpers';
// import { TransformedModuleParams } from '../../../../types';
// import { EligibilityCheckerService } from './eligibility-checker.service';
//
// export const execMakeSomniaEligibilityChecker = async (params: TransformedModuleParams) =>
//   transactionWorker({
//     ...params,
//     startLogMessage: 'Execute make Somnia eligibility checker...',
//     transactionCallback: makeSomniaEligibilityCheckerCallback,
//   });
//
// export const makeSomniaEligibilityCheckerCallback = async (
//   params: TransactionCallbackParams
// ): TransactionCallbackReturn => {
//   const eligibilityCheckerService = new EligibilityCheckerService(params);
//
//   await eligibilityCheckerService.initialize();
//
//   return await eligibilityCheckerService.makeEligibilityCheckHandler();
// };

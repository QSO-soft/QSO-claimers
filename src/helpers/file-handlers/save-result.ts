import { sep } from 'path';

import { CHECKERS_FOLDER, OUTPUTS_CSV_FOLDER } from '../../constants';
import { LoggerData, LoggerType } from '../../logger';
import { WalletData } from '../../types';
import { getFileNameWithPrefix } from '../msg-to-template';
import { convertAndWriteToJSON, convertToCsvAndWrite, DataForCsv } from './csv-converters';

type PromiseResult<T> = PromiseSettledResult<{
  wallet: T;
  errorMessage?: string;
}>;

type FailedResult = {
  id: string;
  walletAddress: string;
  privKey: string;
  failReason: string;
};

interface SaveFailedWalletsArgs<T> {
  results: PromiseResult<T>[];
  logger: LoggerType;
  projectName: string;
}

export const saveFailedWalletsToCSV = <T extends WalletData>({
  results,
  logger,
  projectName,
}: SaveFailedWalletsArgs<T>) => {
  const logTemplate: LoggerData = {
    action: 'saveFailedWalletsToCSV',
  };

  const input = getFileNameWithPrefix(projectName, 'failed-wallets.csv');

  const failedWallets = results.reduce<FailedResult[]>((acc, cur) => {
    if ('value' in cur) {
      const wallet = cur.value.wallet;
      const errorMessage = cur.value.errorMessage;

      const shouldSaveResult = !!errorMessage;

      if (shouldSaveResult) {
        const walletDataToSave = {
          id: wallet.id,
          walletAddress: wallet.walletAddress,
          privKey: wallet.privKey,
          failReason: errorMessage,
        };

        return [...acc, walletDataToSave];
      }
    }

    return acc;
  }, []);

  const dataToSave = failedWallets as unknown as DataForCsv;

  convertToCsvAndWrite({
    data: dataToSave,
    fileName: input,
    outputPath: OUTPUTS_CSV_FOLDER,
  });
  if (failedWallets.length) {
    logger.info(`${failedWallets.length} failed wallets was saved to src/_outputs/csv/${input} file`, {
      ...logTemplate,
    });
  }
};

interface SaveCheckerDataArgs<T> {
  data: T;
  fileName: string;
  fieldToUpdate?: string;
  withoutFiltering?: boolean;
  additionalFilterFields?: string[];
  logger?: LoggerType;
}
export const saveCheckerDataToCSV = async <T extends object>({
  data,
  fileName,
  withoutFiltering,
  additionalFilterFields,
  fieldToUpdate,
}: SaveCheckerDataArgs<T>) => {
  const inputName = `${fileName}.csv`;

  const prevData = await convertAndWriteToJSON({
    inputPath: `${CHECKERS_FOLDER}${sep}${inputName}`,
  });

  let filterFields = ['id'];
  if (additionalFilterFields) {
    filterFields = [...filterFields, ...additionalFilterFields];
  }

  let foundData = {};
  const filteredPrevData = prevData.filter((currentData) => {
    if (withoutFiltering) {
      return true;
    }

    const fieldsExist = filterFields.every((field) => field in currentData && field in data);

    if (fieldsExist) {
      const isFound = filterFields.some(
        (field) => `${currentData[field as keyof typeof currentData]}` !== `${data[field as keyof typeof data]}`
      );

      if (isFound) {
        foundData = currentData;
      }

      return isFound;
    }

    return true;
  });

  const dataToSave =
    foundData && fieldToUpdate
      ? {
          ...foundData,
          [fieldToUpdate]: data[fieldToUpdate as keyof typeof data],
        }
      : data;

  const sortedArray = [...filteredPrevData, dataToSave].sort((firstItem, secondItem) => {
    if ('id' in firstItem && 'id' in secondItem) {
      return `${firstItem.id}`.localeCompare(`${secondItem.id}`);
    }

    return 0;
  });

  convertToCsvAndWrite({
    data: sortedArray as DataForCsv,
    fileName: inputName,
    outputPath: CHECKERS_FOLDER,
  });
};

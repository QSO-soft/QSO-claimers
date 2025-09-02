import uniqBy from 'lodash/uniqBy';

import { NUMBER_ONLY_REGEXP } from '../../constants';
import { LoggerType } from '../../logger';
import { MoreOrLessString, StringRange, WalletData } from '../../types';
import { getFileNameWithPrefix, TemplateData } from '../msg-to-template';
import { RangeByIdFilter } from './types';

export const getWalletsFromKeys = (
  logger: LoggerType,
  jsonWallets: WalletData[],
  projectName: string
): WalletData[] => {
  const logTemplate: TemplateData = {
    moduleName: 'Wallets',
    action: 'getWalletsFromKeys',
  };

  const fileName = getFileNameWithPrefix(projectName, 'wallets.json');

  logger.info(`Getting wallets from ${fileName}`, logTemplate);
  return jsonWallets;
};

const rangeFilterWallets = (data: WalletData[], filter: StringRange) => {
  const [start, end] = filter;

  return data.filter((wallet) => {
    const splittedWallet = wallet.id.split(NUMBER_ONLY_REGEXP);
    const numberPart = splittedWallet[0];

    const isIncorrectId = !numberPart || isNaN(+numberPart);
    if (isIncorrectId) {
      return false;
    }

    return +numberPart >= +start && +numberPart <= +end;
  });
};
const moreOrLessFilterWallets = (data: WalletData[], filter: MoreOrLessString) => {
  const symbolFilterPart = filter[0] || '';
  const numberFilterPart = +filter.slice(1);

  return data.filter((wallet) => {
    const splittedWallet = wallet.id.split(NUMBER_ONLY_REGEXP);
    const numberPart = splittedWallet[0];

    const isIncorrectId = !numberPart || isNaN(+numberPart);
    if (isIncorrectId) {
      return false;
    }

    if (symbolFilterPart === '<') {
      return +numberPart <= numberFilterPart;
    }

    if (symbolFilterPart === '>') {
      return +numberPart >= numberFilterPart;
    }

    return false;
  });
};
const singleFilterWallets = (data: WalletData[], filter: string) => {
  return data.filter((wallet) => {
    const splittedWallet = wallet.id.split(NUMBER_ONLY_REGEXP);
    const numberPart = splittedWallet[0];

    const isIncorrectId = !numberPart || isNaN(+numberPart);
    if (isIncorrectId) {
      return false;
    }

    return +filter === +numberPart;
  });
};

export const getRangedByIdWallets = (wallets: WalletData[], filters: RangeByIdFilter, logger: LoggerType) => {
  const logTemplate: TemplateData = {
    moduleName: 'Wallets',
    action: 'getRangedByIdWallets',
  };

  const isFiltersEmpty = !filters.length;
  if (isFiltersEmpty) {
    return wallets;
  }

  logger.info(
    `Getting filtered wallets for ids [${filters
      .map((filter) => (typeof filter === 'string' ? filter : `[${filter[0]}, ${filter[1]}]`))
      .join(', ')}]`,
    logTemplate
  );

  const filteredWallets: WalletData[] = [];

  for (const filter of filters) {
    if (Array.isArray(filter)) {
      filteredWallets.push(...rangeFilterWallets(wallets, filter));
    } else {
      if (filter[0] === '<' || filter[0] === '>') {
        filteredWallets.push(...moreOrLessFilterWallets(wallets, filter as MoreOrLessString));
      } else {
        filteredWallets.push(...singleFilterWallets(wallets, filter));
      }
    }
  }

  return uniqBy(filteredWallets, 'index');
};

// Описание роута:
// Базовый роут, который предназначен для запуска, после деплоя кошелька для набива транзакций и контрактов

import { GroupSettings, NumberRange, RouteSettings, UserModuleConfig } from '../../../types';

// ====================== MODULES ======================
// Из всех модулей, возьмёт только 1 рандомный
// Укажите [0, 0] если хотите чтобы использовались все модули
const countModules = [0, 0] as NumberRange;

const groupSettings: GroupSettings = {};

const modules: UserModuleConfig[] = [
  // {
  //   moduleName: 'superform-superfrens-claim-NFT',
  //   network: 'base',
  //   indexGroup: 1,
  //
  //   // Tournament ID
  //   nftId: 1,
  // },
  // {
  //   moduleName: 'superform-superfrens-claim-NFT',
  //   network: 'base',
  //   indexGroup: 1,
  //
  //   // Tournament ID
  //   nftId: 2,
  // },
  // {
  //   moduleName: 'superform-superfrens-claim-NFT',
  //   network: 'base',
  //   indexGroup: 1,
  //
  //   // Tournament ID
  //   nftId: 3,
  // },
  // {
  //   moduleName: 'superform-superfrens-claim-NFT',
  //   network: 'base',
  //   indexGroup: 1,
  //
  //   // Tournament ID
  //   nftId: 4,
  // },
  // {
  //   moduleName: 'superform-superfrens-claim-NFT',
  //   network: 'base',
  //   indexGroup: 1,
  //
  //   // Tournament ID
  //   nftId: 5,
  // },
  {
    moduleName: 'superform-superfrens-claim-NFT',
    network: 'base',
    indexGroup: 1,

    // Tournament ID
    nftId: 6,
  },
];

// Выполнит скрипт на указанном количестве кошельков
// То есть из 100 кошельков, которые попадут под фильтр - возьмёт в работу только первые
// Если хотите отключить, укажите 0!
const limitWalletsToUse = 0;

// Перемешает все транзакции конкретного модуля между всеми модулями.
// Если у вас будет указано false, тогда транзакции модуля, которые указаны в count будут вызываться одна за одной.
// Если указали true:
// Вот это - [{ moduleName: 'starkVerse', count: [2,2] }, { moduleName: 'dmail', count: [2,2] }]
// Превратится в это - [{moduleName: 'starkVerse', count: [1,1]}, {moduleName: 'starkVerse', count: [1,1]}, {moduleName: 'dmail', count: [1,1]}, {moduleName: 'dmail', count: [1,1]}]
// А если вы указали в settings.shuffle.modules: true, тогда они еще перемешаются между собой.
const splitModuleCount = false;

export const flow: RouteSettings = {
  modules,
  countModules,
  groupSettings,
  limitWalletsToUse,
  splitModuleCount,
};

// Описание роута:
// Базовый роут, который предназначен для запуска, после деплоя кошелька для набива транзакций и контрактов

import { GroupSettings, NumberRange, RouteSettings, UserModuleConfig } from '../../../types';

// ====================== MODULES ======================
// Из всех модулей, возьмёт только 1 рандомный
// Укажите [0, 0] если хотите чтобы использовались все модули
const countModules = [0, 0] as NumberRange;

const groupSettings: GroupSettings = {};

const modules: UserModuleConfig[] = [
  {
    moduleName: 'hyperlane-airdrop-check',

    indexGroup: 0,
  },

  {
    // При указании delegateToAddress, в качестве получателя дропа будет выбран именно этот адресс
    moduleName: 'hyperlane-airdrop-register',

    // В каком токене регистрировать дроп
    // 'HYPER' | 'stHYPER'
    srcToken: 'HYPER',

    // Сеть, в которой будет выполнена регистрация дропа
    // 'eth' | 'base' | 'arbitrum' | 'optimism' | 'bsc'
    network: 'eth',

    // При указании данного параметра, для регистрации будет выбрана рандомная сеть из указанных
    // Если не хотите рандомить сеть, просто удалите данный параметр
    randomNetworks: ['base', 'arbitrum', 'optimism'],

    indexGroup: 1,
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

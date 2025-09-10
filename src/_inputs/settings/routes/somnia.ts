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
  //   moduleName: 'somnia-check-claim',
  //   indexGroup: 1,
  // },
  {
    moduleName: 'somnia-claim',
    indexGroup: 2,
  },
  {
    moduleName: 'transfer-token',
    indexGroup: 3,

    // Сколько токенов отправлять на transferAddress
    minAndMaxAmount: [100, 100],
    // Использовать ли minAndMaxAmount как значение процента от баланса токенов
    usePercentBalance: true,

    // ИЛИ

    // Сколько оставлять токенов на балансе при отправке
    balanceToLeft: [0.01, 0.05],

    // Будет делать трансфер только если баланс выше данного значения
    minTokenBalance: 0.5,

    network: 'somnia',
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

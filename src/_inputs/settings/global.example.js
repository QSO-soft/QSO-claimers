// Секретная фраза, которая будет использоваться для шифрования ваших приватных данных
// Эта же фраза будет использоваться и для их расшифровки по этому не удаляйте её!
// Пример: 'abracadabra209581kdhask'
export const SECRET_PHRASE = 'abracadabra';

export const SOLVIUM_CAPTCHA_KEY = '';

// Приватные данные от OKX для авто-пополнения
export const OKX = {
  // Имя аккаунта, который будет использоваться в скриптах
  // Сделан этот выбор, чтобы можно было легко и удобно переключаться между разными ОКХ
  accountName: 'account-1',

  // Optional!
  // Указав имейл ОКХ в данном поле,
  // при выполнении модуля okx-collect, балансы всех ОКХ будут перекидываться на него
  // Пример: example@gmail.com
  collectAccountEmail: '',
  // Optional!
  // Если указан collectAccountEmail и это имейл привязан к одному из ОКС в okxAccounts,
  // то следует указать имя этого аккаунта тут, чтобы скрипт не пробовал перевести деньги с него на самого себя
  // Пример: 'accountName1'
  collectAccountName: '',

  // Создать можно тут -> https://www.okx.com/ru/account/my-api
  accounts: {
    // Имя может быть любое, главное чтобы в accountName было такое же
    'account-1': {
      apiKey: '',
      secret: '',
      password: '',
    },
    'account-2': {
      apiKey: '',
      secret: '',
      password: '',
    },
    'account-3': {
      apiKey: '',
      secret: '',
      password: '',
    },
  },

  // Optional!
  // Пример: http://login:pass@ip:port,
  proxy: '',
};

// Приватные данные от Bitget
export const BITGET = {
  apiKey: '',
  secret: '',
  passphrase: '',

  // Пример: http://login:pass@ip:port
  proxy: '',
};

// Приватные данные от Binance для авто-пополнения
export const BINANCE = {
  // Создать можно тут -> https://www.binance.com/en/binance-api
  secretKeys: {
    apiKey: '',
    secret: '',
  },

  // Пример: http://login:pass@ip:port,
  proxy: '',
};

// Получить ключ можно тут - https://portal.1inch.dev/login
// Пример: sLsss22wwQsdwasKThqkQOCD2daw
export const INCH_KEY = '';

// Ваша приватная RPC (не обязательно)
export const RPC = {
  taiko: '',
  bsc: '',
  opBNB: '',
  eth: '',
  sepolia: '',
  blast: '',
  story: '',

  polygon: '',
  arbitrum: '',
  avalanche: '',
  optimism: '',

  zkSync: '',
  zkFair: '',
  polygon_zkevm: '',

  base: '',
  linea: '',
  scroll: '',
  fantom: '',

  core: '',
  celo: '',
  zora: '',

  gnosis: '',
  klay: '',

  aptos: '',
  starknet: '',
};

// Приватные данные для экстренных telegram уведомлений
export const TELEGRAM = {
  // Создаём тут -> https://t.me/BotFather
  // Пример: 3351122561:BBAh5G_Xdkljlkf2fkjansfdaskjnfwk1
  token: {
    modulesInfo: '', // уведомления про выполнение модулей
    criticalErrors: '', // уведомления с критическими ошибками, которые возможно нужно исправить самому (например, пополнить баланс)
  },

  // Узнать можно тут -> https://t.me/getmyid_bot
  // Пример: [721667338, 721667339]
  IDs: {
    modulesInfo: [],
    criticalErrors: [],
  },
};

// Приватные данные от BingX для авто-пополнения
export const BINGX = {
  apiKey: '',
  secret: '',
};

// OPTIONAL
// Приватный ключ от Ankr RPC
// Пример: a70406a97dsakjh27412t9fdashkjdll8w2hkjdnaskda9124ydcaf1505
export const ANKR_KEY = '';

// Получить ключ можно тут - https://admin.moralis.io/register
export const MORALIS_KEY = '';

// Приватный ключ от Anti-Catpcha - https://anti-captcha.com/
export const ANTICAPTCHA_KEY = '';

// Приватный ключ от Capmonster - https://capmonster.cloud/
export const CAPMONSTER_CAPTCHA_KEY = '';

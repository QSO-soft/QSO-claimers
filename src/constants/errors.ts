export const OKX_ERROR = 'Something wrong with OKX';
export const EMPTY_BALANCE_ERROR = 'Insufficient balance';
export const BITGET_KEYS_ERROR = 'Please provide keys for Bitget in _inputs/settings/global.js file';
export const BITGET_ADDRESS_EMPTY_ERROR =
  'You dont have a Bitget address for transfer. Please add it to the _inputs/csv/wallets.csv';

export const OKX_WL_ERROR = 'Wallet was not whitelisted in OKX';
export const LOW_BALANCE_ERROR = 'Balance is too low to make transaction. Please topUp your wallet';
export const MIN_TOKEN_BALANCE_ERROR = 'Balance is lower than minTokenBalance';
export const MERKLY_LOW_BALANCE_ERROR =
  'Balance is too low to make transaction. You need to topUp wallet or decrease minAndMaxAmount';
export const ZKLEND_DEPOSIT_NOT_FOUND_ERROR = 'deposit was not found';
export const ZKLEND_SUPPLY_AMOUNT =
  'Amount to supply can not be greater than current balance. usePercentBalance better to use instead';
export const VOTE_INTERVAL = 'require vote interval';
export const CHECK_IN_INTERVAL = 'checkin too often';
export const NFT_CLAIMED = 'Profile NFT: Single address is not allowed to have multiple tokens';
export const AMOUNT_IS_TOO_LOW_ERROR =
  'Amount is too low to get minimal balance or lower than minAmount. Increase your minAndMaxAmount or expectedBalance';
export const KILOEX_LOW_POINTS_BALANCE_ERROR =
  'You need a points balance of ≥35 to check in. You can first obtain Trading/Earn/Referral points.';
export const EMPTY_ANTICAPTCHA_KEY_ERROR =
  'It requires anticaptcha key. Please provide ANTICAPTCHA_KEY to the global.js';
export const EMPTY_CAPMONSTER_KEY_ERROR =
  'It requires capmonster captcha key. Please provide CAPMONSTER_CAPTCHA_KEY to the global.js';
export const NO_MAIL_TO_USE = 'You dont have not used mails';
export const SECOND_ADDRESS_EMPTY_ERROR =
  'You dont have a second address to transfer BNB. Please add it to the _inputs/csv/wallets.csv';
export const ACTIVITY_ENDED_ERROR = 'Activity end';
export const INVALID_API_KEY_ERROR = 'API-key is invalid. Please check your key in _inputs/settings/global.js';
export const LOW_AMOUNT_ERROR = 'Cannot be less than the minimum delivery amount';
export const ANTICAPTCHA_LOW_BALANCE_ERROR = 'Account has zero or negative balance';
export const ANTICAPTCHA_LOW_BALANCE_CUSTOM_ERROR = 'Anticaptcha account has low balance';
export const UNABLE_GET_WITHDRAW_FEE_ERROR = 'Unable to get fee for current withdraw parameters';
export const NOTHING_TO_CLAIM_ERROR = 'Nothing to claim';
export const CLAIM_TX_NOT_FOUND = 'Claim transaction was not found';
export const DB_NOT_CONNECTED = 'DB not connected';
export const ZERO_TRANSFER_AMOUNT = 'Amount to transfer is zero';
export const IS_CLAIMED_ERROR = 'Already claimed';
export const NFT_HOLDING_ERROR = 'Only hold NFT to sign in';
export const NFT_HOLDING_CUSTOM_ERROR = 'You need to hold NFT to make it';
export const NETWORK_IS_WRONG_ERROR = 'network is wrong';
export const WITHDRAW_ERROR = 'Unable to make withdraw successfully';
export const NO_CURRENCY_ERROR = 'User does not own this currency';
export const NO_TOKEN_ERROR = 'You do not have enough of this token in your balance';
export const SOMETHING_WENT_WRONG = 'Something went wrong';
export const NOT_ENOUGH_FUNDS_FOR_FEE_ERROR =
  'There are not enough funds to pay the network fee, top up your native balance';

export const MAX_TXS_COUNT_IS_DONE_MESSAGE = 'already equals or more than provided maxTxsCount';
export const SUCCESS_MESSAGES_TO_STOP_WALLET = [MAX_TXS_COUNT_IS_DONE_MESSAGE];

export const CRITICAL_ERRORS_MAP = {
  // 'The total cost (gas * gas fee + value)': LOW_BALANCE_ERROR,
  [ANTICAPTCHA_LOW_BALANCE_ERROR]: ANTICAPTCHA_LOW_BALANCE_CUSTOM_ERROR,
  // 'intrinsic gas too high': LOW_BALANCE_ERROR,
  // 'insufficient balance for transfer': LOW_BALANCE_ERROR,
  // 'User has insufficient balance': LOW_BALANCE_ERROR,
  // [EMPTY_BALANCE_ERROR]: LOW_BALANCE_ERROR,
  // 'insufficient funds for gas + value': LOW_BALANCE_ERROR,
  // 'out of gas: gas required exceeds allowance': LOW_BALANCE_ERROR,
  'API-key format invalid': INVALID_API_KEY_ERROR,
  'Invalid Api-Key ID': INVALID_API_KEY_ERROR,
  'okx requires "apiKey" credential': INVALID_API_KEY_ERROR,
  'not authorized to execute this request': NO_TOKEN_ERROR,
  [OKX_WL_ERROR]: OKX_WL_ERROR,
  [OKX_ERROR]: OKX_ERROR,
  [BITGET_KEYS_ERROR]: BITGET_KEYS_ERROR,
  [AMOUNT_IS_TOO_LOW_ERROR]: AMOUNT_IS_TOO_LOW_ERROR,
  [WITHDRAW_ERROR]: WITHDRAW_ERROR,
  [NO_CURRENCY_ERROR]: NO_CURRENCY_ERROR,
  [NOT_ENOUGH_FUNDS_FOR_FEE_ERROR]: NOT_ENOUGH_FUNDS_FOR_FEE_ERROR,
};

export const WARNING_ERRORS_MAP = {
  [UNABLE_GET_WITHDRAW_FEE_ERROR]: UNABLE_GET_WITHDRAW_FEE_ERROR,
  [NOTHING_TO_CLAIM_ERROR]: NOTHING_TO_CLAIM_ERROR,
  [LOW_AMOUNT_ERROR]: LOW_AMOUNT_ERROR,
  'The entered amount is too low': LOW_AMOUNT_ERROR,
  'Withdrawal amount exceeds the upper limit': 'Calculated amount to withdraw exceeds the upper limit',
  [NO_MAIL_TO_USE]: NO_MAIL_TO_USE,
  [SECOND_ADDRESS_EMPTY_ERROR]: SECOND_ADDRESS_EMPTY_ERROR,
  [EMPTY_ANTICAPTCHA_KEY_ERROR]: EMPTY_ANTICAPTCHA_KEY_ERROR,
  [EMPTY_CAPMONSTER_KEY_ERROR]: EMPTY_CAPMONSTER_KEY_ERROR,
};

export const PASSED_ERROR_MAP = {
  [ACTIVITY_ENDED_ERROR]: 'This activity ended. You can turn off this module',
  [CHECK_IN_INTERVAL]: 'Try again in 24 hours. You already passed this task',
  [VOTE_INTERVAL]: 'Try again in 24 hours. You already passed this task',
  [IS_CLAIMED_ERROR]: IS_CLAIMED_ERROR,
  [NFT_CLAIMED]: 'You already passed this task',
  [NFT_HOLDING_ERROR]: NFT_HOLDING_CUSTOM_ERROR,
};

export const NOT_SAVE_FAILED_WALLET_ERRORS = Object.values(PASSED_ERROR_MAP);

import { defaultTokenAbi } from '../../../../clients/abi';
import { ClientType } from '../../../../helpers';
import { TokenContract } from '../../../../types';
import { ZORA_TOKEN_CONTRACT } from './constants';

export const getBalance = async (client: ClientType) => {
  const contractInfo: TokenContract = {
    name: 'ZORA',
    address: ZORA_TOKEN_CONTRACT,
    abi: defaultTokenAbi,
  };
  const { int: currentBalance, wei: currentBalanceWei, decimals } = await client.getBalanceByContract(contractInfo);

  return { currentBalance, currentBalanceWei, decimals };
};

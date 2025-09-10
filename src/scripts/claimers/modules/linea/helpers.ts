import { defaultTokenAbi } from '../../../../clients/abi';
import { ClientType } from '../../../../helpers';
import { TokenContract } from '../../../../types';
import { TOKEN_CONTRACT } from './constants';

// interface GetData {
//   network: SupportedNetworks;
//   walletAddress: Hex;
//   chainId: number;
//   config?: BaseAxiosConfig;
// }
//
// export interface ProofRes {
//   uuid: string;
//   amount: string;
//   proof: Hex[];
// }
// export const getProofData = async ({ walletAddress, config }: GetData): Promise<ProofRes[]> => {
//   const { data } = await axios.get(`https://api.hedgey.finance/token-claims/${walletAddress}`, config);
//
//   return data;
// };

export const getBalance = async (client: ClientType) => {
  const contractInfo: TokenContract = {
    name: 'LINEA',
    address: TOKEN_CONTRACT,
    abi: defaultTokenAbi,
  };
  const { int: currentBalance, wei: currentBalanceWei } = await client.getBalanceByContract(contractInfo);

  return { currentBalance, currentBalanceWei };
};

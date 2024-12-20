import axios from 'axios';
import { Hex } from 'viem';

import { WalletClient } from '../../../../clients';
import { defaultTokenAbi } from '../../../../clients/abi';
import { ClientType } from '../../../../helpers';
import { BaseAxiosConfig, SupportedNetworks, TokenContract } from '../../../../types';
import { TOKEN_CONTRACT } from './constants';

interface GetData {
  network: SupportedNetworks;
  walletAddress: Hex;
  chainId: number;
  config?: BaseAxiosConfig;
}

export const getProofData = async ({ walletAddress, config }: GetData): Promise<any> => {
  const { data: claimData } = await axios.get(
    `https://api.odos.xyz/loyalty/permits/8453/0xca73ed1815e5915489570014e024b7EbE65dE679/${walletAddress}`,
    config
  );

  return claimData.data;
};

interface SignIn {
  walletAddress: Hex;
  walletClient: WalletClient;
  config?: BaseAxiosConfig;
}
export const signIn = async ({ walletAddress, walletClient, config }: SignIn): Promise<string> => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let nonce = '';
  for (let i = 0; i < length; i++) {
    nonce += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  const message = `https://app.odos.xyz wants you to sign in with your Ethereum account:
${walletAddress}

Sign in with Ethereum on Odos. This is NOT a transaction and does NOT give Odos or anyone else permission to send transactions or interact with your assets. By signing in, you accept all terms at https://docs.odos.xyz/resources/policies/terms-of-use

URI: https://app.odos.xyz
Version: 1
Chain ID: 42161
Nonce: ${nonce}
Issued At: ${new Date().toISOString()}`;

  const signature = await walletClient.signMessage({
    message,
  });

  const { data: signData } = await axios.post(
    'https://api.odos.xyz/user/login',
    {
      signInMessage: message,
      signature,
    },
    config
  );

  return signData.token;
};

export const getBalance = async (client: ClientType) => {
  const contractInfo: TokenContract = {
    name: 'ODOS',
    address: TOKEN_CONTRACT,
    abi: defaultTokenAbi,
  };
  const { int: currentBalance, wei: currentBalanceWei } = await client.getBalanceByContract(contractInfo);

  return { currentBalance, currentBalanceWei };
};

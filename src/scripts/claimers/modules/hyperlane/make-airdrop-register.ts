import axios from 'axios';

import { DB_NOT_CONNECTED } from '../../../../constants';
import {
  getAxiosConfig,
  getClientByNetwork,
  getHeaders,
  getRandomItemFromArray,
  sleep,
  TransactionCallbackParams,
  TransactionCallbackReturn,
  transactionWorker,
} from '../../../../helpers';
import { TransformedModuleParams } from '../../../../types';
import { HyperlaneAirdropCheckEntity } from '../../db/entities';

export const execMakeHyperlaneAidropRegister = async (params: TransformedModuleParams) =>
  transactionWorker({
    ...params,
    startLogMessage: 'Execute make Hyperlane airdrop register...',
    transactionCallback: makeHyperlaneAidropRegister,
  });

const makeHyperlaneAidropRegister = async (params: TransactionCallbackParams): TransactionCallbackReturn => {
  const { proxyAgent, dbSource, wallet, network: networkProp, randomNetworks, logger, srcToken = 'HYPER' } = params;

  if (!dbSource) {
    return {
      status: 'critical',
      message: DB_NOT_CONNECTED,
    };
  }

  let network = networkProp;
  if (randomNetworks?.length) {
    network = getRandomItemFromArray(randomNetworks);
  }

  const client = getClientByNetwork(network, wallet.privKey, logger);

  const { walletAddress, walletClient } = client;
  const receivingAddress = wallet.delegateToAddress || walletAddress;

  const dbRepo = dbSource.getRepository(HyperlaneAirdropCheckEntity);

  let walletInDb = await dbRepo.findOne({
    where: {
      walletAddress,
    },
  });
  if (walletInDb) {
    await dbRepo.remove(walletInDb);
  }

  const created = dbRepo.create({
    walletId: wallet.id,
    index: wallet.index,
    walletAddress,
  });
  walletInDb = await dbRepo.save(created);

  const headers = getHeaders({
    Origin: 'https://claim.hyperlane.foundation',
    Referer: 'https://claim.hyperlane.foundation/',
  });
  const config = await getAxiosConfig({
    proxyAgent,
    headers,
  });

  const { data } = await axios.get(
    `https://claim.hyperlane.foundation/api/check-eligibility?address=${walletAddress}`,
    config
  );

  await sleep(0.5);

  const isEligible = data?.response?.isEligible;

  if (!isEligible) {
    return {
      status: 'passed',
      message: 'Not eligible',
    };
  }

  logger.info(
    `Registering airdrop of ${srcToken} in ${network}${
      wallet.delegateToAddress ? ` with receiver ${wallet.delegateToAddress}` : ''
    }...`
  );

  let amount = 0;
  for (const eligibility of data?.response?.eligibilities || []) {
    amount += +(eligibility?.amount || '0');
  }

  await dbRepo.update(walletInDb.id, {
    isEligible,
    amount,
  });

  await axios.get('https://claim.hyperlane.foundation/airdrop-registration?_rsc=y4cul', {
    ...config,
    headers: {
      ...config.headers,
      'Next-Router-State-Tree':
        '%5B%22%22%2C%7B%22children%22%3A%5B%22(home)%22%2C%7B%22children%22%3A%5B%22__PAGE__%22%2C%7B%7D%2C%22%2F%22%2C%22refresh%22%5D%7D%5D%7D%2Cnull%2Cnull%2Ctrue%5D',
      'Next-Url': '/airdrop-registration',
    },
  });

  const msgData = {
    eligibleAddress: walletAddress,
    amount: `${amount}`,
    chainId: BigInt(client.chainData.id),
    receivingAddress,
    tokenType: srcToken,
  };

  const signature = await walletClient.signTypedData({
    types: {
      Message: [
        {
          name: 'eligibleAddress',
          type: 'string',
        },
        {
          name: 'chainId',
          type: 'uint256',
        },
        {
          name: 'amount',
          type: 'string',
        },
        {
          name: 'receivingAddress',
          type: 'string',
        },
        {
          name: 'tokenType',
          type: 'string',
        },
      ],
    },
    primaryType: 'Message',
    domain: {
      name: 'Hyperlane',
      version: '1',
    },
    message: msgData,
  });

  const { data: registerData } = await axios.post(
    'https://claim.hyperlane.foundation/api/save-registration',
    {
      wallets: [
        {
          ...msgData,
          chainId: client.chainData.id,
          eligibleAddressType: 'ethereum',
          signature,
        },
      ],
    },
    config
  );

  if (!registerData?.validationResult?.success) {
    return {
      status: 'error',
      message: 'Unable to register for airdrop',
    };
  }

  await dbRepo.update(walletInDb.id, {
    isEligible,
    amount,
    registrationNetwork: network,
    registrationToken: srcToken,
    registrationReceivingAddress: receivingAddress,
    isRegistered: true,
  });

  await axios.get('https://claim.hyperlane.foundation/?openRegistrationCompletePopup=&_rsc=2uyiw', {
    ...config,
    headers: {
      ...config.headers,
      'Next-Router-State-Tree':
        '%5B%22%22%2C%7B%22children%22%3A%5B%22airdrop-registration%22%2C%7B%22children%22%3A%5B%22__PAGE__%22%2C%7B%7D%2C%22%2Fairdrop-registration%22%2C%22refresh%22%5D%7D%5D%7D%2Cnull%2Cnull%2Ctrue%5D',
      'Next-Url': '/airdrop-registration',
    },
  });

  await axios.get(
    `https://claim.hyperlane.foundation/api/get-registration-for-address?address=${walletAddress}`,
    config
  );

  const receiverMsg = wallet.delegateToAddress ? `| Receiver: ${wallet.delegateToAddress}` : '';
  const message = `Amount: ${amount} ${srcToken} | Registered in ${network} ${receiverMsg}`;
  return {
    status: 'success',
    message,
    tgMessage: message,
  };
};

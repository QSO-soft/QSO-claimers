import {
  ArbitrumClient,
  AvalancheClient,
  BaseClient,
  BlastClient,
  BscClient,
  CeloClient,
  CoreClient,
  EthClient,
  FantomClient,
  GnosisClient,
  KlayClient,
  LineaClient,
  OpBnbClient,
  OptimismClient,
  PolygonClient,
  PolygonZkEvmClient,
  ScrollClient,
  SepoliaClient,
  StoryClient,
  TaikoClient,
  ZkFairClient,
  ZkSyncClient,
  ZoraClient,
} from '../../clients';
import { LoggerType } from '../../logger';
import { Networks, SupportedNetworks } from '../../types';
import { decryptKey } from '../cryptography-handlers';

export const getClientByNetwork = (networkName: SupportedNetworks, privKey: string, logger: LoggerType) => {
  const decryptedPrivKey = decryptKey(privKey);

  switch (networkName) {
    case Networks.TAIKO:
      return new TaikoClient(decryptedPrivKey, logger);
    case Networks.BSC:
      return new BscClient(decryptedPrivKey, logger);
    case Networks.OP_BNB:
      return new OpBnbClient(decryptedPrivKey, logger);
    case Networks.ETH:
      return new EthClient(decryptedPrivKey, logger);
    case Networks.SEPOLIA:
      return new SepoliaClient(decryptedPrivKey, logger);

    case Networks.POLYGON:
      return new PolygonClient(decryptedPrivKey, logger);
    case Networks.ARBITRUM:
      return new ArbitrumClient(decryptedPrivKey, logger);
    case Networks.AVALANCHE:
      return new AvalancheClient(decryptedPrivKey, logger);
    case Networks.OPTIMISM:
      return new OptimismClient(decryptedPrivKey, logger);
    case Networks.BLAST:
      return new BlastClient(decryptedPrivKey, logger);

    case Networks.ZKSYNC:
      return new ZkSyncClient(decryptedPrivKey, logger);
    case Networks.ZKFAIR:
      return new ZkFairClient(decryptedPrivKey, logger);
    case Networks.POLYGON_ZKEVM:
      return new PolygonZkEvmClient(decryptedPrivKey, logger);

    case Networks.BASE:
      return new BaseClient(decryptedPrivKey, logger);
    case Networks.LINEA:
      return new LineaClient(decryptedPrivKey, logger);
    case Networks.SCROLL:
      return new ScrollClient(decryptedPrivKey, logger);
    case Networks.FANTOM:
      return new FantomClient(decryptedPrivKey, logger);

    case Networks.CORE:
      return new CoreClient(decryptedPrivKey, logger);
    case Networks.CELO:
      return new CeloClient(decryptedPrivKey, logger);
    case Networks.ZORA:
      return new ZoraClient(decryptedPrivKey, logger);

    case Networks.GNOSIS:
      return new GnosisClient(decryptedPrivKey, logger);
    case Networks.KLAY:
      return new KlayClient(decryptedPrivKey, logger);

    case Networks.STORY:
      return new StoryClient(decryptedPrivKey, logger);

    default:
      throw new Error(`Client for ${networkName} network was not found`);
  }
};

export type ClientType = ReturnType<typeof getClientByNetwork>;
export type ClientClass = new (privateKey: string, logger: LoggerType) => ClientType;

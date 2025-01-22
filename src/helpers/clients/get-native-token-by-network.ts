import {
  arbitrum,
  avalanche,
  base,
  bsc,
  fantom,
  linea,
  mainnet,
  opBNB,
  optimism,
  polygon,
  polygonZkEvm,
  scroll,
  zkFair,
  zkSync,
  coreDao,
  celo,
  zora,
  gnosis,
  klaytn,
  blast,
  taiko,
  sepolia,
} from 'viem/chains';

import { Networks, SupportedNetworks } from '../../types';

export const getNativeTokenByNetwork = (networkName: SupportedNetworks) => {
  switch (networkName) {
    case Networks.TAIKO:
      return taiko.nativeCurrency.symbol;
    case Networks.BSC:
      return bsc.nativeCurrency.symbol;
    case Networks.OP_BNB:
      return opBNB.nativeCurrency.symbol;
    case Networks.ETH:
      return mainnet.nativeCurrency.symbol;
    case Networks.SEPOLIA:
      return sepolia.nativeCurrency.symbol;

    case Networks.POLYGON:
      return polygon.nativeCurrency.symbol;
    case Networks.ARBITRUM:
      return arbitrum.nativeCurrency.symbol;
    case Networks.AVALANCHE:
      return avalanche.nativeCurrency.symbol;
    case Networks.OPTIMISM:
      return optimism.nativeCurrency.symbol;

    case Networks.ZKSYNC:
      return zkSync.nativeCurrency.symbol;
    case Networks.ZKFAIR:
      return zkFair.nativeCurrency.symbol;
    case Networks.POLYGON_ZKEVM:
      return polygonZkEvm.nativeCurrency.symbol;
    case Networks.BLAST:
      return blast.nativeCurrency.symbol;

    case Networks.BASE:
      return base.nativeCurrency.symbol;
    case Networks.LINEA:
      return linea.nativeCurrency.symbol;
    case Networks.SCROLL:
      return scroll.nativeCurrency.symbol;
    case Networks.FANTOM:
      return fantom.nativeCurrency.symbol;

    case Networks.CORE:
      return coreDao.nativeCurrency.symbol;
    case Networks.CELO:
      return celo.nativeCurrency.symbol;
    case Networks.ZORA:
      return zora.nativeCurrency.symbol;

    case Networks.GNOSIS:
      return gnosis.nativeCurrency.symbol;
    case Networks.KLAY:
      return klaytn.nativeCurrency.symbol;

    default:
      throw new Error(`Native token for ${networkName} network was not found`);
  }
};

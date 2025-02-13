import { explorerLinks } from '../../constants';
import { Networks } from '../../types';

export const getExplorerLinkByNetwork = (networkName: Networks) => {
  switch (networkName) {
    case Networks.TAIKO:
      return explorerLinks.taiko;
    case Networks.BSC:
      return explorerLinks.bsc;
    case Networks.OP_BNB:
      return explorerLinks.opBNB;
    case Networks.ETH:
      return explorerLinks.eth;
    case Networks.SEPOLIA:
      return explorerLinks.sepolia;

    case Networks.POLYGON:
      return explorerLinks.polygon;
    case Networks.ARBITRUM:
      return explorerLinks.arbitrum;
    case Networks.AVALANCHE:
      return explorerLinks.avalanche;
    case Networks.OPTIMISM:
      return explorerLinks.optimism;
    case Networks.BLAST:
      return explorerLinks.blast;

    case Networks.ZKSYNC:
      return explorerLinks.zkSync;
    case Networks.ZKFAIR:
      return explorerLinks.zkFair;
    case Networks.POLYGON_ZKEVM:
      return explorerLinks.polygon_zkevm;

    case Networks.BASE:
      return explorerLinks.base;
    case Networks.LINEA:
      return explorerLinks.linea;
    case Networks.SCROLL:
      return explorerLinks.scroll;
    case Networks.FANTOM:
      return explorerLinks.fantom;

    case Networks.CORE:
      return explorerLinks.core;
    case Networks.CELO:
      return explorerLinks.celo;
    case Networks.ZORA:
      return explorerLinks.zora;

    case Networks.GNOSIS:
      return explorerLinks.gnosis;
    case Networks.KLAY:
      return explorerLinks.klay;

    case Networks.APTOS:
      return explorerLinks.aptos;

    case Networks.STORY:
      return explorerLinks.story;

    default:
      throw new Error(`Explorer link for ${networkName} network was not found`);
  }
};

import { RPCsRecord } from '../types';

export const PUBLIC_RPCS: RPCsRecord = {
  eth: [
    // 'https://eth-mainnet.public.blastapi.io',
    // 'https://ethereum.publicnode.com',
    'https://rpc.ankr.com/eth',
  ],
  sepolia: [
    'https://eth-sepolia.public.blastapi.io',
    // 'https://ethereum-sepolia-rpc.publicnode.com',
    // 'https://1rpc.io/sepolia',
  ],

  arbitrum: [
    // 'https://arbitrum-one.public.blastapi.io',
    // 'https://arbitrum-one.publicnode.com',
    'https://arb1.arbitrum.io/rpc',
    // 'https://rpc.ankr.com/arbitrum',
  ],
  optimism: [
    // 'https://optimism-mainnet.public.blastapi.io',
    // 'https://optimism.publicnode.com',
    // 'https://mainnet.optimism.io',
    'https://rpc.ankr.com/optimism',
  ],
  base: [
    // 'https://base-mainnet.public.blastapi.io',
    // 'https://base.publicnode.com',
    'https://rpc.ankr.com/base',
  ],
  polygon: [
    // 'https://polygon-mainnet.public.blastapi.io',
    // 'https://polygon-rpc.com',
    'https://rpc.ankr.com/polygon',
  ],

  zkSync: ['https://zksync-era.blockpi.network/v1/rpc/public'],
  linea: [
    'https://rpc.linea.build',
    // 'https://linea-rpc.publicnode.com',
  ],

  bsc: [
    // 'https://bsc-mainnet.public.blastapi.io',
    // 'https://bsc.publicnode.com',
    'https://rpc.ankr.com/bsc',
  ],
  opBNB: [
    // 'https://opbnb.publicnode.com',
    'https://opbnb-mainnet-rpc.bnbchain.org',
  ],

  scroll: [
    // 'https://scroll-mainnet.public.blastapi.io',
    'https://rpc.scroll.io',
    // 'https://rpc.ankr.com/scroll',
  ],
  taiko: [
    'https://rpc.ankr.com/taiko',
    // 'https://rpc.taiko.xyz',
    // 'https://rpc.taiko.tools',
    // 'https://rpc.mainnet.taiko.xyz',
  ],
  zora: ['https://rpc.zora.energy'],
  blast: ['https://rpc.blastblockchain.com'],
  polygon_zkevm: [
    // 'https://polygon-zkevm-mainnet.public.blastapi.io',
    'https://rpc.ankr.com/polygon_zkevm',
  ],
  fantom: [
    // 'https://fantom.publicnode.com',
    'https://rpc.fantom.network',
    'https://rpc2.fantom.network',
    'https://rpc3.fantom.network',
    'https://rpc.ankr.com/fantom',
  ],
  klay: ['https://rpc.ankr.com/klaytn'],
  celo: ['https://rpc.ankr.com/celo'],
  core: ['https://rpc.ankr.com/core'],
  gnosis: ['https://gnosis-mainnet.public.blastapi.io', 'https://rpc.ankr.com/gnosis'],
  zkFair: ['https://rpc.zkfair.io'],
  story: [
    // 'https://evmrpc.story.nodestake.org',
    'https://mainnet.storyrpc.io',
    // 'https://story-mainnet-jsonrpc.blockhub.id',
  ],

  avalanche: [
    // 'https://ava-mainnet.public.blastapi.io/ext/bc/C/rpc',
    'https://rpc.ankr.com/avalanche',
  ],
  aptos: ['https://rpc.ankr.com/http/aptos/v1'],
  starknet: ['https://starknet-mainnet.public.blastapi.io'],
};

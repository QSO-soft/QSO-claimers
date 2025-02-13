import { getAddress } from 'viem';

import { defaultTokenAbi } from '../clients/abi';
import {
  ArbitrumTokens,
  AvalancheTokens,
  BaseTokens,
  BlastTokens,
  BnbTokens,
  EthTokens,
  EvmTokens,
  LineaTokens,
  OptimismTokens,
  PolygonTokens,
  ScrollTokens,
  TaikoTokens,
  TokenContract,
  ZkSyncTokens,
  ZoraTokens,
} from '../types';

export const NATIVE_TOKEN_CONTRACT = getAddress('0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE');
export const ZERO_TOKEN_CONTRACT = '0x0000000000000000000000000000000000000000';

export const EVM_TOKEN_CONTRACTS: TokenContract[] = [
  {
    name: EvmTokens.wstETH,
    address: getAddress('0xB5beDd42000b71FddE22D3eE8a79Bd49A568fC8F'),
    abi: defaultTokenAbi,
  },
  {
    name: EvmTokens.USDT,
    address: getAddress('0xA219439258ca9da29E9Cc4cE5596924745e12B93'),
    abi: defaultTokenAbi,
  },
  {
    name: EvmTokens.DAI,
    address: getAddress('0x4AF15ec2A0BD43Db75dd04E62FAA3B8EF36b00d5'),
    abi: defaultTokenAbi,
  },
  {
    name: EvmTokens.USDC,
    address: getAddress('0x176211869cA2b568f2A7D4EE941E073a821EE1ff'),
    abi: defaultTokenAbi,
  },
];
export const BNB_TOKEN_CONTRACTS: TokenContract[] = [
  {
    name: BnbTokens.BNB,
    address: NATIVE_TOKEN_CONTRACT,
    abi: defaultTokenAbi,
  },
  {
    name: BnbTokens.USDT,
    address: getAddress('0x55d398326f99059fF775485246999027B3197955'),
    abi: defaultTokenAbi,
  },
  {
    name: BnbTokens.USDC,
    address: getAddress('0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d'),
    abi: defaultTokenAbi,
  },
  {
    name: BnbTokens.DAI,
    address: getAddress('0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3'),
    abi: defaultTokenAbi,
  },
  {
    name: BnbTokens.AI,
    address: getAddress('0xBDA011D7F8EC00F66C1923B049B94c67d148d8b2'),
    abi: defaultTokenAbi,
  },
];
export const TAIKO_TOKEN_CONTRACTS: TokenContract[] = [
  {
    name: TaikoTokens.ETH,
    address: getAddress('0xA51894664A773981C6C112C43ce576f315d5b1B6'),
    abi: defaultTokenAbi,
  },
  {
    name: TaikoTokens.WETH,
    address: getAddress('0xA51894664A773981C6C112C43ce576f315d5b1B6'),
    abi: defaultTokenAbi,
  },
  {
    name: TaikoTokens.USDC,
    address: getAddress('0x07d83526730c7438048D55A4fc0b850e2aaB6f0b'),
    abi: defaultTokenAbi,
  },
  {
    name: TaikoTokens.USDT,
    address: getAddress('0x2DEF195713CF4a606B49D07E520e22C17899a736'),
    abi: defaultTokenAbi,
  },
  {
    name: TaikoTokens['USDC.e'],
    address: getAddress('0x19e26B0638bf63aa9fa4d14c6baF8D52eBE86C5C'),
    abi: defaultTokenAbi,
  },
  {
    name: TaikoTokens.TAIKO,
    address: getAddress('0xA9d23408b9bA935c230493c40C73824Df71A0975'),
    abi: defaultTokenAbi,
  },
];

export const AVALANCHE_TOKEN_CONTRACTS: TokenContract[] = [
  {
    name: AvalancheTokens.USDC,
    address: getAddress('0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E'),
    abi: defaultTokenAbi,
  },
  {
    name: AvalancheTokens.USDT,
    address: getAddress('0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7'),
    abi: defaultTokenAbi,
  },
  {
    name: AvalancheTokens.DAI,
    address: getAddress('0xd586E7F844cEa2F87f50152665BCbc2C279D8d70'),
    abi: defaultTokenAbi,
  },
];
export const ARBITRUM_TOKEN_CONTRACTS: TokenContract[] = [
  {
    name: ArbitrumTokens.ETH,
    address: getAddress('0x82aF49447D8a07e3bd95BD0d56f35241523fBab1'),
    abi: defaultTokenAbi,
  },
  {
    name: ArbitrumTokens.WETH,
    address: getAddress('0x82aF49447D8a07e3bd95BD0d56f35241523fBab1'),
    abi: defaultTokenAbi,
  },
  {
    name: ArbitrumTokens.USDC,
    address: getAddress('0xaf88d065e77c8cC2239327C5EDb3A432268e5831'),
    abi: defaultTokenAbi,
  },
  {
    name: ArbitrumTokens.USDT,
    address: getAddress('0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9'),
    abi: defaultTokenAbi,
  },
  {
    name: ArbitrumTokens.DAI,
    address: getAddress('0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1'),
    abi: defaultTokenAbi,
  },
];
export const ZORA_TOKEN_CONTRACTS: TokenContract[] = [
  {
    name: ZoraTokens.ETH,
    address: getAddress('0x4200000000000000000000000000000000000006'),
    abi: defaultTokenAbi,
  },
  {
    name: ZoraTokens.WETH,
    address: getAddress('0x4200000000000000000000000000000000000006'),
    abi: defaultTokenAbi,
  },
];
export const OPTIMISM_TOKEN_CONTRACTS: TokenContract[] = [
  {
    name: OptimismTokens.ETH,
    address: getAddress('0x4200000000000000000000000000000000000006'),
    abi: defaultTokenAbi,
  },
  {
    name: OptimismTokens.WETH,
    address: getAddress('0x4200000000000000000000000000000000000006'),
    abi: defaultTokenAbi,
  },
  {
    name: OptimismTokens.USDC,
    address: getAddress('0x7f5c764cbc14f9669b88837ca1490cca17c31607'),
    abi: defaultTokenAbi,
  },
  {
    name: OptimismTokens.USDT,
    address: getAddress('0x94b008aA00579c1307B0EF2c499aD98a8ce58e58'),
    abi: defaultTokenAbi,
  },
  {
    name: OptimismTokens.DAI,
    address: getAddress('0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1'),
    abi: defaultTokenAbi,
  },
];
export const POLYGON_TOKEN_CONTRACTS: TokenContract[] = [
  {
    name: PolygonTokens.MATIC,
    address: getAddress('0x0000000000000000000000000000000000001010'),
    abi: defaultTokenAbi,
  },
  {
    name: PolygonTokens.WETH,
    address: getAddress('0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619'),
    abi: defaultTokenAbi,
  },
  {
    name: PolygonTokens.USDC,
    address: getAddress('0x2791bca1f2de4661ed88a30c99a7a9449aa84174'),
    abi: defaultTokenAbi,
  },
  {
    name: PolygonTokens.USDT,
    address: getAddress('0xc2132D05D31c914a87C6611C10748AEb04B58e8F'),
    abi: defaultTokenAbi,
  },
  {
    name: PolygonTokens.DAI,
    address: getAddress('0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063'),
    abi: defaultTokenAbi,
  },
];
export const ZKSYNC_TOKEN_CONTRACTS: TokenContract[] = [
  {
    name: ZkSyncTokens.ETH,
    address: getAddress('0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91'),
    abi: defaultTokenAbi,
  },
  {
    name: ZkSyncTokens.WETH,
    address: getAddress('0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91'),
    abi: defaultTokenAbi,
  },
  {
    name: ZkSyncTokens.USDC,
    address: getAddress('0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4'),
    abi: defaultTokenAbi,
  },
  {
    name: ZkSyncTokens.USDT,
    address: getAddress('0x493257fD37EDB34451f62EDf8D2a0C418852bA4C'),
    abi: defaultTokenAbi,
  },
  {
    name: ZkSyncTokens.DAI,
    address: getAddress('0x4B9eb6c0b6ea15176BBF62841C6B2A8a398cb656'),
    abi: defaultTokenAbi,
  },
];
export const BASE_TOKEN_CONTRACTS: TokenContract[] = [
  {
    name: BaseTokens.ETH,
    address: getAddress('0x4200000000000000000000000000000000000006'),
    abi: defaultTokenAbi,
  },
  {
    name: BaseTokens.WETH,
    address: getAddress('0x4200000000000000000000000000000000000006'),
    abi: defaultTokenAbi,
  },
  {
    name: BaseTokens.USDC,
    address: getAddress('0x833589fcd6edb6e08f4c7c32d4f71b54bda02913'),
    abi: defaultTokenAbi,
  },
  {
    name: BaseTokens.USDT,
    address: getAddress('0x50c5725949a6f0c72e6c4a641f24049a917db0cb'),
    abi: defaultTokenAbi,
  },
];
export const ETH_TOKEN_CONTRACTS: TokenContract[] = [
  {
    name: EthTokens.ETH,
    address: getAddress('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'),
    abi: defaultTokenAbi,
  },
  {
    name: EthTokens.WETH,
    address: getAddress('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'),
    abi: defaultTokenAbi,
  },
  {
    name: EthTokens.USDC,
    address: getAddress('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'),
    abi: defaultTokenAbi,
  },
  {
    name: EthTokens.USDT,
    address: getAddress('0xdAC17F958D2ee523a2206206994597C13D831ec7'),
    abi: defaultTokenAbi,
  },
  {
    name: EthTokens.DAI,
    address: getAddress('0x6b175474e89094c44da98b954eedeac495271d0f'),
    abi: defaultTokenAbi,
  },
];
export const SEPOLIA_TOKEN_CONTRACTS: TokenContract[] = [];

export const LINEA_TOKEN_CONTRACTS: TokenContract[] = [
  {
    name: LineaTokens.ETH,
    address: getAddress('0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f'),
    abi: defaultTokenAbi,
  },
  {
    name: LineaTokens.WETH,
    address: getAddress('0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f'),
    abi: defaultTokenAbi,
  },
  {
    name: LineaTokens.USDC,
    address: getAddress('0x176211869cA2b568f2A7D4EE941E073a821EE1ff'),
    abi: defaultTokenAbi,
  },
  {
    name: LineaTokens.USDT,
    address: getAddress('0xA219439258ca9da29E9Cc4cE5596924745e12B93'),
    abi: defaultTokenAbi,
  },
  {
    name: LineaTokens.DAI,
    address: getAddress('0x4AF15ec2A0BD43Db75dd04E62FAA3B8EF36b00d5'),
    abi: defaultTokenAbi,
  },
];
export const BLAST_TOKEN_CONTRACTS: TokenContract[] = [
  {
    name: BlastTokens.ETH,
    address: getAddress('0x4300000000000000000000000000000000000004'),
    abi: defaultTokenAbi,
  },
  {
    name: BlastTokens.WETH,
    address: getAddress('0x4300000000000000000000000000000000000004'),
    abi: defaultTokenAbi,
  },
  {
    name: BlastTokens.USDB,
    address: getAddress('0x4300000000000000000000000000000000000003'),
    abi: defaultTokenAbi,
  },
];

export const SCROLL_TOKEN_CONTRACTS: TokenContract[] = [
  {
    name: ScrollTokens.ETH,
    address: getAddress('0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91'),
    abi: defaultTokenAbi,
  },
  {
    name: ScrollTokens.WETH,
    address: getAddress('0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91'),
    abi: defaultTokenAbi,
  },
  {
    name: ScrollTokens.USDC,
    address: getAddress('0x06eFdBFf2a14a7c8E15944D1F4A48F9F95F663A4'),
    abi: defaultTokenAbi,
  },
  {
    name: ScrollTokens.USDT,
    address: getAddress('0xf55BEC9cafDbE8730f096Aa55dad6D22d44099Df'),
    abi: defaultTokenAbi,
  },
  {
    name: ScrollTokens.DAI,
    address: getAddress('0xcA77eB3fEFe3725Dc33bccB54eDEFc3D9f764f97'),
    abi: defaultTokenAbi,
  },
];
export const STORY_TOKEN_CONTRACTS: TokenContract[] = [
  // {
  //   name: StoryTokens.IP,
  //   address: '0x',
  //   abi: defaultTokenAbi,
  // },
];

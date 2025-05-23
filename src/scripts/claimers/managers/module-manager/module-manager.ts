import { IModuleManager, ModuleManager as DefaultModuleManager } from '../../../../managers/module-manager';
import { ModuleNames } from '../../../../types';
import {
  execMakeCheckClaimPolyhedra,
  execMakeCheckClaimScroll,
  execMakeClaimLayerZero,
  execMakeClaimPolyhedra,
  execMakeClaimScroll,
  execMakeClaimTaiko,
  execMakeTransferClaimLayerZero,
  execMakeTransferClaimPolyhedra,
  execMakeTransferClaimScroll,
  execMakeTransferClaimTaiko,
  execMakeCheckClaimTaiko,
  execMakeCheckClaimLayerZero,
  execMakeSuperfrensClaimNFT,
  execMakeElixirWithdraw,
  execMakeSymbioticCheckPoints,
  execMakeClaimSwell,
  execMakeCheckClaimSwell,
  execMakeTransferClaimSwell,
  execMakeClaimOdos,
  execMakeCheckClaimOdos,
  execMakeTransferClaimOdos,
  execMakeDelegateRegistry,
  execMakeStoryClaim,
  execMakeHyperlaneAidropCheck,
  execMakeHyperlaneAidropClaim,
  execMakeHyperlaneAidropRegister,
  execMakeHyperlaneNexusBridge,
} from '../../modules';
import { execMakeClaimZora, execMakeTransferClaimZora } from '../../modules/zora';

export class ModuleManager extends DefaultModuleManager {
  constructor(args: IModuleManager) {
    super(args);
  }

  findModule(moduleName: ModuleNames) {
    switch (moduleName) {
      case 'polyhedra-claim':
        return execMakeClaimPolyhedra;
      case 'polyhedra-check-claim':
        return execMakeCheckClaimPolyhedra;
      case 'polyhedra-transfer-claim':
        return execMakeTransferClaimPolyhedra;

      case 'layer-zero-check-claim':
        return execMakeCheckClaimLayerZero;
      case 'layer-zero-claim':
        return execMakeClaimLayerZero;
      case 'layer-zero-transfer-claim':
        return execMakeTransferClaimLayerZero;

      case 'taiko-claim':
        return execMakeClaimTaiko;
      case 'taiko-check-claim':
        return execMakeCheckClaimTaiko;
      case 'taiko-transfer-claim':
        return execMakeTransferClaimTaiko;

      case 'scroll-claim':
        return execMakeClaimScroll;
      case 'scroll-check-claim':
        return execMakeCheckClaimScroll;
      case 'scroll-transfer-claim':
        return execMakeTransferClaimScroll;

      case 'superform-superfrens-claim-NFT':
        return execMakeSuperfrensClaimNFT;

      case 'elixir-withdraw-eth':
        return execMakeElixirWithdraw;

      case 'symbiotic-check-points':
        return execMakeSymbioticCheckPoints;

      case 'swell-claim':
        return execMakeClaimSwell;
      case 'swell-check-claim':
        return execMakeCheckClaimSwell;
      case 'swell-transfer-claim':
        return execMakeTransferClaimSwell;

      case 'odos-claim':
        return execMakeClaimOdos;
      case 'odos-check-claim':
        return execMakeCheckClaimOdos;
      case 'odos-transfer-claim':
        return execMakeTransferClaimOdos;

      case 'delegate-registry':
        return execMakeDelegateRegistry;

      case 'story-claim':
        return execMakeStoryClaim;

      case 'hyperlane-airdrop-check':
        return execMakeHyperlaneAidropCheck;
      case 'hyperlane-airdrop-register':
        return execMakeHyperlaneAidropRegister;
      case 'hyperlane-airdrop-claim':
        return execMakeHyperlaneAidropClaim;
      case 'hyperlane-nexus-bridge':
        return execMakeHyperlaneNexusBridge;

      case 'zora-claim':
        return execMakeClaimZora;
      case 'zora-transfer-claim':
        return execMakeTransferClaimZora;

      default:
        return;
    }
  }
}

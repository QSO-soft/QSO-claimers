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
} from '../../modules';

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

      default:
        return;
    }
  }
}

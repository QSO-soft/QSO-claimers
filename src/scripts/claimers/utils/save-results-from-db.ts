import uniqBy from 'lodash/uniqBy';
import { DataSource } from 'typeorm';

import { CHECKERS_FOLDER } from '../../../constants';
import { convertToCsvAndWrite, DataForCsv } from '../../../helpers';
import { WalletData, WalletWithModules } from '../../../types';
import {
  LayerZeroClaimEntity,
  PolyhedraClaimEntity,
  ScrollClaimEntity,
  SuperfrensNftClaimEntity,
  SymbioticPointsEntity,
  TaikoClaimEntity,
} from '../db/entities';

interface SaveResultsFromDb {
  projectName: string;
  dbSource: DataSource;
  walletsWithModules: WalletWithModules[];
}
export const saveResultsFromDb = async (props: SaveResultsFromDb) => {
  const { dbSource, projectName, walletsWithModules } = props;

  const wallets = walletsWithModules.reduce<WalletData[]>((acc, cur) => {
    const wallet = cur.wallet;

    const moduleWithUpdate = cur.modules.find(
      ({ moduleName }) =>
        moduleName === `${projectName}-check-claim` ||
        moduleName === `${projectName}-claim` ||
        moduleName === `${projectName}-transfer-claim`
    );
    if (moduleWithUpdate) {
      return [...acc, wallet];
    }

    return acc;
  }, []);

  let projectEntity;
  switch (projectName) {
    case 'layer-zero':
      projectEntity = LayerZeroClaimEntity;
      break;
    case 'taiko':
      projectEntity = TaikoClaimEntity;
      break;
    case 'scroll':
      projectEntity = ScrollClaimEntity;
      break;

    default:
      projectEntity = PolyhedraClaimEntity;
  }

  if (wallets.length) {
    const dbRepo = dbSource.getRepository(projectEntity);
    const dbData = await dbRepo.find({
      order: {
        walletId: 'ASC',
      },
      take: 10000,
    });

    const dataToSave = dbData.reduce<object[]>((acc, cur) => {
      const { walletId, index: walletIndex, id, ...data } = cur;
      const foundWallet = wallets.find(({ id, index }) => walletId === id && index === walletIndex);

      if (foundWallet) {
        return [
          ...acc,
          {
            id: walletId,
            ...data,
          },
        ];
      }
      return acc;
    }, []);

    const uniqueDataToSave = uniqBy(dataToSave, 'id');
    convertToCsvAndWrite({
      data: uniqueDataToSave as DataForCsv,
      fileName: `${projectName}-claim.csv`,
      outputPath: CHECKERS_FOLDER,
    });
  }

  await saveSuperfensResultsFromDb(props);
  await saveSymbioticPointsResultsFromDb(props);
};
export const saveSuperfensResultsFromDb = async ({ dbSource, walletsWithModules }: SaveResultsFromDb) => {
  const wallets = walletsWithModules.reduce<WalletData[]>((acc, cur) => {
    const wallet = cur.wallet;

    const moduleWithUpdate = cur.modules.find(({ moduleName }) => moduleName === 'superform-superfrens-claim-NFT');
    if (moduleWithUpdate) {
      return [...acc, wallet];
    }

    return acc;
  }, []);

  const projectEntity = SuperfrensNftClaimEntity;

  if (wallets.length) {
    const dbRepo = dbSource.getRepository(projectEntity);
    const dbData = await dbRepo.find({
      order: {
        walletId: 'ASC',
      },
      take: 10000,
    });

    const dataToSave = dbData.reduce<object[]>((acc, cur) => {
      const { walletId, index: walletIndex, id, ...data } = cur;
      const foundWallet = wallets.find(({ id, index }) => walletId === id && index === walletIndex);

      if (foundWallet) {
        return [
          ...acc,
          {
            id: walletId,
            ...data,
          },
        ];
      }
      return acc;
    }, []);

    const uniqueDataToSave = uniqBy(dataToSave, 'id');
    convertToCsvAndWrite({
      data: uniqueDataToSave as DataForCsv,
      fileName: 'superform-superfens-claim-nft.csv',
      outputPath: CHECKERS_FOLDER,
    });
  }
};
export const saveSymbioticPointsResultsFromDb = async ({ dbSource, walletsWithModules }: SaveResultsFromDb) => {
  const wallets = walletsWithModules.reduce<WalletData[]>((acc, cur) => {
    const wallet = cur.wallet;

    const moduleWithUpdate = cur.modules.find(({ moduleName }) => moduleName === 'symbiotic-check-points');
    if (moduleWithUpdate) {
      return [...acc, wallet];
    }

    return acc;
  }, []);

  const projectEntity = SymbioticPointsEntity;

  if (wallets.length) {
    const dbRepo = dbSource.getRepository(projectEntity);
    const dbData = await dbRepo.find({
      order: {
        walletId: 'ASC',
      },
      take: 10000,
    });

    const dataToSave = dbData.reduce<object[]>((acc, cur) => {
      const { walletId, index: walletIndex, id, ...data } = cur;
      const foundWallet = wallets.find(({ id, index }) => walletId === id && index === walletIndex);

      if (foundWallet) {
        return [
          ...acc,
          {
            id: walletId,
            ...data,
          },
        ];
      }
      return acc;
    }, []);

    const uniqueDataToSave = uniqBy(dataToSave, 'id');
    convertToCsvAndWrite({
      data: uniqueDataToSave as DataForCsv,
      fileName: 'symbiotic-points.csv',
      outputPath: CHECKERS_FOLDER,
    });
  }
};

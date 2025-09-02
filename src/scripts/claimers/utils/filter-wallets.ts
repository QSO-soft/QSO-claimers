import settings from '../../../_inputs/settings/settings';
import { FilterWallets } from '../../../helpers';
import { WalletData } from '../../../types';
import { PolyhedraClaimEntity } from '../db/entities';

export const filterWallets = async ({ dbSource, wallets, logger }: FilterWallets) => {
  const { status } = settings.filters;

  if (!status) {
    return wallets;
  }
  logger.info(`Filtering wallets by status=${status}`, {
    action: 'filterWallets',
  });

  const dbRepo = dbSource.getRepository(PolyhedraClaimEntity);

  const dbData = await dbRepo.find({
    where: {
      status,
    },
  });

  const res = dbData.reduce<WalletData[]>((acc, cur) => {
    const walletFromCsv = wallets.find(({ id, index }) => cur.walletId === id && cur.index === index);

    if (walletFromCsv) {
      return [...acc, walletFromCsv];
    }

    return acc;
  }, []);

  logger.success(`Got [${res.length}/${wallets.length}] filtered wallets`, {
    action: 'filterWallets',
  });

  return res;
};

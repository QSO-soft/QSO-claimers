import path, { dirname, sep } from 'path';
import { fileURLToPath } from 'url';

import { CHECKERS_FOLDER, INPUTS_CSV_FOLDER } from '../../../../constants';
import { convertAndWriteToJSON, convertToCsvAndWrite, initLocalLogger } from '../../../../helpers';
import { buildLocalFolderName } from '../../logger';

const _filename = fileURLToPath(import.meta.url);

const _dirname = dirname(_filename);

(async () => {
  const projectName = 'solayer';
  const logsFolderName = buildLocalFolderName(projectName);

  const logger = initLocalLogger(logsFolderName, 'main');
  logger.setLoggerMeta({ moduleName: 'Main' });

  logger.info('Checking you wallets...');

  const inputName = 'solayer-wallets.csv';
  const inputPath = `${INPUTS_CSV_FOLDER}${sep}${inputName}`;

  const wallets = (await convertAndWriteToJSON({
    inputPath,
    logger,
    withSaving: false,
  })) as { walletAddress: string }[];

  if (!wallets.length) {
    logger.error('Add any wallets to _inputs/csv/solayer-wallets.csv');
    return;
  }

  const eligibilityWallets = (await convertAndWriteToJSON({
    inputPath: path.resolve(_dirname, './solayer_wallets-with-alloc.csv'),
    logger,
    withSaving: false,
  })) as { solanaAddress: string; allocation: number }[];

  const foundWallets = [];
  for (const wallet of wallets) {
    const foundWallet = eligibilityWallets.find(
      ({ solanaAddress }) => solanaAddress.toLowerCase() === wallet.walletAddress.toLowerCase()
    );

    if (foundWallet) {
      foundWallets.push({
        walletAddress: wallet.walletAddress,
        allocation: foundWallet.allocation,
      });
    }
  }

  if (foundWallets.length) {
    logger.success(`Found [${foundWallets.length}/${wallets.length}] eligible wallets`);
  } else {
    logger.warning('Not found any eligible wallets');
  }

  convertToCsvAndWrite({
    data: foundWallets,
    fileName: 'solayer-eligibility.csv',
    outputPath: CHECKERS_FOLDER,
  });

  logger.success('Eligible wallets saved to _outputs/csv/checkers/solayer-eligibility.csv');

  return;
})();

import * as fs from 'fs';
import path from 'path';

export const PLAYWRIGHT_PROFILES_PATH = path.resolve('profiles-playwright');

export function cleanOldPlaywrightProfiles(walletAddress?: string): void {
  try {
    //  * Check if the folder exists
    if (!fs.existsSync(PLAYWRIGHT_PROFILES_PATH)) return;

    const folderNames = fs.readdirSync(PLAYWRIGHT_PROFILES_PATH);

    for (const folderName of folderNames) {
      const itemPath = path.join(PLAYWRIGHT_PROFILES_PATH, folderName);

      if (!walletAddress || folderName.includes(walletAddress)) {
        fs.rmSync(itemPath, { recursive: true, force: true });
      }
    }
  } catch (error) {
    /* EMPTY */
  }
}

export function getPlaywrightProfilePath(walletAddress: string): string {
  return path.resolve(PLAYWRIGHT_PROFILES_PATH, `profile-${walletAddress}`);
}

import axios from 'axios';
import { Hex } from 'viem';

import { CLAIM_STATUSES } from '../../../../../constants';
import { BaseAxiosConfig } from '../../../../../types';
import { CLAIM_API_URL } from './constants';

interface GetClaimData {
  walletAddress: Hex;
  tournamentID: number;
  config?: BaseAxiosConfig;
}
export const getClaimData = async ({ walletAddress, tournamentID, config }: GetClaimData) => {
  const { data } = await axios.post(
    `${CLAIM_API_URL}/proxy/superrewards/start/claim`,
    { user: walletAddress, tournamentID },
    config
  );

  return data;
};
export const getClaimDataStatuses = async ({ walletAddress, tournamentID, config }: GetClaimData) => {
  const { data } = await axios.get(
    `${CLAIM_API_URL}/proxy/superrewards/rewards/${tournamentID}/${walletAddress}`,
    config
  );

  const claimed = [];
  const notClaimed = [];
  const statuses = data.map(({ status }: { status: string }) => status);

  for (const status of statuses) {
    if (status === 'non-claimable') {
      continue;
    }

    if (status === 'claimed') {
      claimed.push(status);
      continue;
    }

    notClaimed.push(status);
  }

  if (notClaimed.length) {
    return CLAIM_STATUSES.NOT_CLAIMED;
  }

  if (claimed.length) {
    return CLAIM_STATUSES.ALREADY_CLAIMED;
  }

  return CLAIM_STATUSES.NOT_ELIGIBLE;
};

export const getIdData = async (config?: BaseAxiosConfig) => {
  await axios.get(`${CLAIM_API_URL}/ip/ofac`, config);
};
export const checkTournamentAvailabilityData = async (tournamentId: number, config?: BaseAxiosConfig) => {
  const { data } = await axios.get(`${CLAIM_API_URL}/proxy/superrewards/tournaments`, config);

  const foundTournament = data.find(({ id }: any) => id === tournamentId);

  if (!foundTournament) {
    throw new Error(`Could not find tournament with id ${tournamentId}`);
  }

  if (foundTournament.state === 'live') {
    throw new Error(`Tournament with id ${tournamentId} is not finished yet`);
  }
};

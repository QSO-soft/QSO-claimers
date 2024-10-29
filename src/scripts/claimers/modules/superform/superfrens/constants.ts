export const CLAIM_API_URL = 'https://www.superform.xyz/api';
export const CURRENT_TOURNAMENT_ID = 5;

export const getApiHeaders = (tournamentId: number) => ({
  accept: 'application/json, text/plain, */*',
  'cache-control': 'public, s-maxage=1200, stale-while-revalidate=600',
  'content-type': 'application/json',
  'response-content-type': 'application/json',
  priority: 'u=1, i',
  'sec-fetch-dest': 'empty',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'same-origin',
  Referer: `https://www.superform.xyz/earn/superfrens/?tournamentId=${tournamentId}&seasonId=1`,
});

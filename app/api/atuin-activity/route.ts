import {isDailyActivity} from '../../lib/dailyActivity';
import {cachedJsonResponse} from '../../lib/serverCache';

const ATUIN_API_URL =
  'https://apis.evanpurkhiser.com/atuin-abacus/history?period=1y&rollup=1d';

async function fetchAtuinActivity() {
  const response = await fetch(ATUIN_API_URL, {
    headers: {Prefer: 'timezone=America/New_York'},
  });

  if (!response.ok) {
    throw new Error(`Atuin Abacus returned ${response.status}`);
  }

  const data: unknown = await response.json();

  if (!isDailyActivity(data)) {
    throw new Error('Atuin Abacus returned an invalid response');
  }

  return data;
}

export async function GET(request: Request) {
  try {
    return await cachedJsonResponse(request, fetchAtuinActivity);
  } catch (error) {
    console.error('Failed to load Atuin activity', error);

    return Response.json(
      {error: 'Failed to load Atuin activity'},
      {status: 502, headers: {'Cache-Control': 'no-store'}},
    );
  }
}

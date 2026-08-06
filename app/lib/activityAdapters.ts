import type {TimeRasterDatum} from '../components/TimeRasterGraph';

const ATUIN_URL =
  'https://apis.evanpurkhiser.com/atuin-abacus/history?period=1y&rollup=1d';
const GITHUB_URL = '/api/github-contributions';
const DAY = 24 * 60 * 60 * 1000;

export type DailyActivity = {
  date: string;
  count: number;
};

function isDailyActivity(value: unknown): value is DailyActivity[] {
  return (
    Array.isArray(value) &&
    value.every(
      item =>
        typeof item === 'object' &&
        item !== null &&
        typeof item.date === 'string' &&
        typeof item.count === 'number',
    )
  );
}

async function fetchDailyActivity(
  source: string,
  url: string,
  signal: AbortSignal,
  headers?: HeadersInit,
) {
  const response = await fetch(url, {headers, signal});

  if (!response.ok) {
    throw new Error(`${source} returned ${response.status}`);
  }

  const data: unknown = await response.json();

  if (!isDailyActivity(data)) {
    throw new Error(`${source} returned an invalid response`);
  }

  return data;
}

export function loadAtuinActivity(signal: AbortSignal) {
  return fetchDailyActivity('Atuin Abacus', ATUIN_URL, signal, {
    Prefer: 'timezone=America/New_York',
  });
}

export function loadGitHubActivity(signal: AbortSignal) {
  return fetchDailyActivity('GitHub contributions', GITHUB_URL, signal);
}

export function dailyActivityToTimeRaster(activity: DailyActivity[]) {
  return activity.map<TimeRasterDatum>(({date, count}) => {
    const start = Date.parse(`${date}T00:00:00Z`);

    return {start, end: start + DAY, value: count};
  });
}

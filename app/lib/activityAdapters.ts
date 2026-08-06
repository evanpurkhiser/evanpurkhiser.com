import type {TimeRasterDatum} from '../components/TimeRasterGraph';

import {type DailyActivity, isDailyActivity} from './dailyActivity';

const ATUIN_URL = '/api/atuin-activity';
const GITHUB_URL = '/api/github-contributions';
const DAY = 24 * 60 * 60 * 1000;

async function fetchDailyActivity(source: string, url: string, signal: AbortSignal) {
  const response = await fetch(url, {signal});

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
  return fetchDailyActivity('Atuin Abacus', ATUIN_URL, signal);
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

import type {TimeRasterDatum} from '../components/TimeRasterGraph';

import {api} from './api';
import {type DailyActivity, isDailyActivity} from './dailyActivity';

const DAY = 24 * 60 * 60 * 1000;

async function fetchDailyActivity(source: string, path: string, signal: AbortSignal) {
  const data = await api.get(path, {signal}).json<unknown>();

  if (!isDailyActivity(data)) {
    throw new Error(`${source} returned an invalid response`);
  }

  return data;
}

export function loadAtuinActivity({signal}: {signal: AbortSignal}) {
  return fetchDailyActivity('Atuin Abacus', 'atuin-activity', signal);
}

export function loadGitHubActivity({signal}: {signal: AbortSignal}) {
  return fetchDailyActivity('GitHub contributions', 'github-contributions', signal);
}

export function dailyActivityToTimeRaster(activity: DailyActivity[]) {
  return activity.map<TimeRasterDatum>(({date, count}) => {
    const start = Date.parse(`${date}T00:00:00Z`);

    return {start, end: start + DAY, value: count};
  });
}

import {queryOptions} from '@tanstack/react-query';

import {api} from './api';
import type {RecentlyListenedTrack} from './soundcloud/types';

const REFRESH_INTERVAL_MILLISECONDS = 15 * 60 * 1000;

export const recentlyListenedQueryOptions = queryOptions({
  queryKey: ['recently-listened'],
  queryFn: ({signal}) =>
    api.get('recently-listened', {signal}).json<RecentlyListenedTrack[]>(),
  refetchInterval: REFRESH_INTERVAL_MILLISECONDS,
  staleTime: REFRESH_INTERVAL_MILLISECONDS,
});

import 'server-only';

import {getCloudflareContext} from '@opennextjs/cloudflare';

import {loadRecentlyListenedSnapshot} from './soundcloud/recentlyListenedService';
import type {RecentlyListenedTrack} from './soundcloud/types';

export type {RecentlyListenedTrack} from './soundcloud/types';

export async function loadRecentlyListened(): Promise<RecentlyListenedTrack[]> {
  const {env} = await getCloudflareContext({async: true});

  return loadRecentlyListenedSnapshot(env);
}

import {z} from 'zod';

import type {RecentlyListenedTrack} from './types';

const SNAPSHOT_KEY = 'soundcloud-recently-listened:v1';

const recentlyListenedTrackSchema = z.object({
  played_at: z.number(),
  permalink_url: z.string().min(1),
  artwork_url: z.string().min(1).nullable(),
  genre: z.string().min(1).nullable(),
  artist: z.string().min(1),
  title: z.string().min(1),
});
const snapshotSchema = z.object({
  tracks: z.array(recentlyListenedTrackSchema),
  updatedAt: z.number(),
});

export async function readRecentlyListenedSnapshot(
  kv: CloudflareEnv['SOUNDCLOUD_TITLE_CACHE'],
): Promise<RecentlyListenedTrack[] | null> {
  const snapshot = snapshotSchema.safeParse(await kv.get(SNAPSHOT_KEY, 'json'));

  return snapshot.success ? snapshot.data.tracks : null;
}

export function writeRecentlyListenedSnapshot(
  kv: CloudflareEnv['SOUNDCLOUD_TITLE_CACHE'],
  tracks: RecentlyListenedTrack[],
) {
  return kv.put(
    SNAPSHOT_KEY,
    JSON.stringify({
      tracks,
      updatedAt: Date.now(),
    }),
  );
}

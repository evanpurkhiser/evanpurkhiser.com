import {z} from 'zod';

import type {SoundCloudTrackMetadata} from './trackMetadata';
import type {SoundCloudTrackMetadataCache} from './trackMetadataCache';

const CACHE_VERSION = 'v7';

const cachedMetadataSchema = z.object({
  artist: z.string().min(1),
  title: z.string().min(1),
  rawArtist: z.string(),
  rawTitle: z.string(),
});

function cacheKey(track: SoundCloudTrackMetadata) {
  return `soundcloud-title:${CACHE_VERSION}:${track.id}`;
}

export function createCloudflareTrackMetadataCache(
  kv: CloudflareEnv['SOUNDCLOUD_TITLE_CACHE'],
): SoundCloudTrackMetadataCache {
  return {
    async read(track) {
      const cached = cachedMetadataSchema.safeParse(
        await kv.get(cacheKey(track), 'json'),
      );

      if (
        !cached.success ||
        cached.data.rawArtist !== track.artist ||
        cached.data.rawTitle !== track.title
      ) {
        return null;
      }

      return {artist: cached.data.artist, title: cached.data.title};
    },

    write(rawTrack, cleaned) {
      return kv.put(
        cacheKey(rawTrack),
        JSON.stringify({
          ...cleaned,
          rawArtist: rawTrack.artist,
          rawTitle: rawTrack.title,
        }),
      );
    },
  };
}

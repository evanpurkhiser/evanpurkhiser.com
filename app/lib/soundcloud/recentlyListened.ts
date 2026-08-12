import {z} from 'zod';

import {
  cleanSoundCloudTrackMetadata,
  type CleanedSoundCloudTrackMetadata,
} from './trackMetadata';
import type {SoundCloudTrackMetadataCache} from './trackMetadataCache';
import type {SoundCloudHistoryTrack} from './types';

const HISTORY_URL = 'https://api-v2.soundcloud.com/me/play-history/tracks';
const WEB_CLIENT_ID = 'pJ6Fj6roW2KRzWAOwGj6kkQ8VRBJjyBD';
const TRACK_LIMIT = 5;
const REQUEST_TIMEOUT_MILLISECONDS = 10_000;

class InvalidSoundCloudResponseError extends Error {}
class SoundCloudApiError extends Error {}

export class SoundCloudAuthenticationError extends Error {}

const optionalString = z
  .string()
  .nullish()
  .transform(value => value || null);
const historyResponseSchema = z.object({
  collection: z.array(
    z.object({
      played_at: z.number(),
      track: z.object({
        id: z.number().int(),
        permalink_url: z.string().min(1),
        artwork_url: optionalString,
        genre: optionalString,
        title: z.string().min(1),
        publisher_metadata: z.object({artist: optionalString}).nullish(),
        metadata_artist: optionalString,
        user: z.object({username: optionalString}).nullish(),
      }),
    }),
  ),
});

type SoundCloudHistoryEntry = z.infer<typeof historyResponseSchema>['collection'][number];

type RecentlyListenedOptions = {
  accessToken: string;
  metadataCache: SoundCloudTrackMetadataCache;
  openAiApiKey: string;
};

function getArtist(track: SoundCloudHistoryEntry['track']) {
  return (
    track.publisher_metadata?.artist ??
    track.metadata_artist ??
    track.user?.username ??
    null
  );
}

function normalizeHistoryEntry(value: SoundCloudHistoryEntry): SoundCloudHistoryTrack {
  const artist = getArtist(value.track);

  if (!artist) {
    throw new InvalidSoundCloudResponseError();
  }

  return {
    id: value.track.id.toString(),
    played_at: value.played_at,
    permalink_url: value.track.permalink_url,
    artwork_url: value.track.artwork_url ?? null,
    genre: value.track.genre ?? null,
    artist,
    title: value.track.title,
  };
}

function normalizeHistory(value: unknown): SoundCloudHistoryTrack[] {
  const parsed = historyResponseSchema.safeParse(value);

  if (!parsed.success) {
    throw new InvalidSoundCloudResponseError('Invalid SoundCloud history response', {
      cause: parsed.error,
    });
  }

  return parsed.data.collection.slice(0, TRACK_LIMIT).map(normalizeHistoryEntry);
}

async function fetchRecentlyListened(accessToken: string) {
  const url = new URL(HISTORY_URL);
  url.searchParams.set('app_locale', 'en');
  url.searchParams.set('client_id', WEB_CLIENT_ID);
  url.searchParams.set('limit', TRACK_LIMIT.toString());

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      Authorization: `OAuth ${accessToken}`,
    },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MILLISECONDS),
  });

  if (response.status === 401 || response.status === 403) {
    throw new SoundCloudAuthenticationError();
  }

  if (!response.ok) {
    throw new SoundCloudApiError(`SoundCloud returned ${response.status}`);
  }

  return normalizeHistory(await response.json());
}

async function readCachedMetadata(
  cache: SoundCloudTrackMetadataCache,
  tracks: SoundCloudHistoryTrack[],
) {
  const entries = await Promise.all(
    tracks.map(async track => {
      try {
        return [track.id, await cache.read(track)] as const;
      } catch (error) {
        console.error('Failed to read cleaned SoundCloud metadata from cache', error);

        return [track.id, null] as const;
      }
    }),
  );

  return new Map(
    entries.filter(
      (entry): entry is readonly [string, CleanedSoundCloudTrackMetadata] =>
        entry[1] !== null,
    ),
  );
}

async function cacheGeneratedMetadata(
  cache: SoundCloudTrackMetadataCache,
  tracks: SoundCloudHistoryTrack[],
  generated: Map<string, CleanedSoundCloudTrackMetadata>,
) {
  await Promise.all(
    tracks.map(async track => {
      const cleaned = generated.get(track.id);

      if (!cleaned) {
        return;
      }

      try {
        await cache.write(track, cleaned);
      } catch (error) {
        console.error('Failed to cache cleaned SoundCloud metadata', error);
      }
    }),
  );
}

async function generateMissingMetadata(
  apiKey: string,
  cache: SoundCloudTrackMetadataCache,
  tracks: SoundCloudHistoryTrack[],
) {
  if (tracks.length === 0) {
    return new Map<string, CleanedSoundCloudTrackMetadata>();
  }

  try {
    const generated = await cleanSoundCloudTrackMetadata(apiKey, tracks);

    await cacheGeneratedMetadata(cache, tracks, generated);

    return generated;
  } catch (error) {
    console.error('Failed to clean SoundCloud metadata with OpenAI', error);

    return new Map<string, CleanedSoundCloudTrackMetadata>();
  }
}

async function cleanRecentlyListened(
  apiKey: string,
  cache: SoundCloudTrackMetadataCache,
  tracks: SoundCloudHistoryTrack[],
) {
  const cached = await readCachedMetadata(cache, tracks);
  const misses = tracks.filter(track => !cached.has(track.id));
  const generated = await generateMissingMetadata(apiKey, cache, misses);

  return tracks.map(({id, ...track}) => {
    const metadata = cached.get(id) ?? generated.get(id);

    return {...track, ...metadata};
  });
}

export async function getSoundCloudRecentlyListened({
  accessToken,
  metadataCache,
  openAiApiKey,
}: RecentlyListenedOptions) {
  const tracks = await fetchRecentlyListened(accessToken);

  return cleanRecentlyListened(openAiApiKey, metadataCache, tracks);
}

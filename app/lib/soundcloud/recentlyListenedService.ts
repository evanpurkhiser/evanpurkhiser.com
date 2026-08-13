import {createCloudflareTrackMetadataCache} from './cloudflareTrackMetadataCache';
import {getSoundCloudRecentlyListened} from './recentlyListened';
import {
  readRecentlyListenedSnapshot,
  writeRecentlyListenedSnapshot,
} from './recentlyListenedSnapshot';

export class MissingSoundCloudTokenError extends Error {}

export async function refreshRecentlyListened(env: CloudflareEnv) {
  const accessToken = env.SC_WEB_ACCESS_TOKEN.trim();

  if (!accessToken) {
    throw new MissingSoundCloudTokenError();
  }

  const tracks = await getSoundCloudRecentlyListened({
    accessToken,
    metadataCache: createCloudflareTrackMetadataCache(env.SOUNDCLOUD_TITLE_CACHE),
    openAiApiKey: env.OPENAI_API_KEY,
  });

  await writeRecentlyListenedSnapshot(env.SOUNDCLOUD_TITLE_CACHE, tracks);

  return tracks;
}

export async function loadRecentlyListenedSnapshot(env: CloudflareEnv) {
  try {
    const tracks = await readRecentlyListenedSnapshot(env.SOUNDCLOUD_TITLE_CACHE);

    if (tracks) {
      return tracks;
    }
  } catch (error) {
    console.error('Failed to read recently listened snapshot', error);
  }

  return refreshRecentlyListened(env);
}

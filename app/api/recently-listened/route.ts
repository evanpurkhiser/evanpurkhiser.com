import {getCloudflareContext} from '@opennextjs/cloudflare';

import {cachedJsonResponse} from '../../lib/serverCache';
import {createCloudflareTrackMetadataCache} from '../../lib/soundcloud/cloudflareTrackMetadataCache';
import {
  getSoundCloudRecentlyListened,
  SoundCloudAuthenticationError,
} from '../../lib/soundcloud/recentlyListened';

class MissingSoundCloudTokenError extends Error {}

export async function GET(request: Request) {
  try {
    return await cachedJsonResponse(
      request,
      async () => {
        const {env} = await getCloudflareContext({async: true});
        const token = env.SC_WEB_ACCESS_TOKEN.trim();

        if (!token) {
          throw new MissingSoundCloudTokenError();
        }

        return getSoundCloudRecentlyListened({
          accessToken: token,
          metadataCache: createCloudflareTrackMetadataCache(env.SOUNDCLOUD_TITLE_CACHE),
          openAiApiKey: env.OPENAI_API_KEY,
        });
      },
      {freshTtlSeconds: 60, staleTtlSeconds: 24 * 60 * 60},
    );
  } catch (error) {
    if (error instanceof MissingSoundCloudTokenError) {
      return Response.json(
        {error: 'SoundCloud token is not configured'},
        {status: 503, headers: {'Cache-Control': 'no-store'}},
      );
    }

    if (error instanceof SoundCloudAuthenticationError) {
      return Response.json(
        {error: 'SoundCloud token is invalid or expired'},
        {status: 502, headers: {'Cache-Control': 'no-store'}},
      );
    }

    console.error('Failed to load recently listened tracks', error);

    return Response.json(
      {error: 'Failed to load recently listened tracks'},
      {status: 502, headers: {'Cache-Control': 'no-store'}},
    );
  }
}

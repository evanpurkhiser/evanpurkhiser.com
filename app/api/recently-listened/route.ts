import {getCloudflareContext} from '@opennextjs/cloudflare';

import {cachedJsonResponse} from '../../lib/serverCache';
import {SoundCloudAuthenticationError} from '../../lib/soundcloud/recentlyListened';
import {
  loadRecentlyListenedSnapshot,
  MissingSoundCloudTokenError,
} from '../../lib/soundcloud/recentlyListenedService';

export async function GET(request: Request) {
  try {
    return await cachedJsonResponse(
      request,
      async () => {
        const {env} = await getCloudflareContext({async: true});

        return loadRecentlyListenedSnapshot(env);
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

import 'server-only';

import {headers} from 'next/headers';

import type {RecentlyListenedTrack} from './soundcloud/types';

export type {RecentlyListenedTrack} from './soundcloud/types';

function firstForwardedValue(value: string | null) {
  return value?.split(',', 1)[0]?.trim() || null;
}

export async function loadRecentlyListened(
  signal?: AbortSignal,
): Promise<RecentlyListenedTrack[]> {
  const requestHeaders = await headers();
  const host =
    firstForwardedValue(requestHeaders.get('x-forwarded-host')) ??
    requestHeaders.get('host');

  if (!host) {
    throw new Error('Unable to determine the request host');
  }

  const protocol =
    firstForwardedValue(requestHeaders.get('x-forwarded-proto')) ?? 'https';
  const url = new URL('/api/recently-listened', `${protocol}://${host}`);
  const response = await fetch(url, {cache: 'no-store', signal});

  if (!response.ok) {
    throw new Error(`Recently listened API returned ${response.status}`);
  }

  return response.json();
}

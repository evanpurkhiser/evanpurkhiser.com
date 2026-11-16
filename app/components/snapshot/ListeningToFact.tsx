import {dehydrate, HydrationBoundary} from '@tanstack/react-query';
import {unstable_rethrow} from 'next/navigation';
import {connection} from 'next/server';

import getQueryClient from '../../lib/queryClient';
import {loadRecentlyListened} from '../../lib/recentlyListened';
import {recentlyListenedQueryOptions} from '../../lib/recentlyListenedQuery';

import ListeningToFactContent from './ListeningToFactContent';

export default async function ListeningToFact() {
  await connection();

  const queryClient = getQueryClient();
  const now = Date.now();

  try {
    await queryClient.fetchQuery({
      ...recentlyListenedQueryOptions,
      queryFn: loadRecentlyListened,
    });
  } catch (error) {
    unstable_rethrow(error);
    console.error('Failed to load recently listened tracks', error);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ListeningToFactContent initialTime={now} />
    </HydrationBoundary>
  );
}

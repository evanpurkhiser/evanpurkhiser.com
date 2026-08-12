import {environmentManager, QueryClient} from '@tanstack/react-query';

const DEFAULT_STALE_TIME_MILLISECONDS = 5 * 60 * 1000;

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        staleTime: DEFAULT_STALE_TIME_MILLISECONDS,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

export default function getQueryClient() {
  if (environmentManager.isServer()) {
    return createQueryClient();
  }

  browserQueryClient ??= createQueryClient();

  return browserQueryClient;
}

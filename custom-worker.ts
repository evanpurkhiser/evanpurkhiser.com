// @ts-expect-error The OpenNext worker is generated after Next.js type checking.
import handler from './.open-next/worker.js';
import {refreshRecentlyListened} from './app/lib/soundcloud/recentlyListenedService';

export default {
  fetch: handler.fetch,

  async scheduled(_controller: unknown, env: CloudflareEnv) {
    await refreshRecentlyListened(env);
  },
};

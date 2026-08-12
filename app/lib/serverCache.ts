import {after} from 'next/server';

const DEFAULT_FRESH_TTL_SECONDS = 60 * 60;
const DEFAULT_STALE_TTL_SECONDS = 7 * 24 * 60 * 60;
const CACHE_STORED_AT_HEADER = 'X-Cache-Stored-At';

type CacheStatus = 'HIT' | 'MISS' | 'STALE';

type CacheOptions = {
  freshTtlSeconds?: number;
  staleTtlSeconds?: number;
};

type CachePolicy = {
  freshTtlMilliseconds: number;
  publicCacheControl: string;
  retentionTtlMilliseconds: number;
  storageCacheControl: string;
};

type DefaultCacheStorage = CacheStorage & {
  default: Cache;
};

type MemoryCacheEntry = {
  freshUntil: number;
  retainedUntil: number;
  response: Response;
};

const memoryCache = new Map<string, MemoryCacheEntry>();
const pendingResponses = new Map<string, Promise<Response>>();

function createCachePolicy(options: CacheOptions): CachePolicy {
  const freshTtlSeconds = options.freshTtlSeconds ?? DEFAULT_FRESH_TTL_SECONDS;
  const staleTtlSeconds = options.staleTtlSeconds ?? DEFAULT_STALE_TTL_SECONDS;
  const retentionTtlSeconds = freshTtlSeconds + staleTtlSeconds;

  return {
    freshTtlMilliseconds: freshTtlSeconds * 1000,
    publicCacheControl: `public, max-age=${freshTtlSeconds}, stale-while-revalidate=${staleTtlSeconds}`,
    retentionTtlMilliseconds: retentionTtlSeconds * 1000,
    // The Workers Cache API ignores stale-while-revalidate, so its copy stays
    // alive for the entire stale window while freshness is tracked separately.
    storageCacheControl: `public, max-age=${retentionTtlSeconds}`,
  };
}

function getDefaultCache() {
  const cacheStorage = (globalThis as typeof globalThis & {caches?: DefaultCacheStorage})
    .caches;

  return cacheStorage?.default;
}

function responseForClient(response: Response, status: CacheStatus, policy: CachePolicy) {
  const headers = new Headers(response.headers);
  headers.delete(CACHE_STORED_AT_HEADER);
  headers.set('Cache-Control', policy.publicCacheControl);
  headers.set('X-Cache', status);

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function scheduleBackgroundTask(task: () => Promise<unknown>) {
  try {
    after(task);
  } catch {
    void task();
  }
}

function createStoredResponse<T>(data: T, storedAt: number, policy: CachePolicy) {
  return Response.json(data, {
    headers: {
      'Cache-Control': policy.storageCacheControl,
      [CACHE_STORED_AT_HEADER]: storedAt.toString(),
    },
  });
}

function storeResponse(
  cache: Cache | null,
  cacheKey: Request,
  response: Response,
  storedAt: number,
  policy: CachePolicy,
) {
  if (cache) {
    scheduleBackgroundTask(() =>
      cache
        .put(cacheKey, response.clone())
        .catch(error => console.error('Failed to write to the Cloudflare cache', error)),
    );
    return;
  }

  memoryCache.set(cacheKey.url, {
    freshUntil: storedAt + policy.freshTtlMilliseconds,
    retainedUntil: storedAt + policy.retentionTtlMilliseconds,
    response: response.clone(),
  });
}

function loadAndStoreResponse<T>(
  cache: Cache | null,
  cacheKey: Request,
  load: () => Promise<T>,
  policy: CachePolicy,
) {
  const pendingRequest = load()
    .then(data => {
      const storedAt = Date.now();
      const response = createStoredResponse(data, storedAt, policy);
      storeResponse(cache, cacheKey, response, storedAt, policy);
      return response;
    })
    .finally(() => pendingResponses.delete(cacheKey.url));

  pendingResponses.set(cacheKey.url, pendingRequest);
  return pendingRequest;
}

function refreshInBackground<T>(
  cache: Cache | null,
  cacheKey: Request,
  load: () => Promise<T>,
  policy: CachePolicy,
) {
  scheduleBackgroundTask(async () => {
    const pendingRequest =
      pendingResponses.get(cacheKey.url) ??
      loadAndStoreResponse(cache, cacheKey, load, policy);

    try {
      await pendingRequest;
    } catch (error) {
      console.error(`Failed to refresh cached response for ${cacheKey.url}`, error);
    }
  });
}

async function readCloudflareCache(cache: Cache, cacheKey: Request) {
  try {
    return await cache.match(cacheKey);
  } catch (error) {
    console.error('Failed to read from the Cloudflare cache', error);
  }
}

function isFresh(response: Response, policy: CachePolicy) {
  const storedAt = Number(response.headers.get(CACHE_STORED_AT_HEADER));
  return Number.isFinite(storedAt) && storedAt + policy.freshTtlMilliseconds > Date.now();
}

export async function cachedJsonResponse<T>(
  request: Request,
  load: () => Promise<T>,
  options: CacheOptions = {},
) {
  const cacheKey = new Request(request.url, {method: 'GET'});
  const cloudflareCache = getDefaultCache() ?? null;
  const policy = createCachePolicy(options);

  if (cloudflareCache) {
    const cachedResponse = await readCloudflareCache(cloudflareCache, cacheKey);

    if (cachedResponse && isFresh(cachedResponse, policy)) {
      return responseForClient(cachedResponse, 'HIT', policy);
    }

    if (cachedResponse) {
      refreshInBackground(cloudflareCache, cacheKey, load, policy);
      return responseForClient(cachedResponse, 'STALE', policy);
    }
  } else {
    const cachedEntry = memoryCache.get(cacheKey.url);
    const now = Date.now();

    if (cachedEntry && cachedEntry.freshUntil > now) {
      return responseForClient(cachedEntry.response.clone(), 'HIT', policy);
    }

    if (cachedEntry && cachedEntry.retainedUntil > now) {
      refreshInBackground(cloudflareCache, cacheKey, load, policy);
      return responseForClient(cachedEntry.response.clone(), 'STALE', policy);
    }

    memoryCache.delete(cacheKey.url);
  }

  const existingRequest = pendingResponses.get(cacheKey.url);

  if (existingRequest) {
    return responseForClient((await existingRequest).clone(), 'HIT', policy);
  }

  const response = await loadAndStoreResponse(cloudflareCache, cacheKey, load, policy);
  return responseForClient(response.clone(), 'MISS', policy);
}

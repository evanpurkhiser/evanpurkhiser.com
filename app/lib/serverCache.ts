import {after} from 'next/server';

const FRESH_TTL_SECONDS = 60 * 60;
const STALE_TTL_SECONDS = 7 * 24 * 60 * 60;
const CACHE_RETENTION_SECONDS = FRESH_TTL_SECONDS + STALE_TTL_SECONDS;
const FRESH_TTL_MILLISECONDS = FRESH_TTL_SECONDS * 1000;
const CACHE_RETENTION_MILLISECONDS = CACHE_RETENTION_SECONDS * 1000;
const CACHE_STORED_AT_HEADER = 'X-Cache-Stored-At';
const PUBLIC_CACHE_CONTROL = `public, max-age=${FRESH_TTL_SECONDS}, stale-while-revalidate=${STALE_TTL_SECONDS}`;

// The Workers Cache API ignores stale-while-revalidate, so keep its copy alive
// for the entire stale window and track freshness separately.
const STORAGE_CACHE_CONTROL = `public, max-age=${CACHE_RETENTION_SECONDS}`;

type CacheStatus = 'HIT' | 'MISS' | 'STALE';

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

function getDefaultCache() {
  const cacheStorage = (globalThis as typeof globalThis & {caches?: DefaultCacheStorage})
    .caches;

  return cacheStorage?.default;
}

function responseForClient(response: Response, status: CacheStatus) {
  const headers = new Headers(response.headers);
  headers.delete(CACHE_STORED_AT_HEADER);
  headers.set('Cache-Control', PUBLIC_CACHE_CONTROL);
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

function createStoredResponse<T>(data: T, storedAt: number) {
  return Response.json(data, {
    headers: {
      'Cache-Control': STORAGE_CACHE_CONTROL,
      [CACHE_STORED_AT_HEADER]: storedAt.toString(),
    },
  });
}

function storeResponse(
  cache: Cache | null,
  cacheKey: Request,
  response: Response,
  storedAt: number,
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
    freshUntil: storedAt + FRESH_TTL_MILLISECONDS,
    retainedUntil: storedAt + CACHE_RETENTION_MILLISECONDS,
    response: response.clone(),
  });
}

function loadAndStoreResponse<T>(
  cache: Cache | null,
  cacheKey: Request,
  load: () => Promise<T>,
) {
  const pendingRequest = load()
    .then(data => {
      const storedAt = Date.now();
      const response = createStoredResponse(data, storedAt);
      storeResponse(cache, cacheKey, response, storedAt);
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
) {
  scheduleBackgroundTask(async () => {
    const pendingRequest =
      pendingResponses.get(cacheKey.url) ?? loadAndStoreResponse(cache, cacheKey, load);

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

function isFresh(response: Response) {
  const storedAt = Number(response.headers.get(CACHE_STORED_AT_HEADER));
  return Number.isFinite(storedAt) && storedAt + FRESH_TTL_MILLISECONDS > Date.now();
}

export async function cachedJsonResponse<T>(request: Request, load: () => Promise<T>) {
  const cacheKey = new Request(request.url, {method: 'GET'});
  const cloudflareCache = getDefaultCache() ?? null;

  if (cloudflareCache) {
    const cachedResponse = await readCloudflareCache(cloudflareCache, cacheKey);

    if (cachedResponse && isFresh(cachedResponse)) {
      return responseForClient(cachedResponse, 'HIT');
    }

    if (cachedResponse) {
      refreshInBackground(cloudflareCache, cacheKey, load);
      return responseForClient(cachedResponse, 'STALE');
    }
  } else {
    const cachedEntry = memoryCache.get(cacheKey.url);
    const now = Date.now();

    if (cachedEntry && cachedEntry.freshUntil > now) {
      return responseForClient(cachedEntry.response.clone(), 'HIT');
    }

    if (cachedEntry && cachedEntry.retainedUntil > now) {
      refreshInBackground(cloudflareCache, cacheKey, load);
      return responseForClient(cachedEntry.response.clone(), 'STALE');
    }

    memoryCache.delete(cacheKey.url);
  }

  const existingRequest = pendingResponses.get(cacheKey.url);

  if (existingRequest) {
    return responseForClient((await existingRequest).clone(), 'HIT');
  }

  const response = await loadAndStoreResponse(cloudflareCache, cacheKey, load);
  return responseForClient(response.clone(), 'MISS');
}

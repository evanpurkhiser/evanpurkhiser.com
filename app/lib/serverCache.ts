import {getCloudflareContext} from '@opennextjs/cloudflare';

const CACHE_TTL_SECONDS = 60 * 60;
const CACHE_TTL_MILLISECONDS = CACHE_TTL_SECONDS * 1000;

type DefaultCacheStorage = CacheStorage & {
  default: Cache;
};

type MemoryCacheEntry = {
  expiresAt: number;
  response: Response;
};

const memoryCache = new Map<string, MemoryCacheEntry>();
const pendingResponses = new Map<string, Promise<Response>>();

function getDefaultCache() {
  const cacheStorage = (globalThis as typeof globalThis & {caches?: DefaultCacheStorage})
    .caches;

  return cacheStorage?.default;
}

function withCacheStatus(response: Response, status: 'HIT' | 'MISS') {
  const headers = new Headers(response.headers);
  headers.set('X-Cache', status);

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

async function storeCloudflareResponse(cache: Cache, key: Request, response: Response) {
  const write = cache.put(key, response);

  try {
    const {ctx} = getCloudflareContext();
    ctx.waitUntil(write);
  } catch {
    await write;
  }
}

export async function cachedJsonResponse<T>(request: Request, load: () => Promise<T>) {
  const cacheKey = new Request(request.url, {method: 'GET'});
  const cloudflareCache = getDefaultCache();

  if (cloudflareCache) {
    let cachedResponse: Response | undefined;

    try {
      cachedResponse = await cloudflareCache.match(cacheKey);
    } catch (error) {
      console.error('Failed to read from the Cloudflare cache', error);
    }

    if (cachedResponse) {
      return withCacheStatus(cachedResponse, 'HIT');
    }
  } else {
    const cachedEntry = memoryCache.get(cacheKey.url);

    if (cachedEntry && cachedEntry.expiresAt > Date.now()) {
      return withCacheStatus(cachedEntry.response.clone(), 'HIT');
    }

    memoryCache.delete(cacheKey.url);
  }

  const existingRequest = pendingResponses.get(cacheKey.url);

  if (existingRequest) {
    return withCacheStatus((await existingRequest).clone(), 'HIT');
  }

  const pendingRequest = load()
    .then(data => {
      const response = Response.json(data, {
        headers: {'Cache-Control': `public, max-age=${CACHE_TTL_SECONDS}`},
      });

      if (cloudflareCache) {
        void storeCloudflareResponse(cloudflareCache, cacheKey, response.clone());
      } else {
        memoryCache.set(cacheKey.url, {
          expiresAt: Date.now() + CACHE_TTL_MILLISECONDS,
          response: response.clone(),
        });
      }

      return response;
    })
    .finally(() => pendingResponses.delete(cacheKey.url));

  pendingResponses.set(cacheKey.url, pendingRequest);

  return withCacheStatus((await pendingRequest).clone(), 'MISS');
}

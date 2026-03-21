type CacheEntry<T> = {
  data: T;
  expiresAt: number;
};

const cache = new Map<string, CacheEntry<unknown>>();

/** Default TTL: 60 seconds */
const DEFAULT_TTL_MS = 60_000;

/**
 * Return cached data if still valid, otherwise call `fetcher` and cache the result.
 * @param key   Unique cache key (e.g. "profile:<token-hash>")
 * @param fetcher Async function that fetches the fresh data
 * @param ttlMs  Time-to-live in milliseconds (default 60s)
 */
export async function cachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs: number = DEFAULT_TTL_MS,
): Promise<T> {
  const entry = cache.get(key) as CacheEntry<T> | undefined;
  if (entry && Date.now() < entry.expiresAt) {
    return entry.data;
  }

  const data = await fetcher();
  cache.set(key, { data, expiresAt: Date.now() + ttlMs });
  return data;
}

/** Remove a specific cache entry */
export function invalidateCache(key: string): void {
  cache.delete(key);
}

/** Remove all entries matching a prefix  (e.g. "profile:" clears all profile caches) */
export function invalidateCacheByPrefix(prefix: string): void {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) {
      cache.delete(key);
    }
  }
}

/** Remove all cache entries */
export function clearAllCache(): void {
  cache.clear();
}

/**
 * Short hash of access token — used to scope cache keys per user session without
 * storing the full token as a map key.
 */
export function tokenKey(token: string): string {
  // Use the last 12 chars of the JWT for a fast, sufficiently-unique key
  return token.slice(-12);
}

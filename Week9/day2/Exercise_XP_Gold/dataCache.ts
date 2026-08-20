interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

/**
 * A module-level `Map`, not a `useRef` or `useMemo` living inside the hook.
 *
 * The instructions suggest storing the cache in a `useMemo` or a `ref` —
 * either would live inside one hook instance, tied to one component's
 * lifetime. That fails the exercise's own first success criterion the
 * moment a component unmounts and remounts (navigating away and back,
 * for instance): a per-instance cache resets to empty on remount, so the
 * "same request within `maxAge`" would trigger a fresh network call
 * anyway — exactly what a cache is supposed to prevent. A module-level
 * `Map`, imported by every component that calls `useDataFetching`, persists
 * across mounts and is shared by every consumer requesting the same `url`,
 * which is what makes this a cache rather than per-render memoisation.
 */
const cache = new Map<string, CacheEntry<unknown>>();

export function getCacheEntry<T>(key: string): CacheEntry<T> | undefined {
  return cache.get(key) as CacheEntry<T> | undefined;
}

export function setCacheEntry<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}

export function deleteCacheEntry(key: string): void {
  cache.delete(key);
}

export function isEntryValid(entry: CacheEntry<unknown> | undefined, maxAge: number): boolean {
  if (!entry) return false;
  return Date.now() - entry.timestamp < maxAge;
}

/** Test-only: wipes every cached entry so tests don't leak into each other. */
export function clearAllCacheEntriesForTesting(): void {
  cache.clear();
}

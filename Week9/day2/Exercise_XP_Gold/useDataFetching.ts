import { useCallback, useEffect, useState } from 'react';
import { getCacheEntry, setCacheEntry, deleteCacheEntry, isEntryValid } from './dataCache';

export interface UseDataFetchingConfig {
  /** How long a cached entry stays valid, in milliseconds. */
  maxAge: number;
}

type FetchStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

export interface UseDataFetchingResult<T> {
  data: T | null;
  status: FetchStatus;
  error: string | null;
  /** Re-fetches from the network, bypassing the cache, and refreshes the cache with the result. */
  refetch: () => void;
  /** Removes the cached entry for this url. Does not by itself trigger a new fetch — see the README. */
  invalidateCache: () => void;
}

export function useDataFetching<T>(url: string, config: UseDataFetchingConfig): UseDataFetchingResult<T> {
  const { maxAge } = config;

  const initialEntry = getCacheEntry<T>(url);
  const initialCacheIsValid = isEntryValid(initialEntry, maxAge);

  const [data, setData] = useState<T | null>(initialCacheIsValid ? initialEntry!.data : null);
  const [status, setStatus] = useState<FetchStatus>(initialCacheIsValid ? 'succeeded' : 'idle');
  const [error, setError] = useState<string | null>(null);

  // Bumping this is how `refetch()` forces the effect below to run again
  // and bypass the cache, without a separate boolean flag that would then
  // need to be reset back to `false` once consumed.
  const [fetchToken, setFetchToken] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const bypassCache = fetchToken > 0;

    async function load() {
      if (!bypassCache) {
        const entry = getCacheEntry<T>(url);
        if (isEntryValid(entry, maxAge)) {
          setData(entry!.data);
          setStatus('succeeded');
          setError(null);
          return; // Cache hit — no network call at all.
        }
      }

      setStatus('loading');
      setError(null);
      try {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}.`);
        }
        const result = (await response.json()) as T;
        setCacheEntry(url, result); // Refreshes the cache too, including on a forced refetch.
        setData(result);
        setStatus('succeeded');
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        const message = err instanceof Error ? err.message : 'Something went wrong.';
        setError(message);
        setStatus('failed');
      }
    }

    void load();
    return () => controller.abort();
  }, [url, maxAge, fetchToken]);

  const refetch = useCallback(() => {
    setFetchToken((token) => token + 1);
  }, []);

  const invalidateCache = useCallback(() => {
    deleteCacheEntry(url);
  }, [url]);

  return { data, status, error, refetch, invalidateCache };
}

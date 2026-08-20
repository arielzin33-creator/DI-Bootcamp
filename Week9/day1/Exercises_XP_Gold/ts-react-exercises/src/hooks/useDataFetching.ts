/**
 * Exercise (Set 2) 3: Creating a Data Fetching and Caching System
 *
 * This hook demonstrates:
 * - A generic <T> so any JSON-shaped response can be fetched and cached.
 * - A module-level cache (a Map, keyed by URL) that persists across
 *   component mounts/unmounts — not just component state — so navigating
 *   away and back doesn't trigger a redundant network request.
 * - A maxAge (ms) that determines when a cache entry is considered stale.
 * - refetch() to force a network call, and invalidateCache() to drop the
 *   cached entry and force a refetch.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

interface UseDataFetchingConfig {
  /** How long (in milliseconds) a cached response stays valid. */
  maxAge: number;
}

interface UseDataFetchingReturn<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  /** Re-fetches from the network, bypassing the cache. */
  refetch: () => void;
  /** Drops the cached entry for this URL, then re-fetches. */
  invalidateCache: () => void;
}

// Shared across every component that calls useDataFetching, keyed by URL.
// `unknown` here because a single cache serves callers requesting many
// different response shapes; each caller narrows it back to its own T.
const responseCache = new Map<string, CacheEntry<unknown>>();

function useDataFetching<T>(
  url: string,
  config: UseDataFetchingConfig
): UseDataFetchingReturn<T> {
  const { maxAge } = config;
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef<boolean>(true);

  const fetchData = useCallback(
    async (bypassCache: boolean): Promise<void> => {
      const cached = responseCache.get(url);
      const isCacheValid = !!cached && Date.now() - cached.timestamp < maxAge;

      if (!bypassCache && isCacheValid && cached) {
        setData(cached.data as T);
        setIsLoading(false);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const json: T = await response.json();
        responseCache.set(url, { data: json, timestamp: Date.now() });

        if (isMountedRef.current) {
          setData(json);
        }
      } catch (err) {
        if (isMountedRef.current) {
          setError(err instanceof Error ? err.message : 'An unknown error occurred');
        }
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    },
    [url, maxAge]
  );

  useEffect(() => {
    isMountedRef.current = true;
    fetchData(false);

    return () => {
      isMountedRef.current = false;
    };
  }, [fetchData]);

  const refetch = useCallback((): void => {
    fetchData(true);
  }, [fetchData]);

  const invalidateCache = useCallback((): void => {
    responseCache.delete(url);
    fetchData(true);
  }, [url, fetchData]);

  return { data, isLoading, error, refetch, invalidateCache };
}

export default useDataFetching;

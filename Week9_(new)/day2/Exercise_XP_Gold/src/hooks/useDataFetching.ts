import { useCallback, useEffect, useState } from 'react'

interface CacheEntry<T> {
  data: T
  timestamp: number
}

interface DataFetchingConfig {
  maxAge: number
}

interface UseDataFetchingResult<T> {
  data: T | null
  loading: boolean
  error: string | null
  fromCache: boolean
  refetch: () => void
  invalidateCache: () => void
}

// Module-level so the cache is shared across every component using the same URL.
const cache = new Map<string, CacheEntry<unknown>>()

function isEntryValid(entry: CacheEntry<unknown> | undefined, maxAge: number): boolean {
  if (!entry) return false
  return Date.now() - entry.timestamp < maxAge
}

export function useDataFetching<T>(url: string, config: DataFetchingConfig): UseDataFetchingResult<T> {
  const { maxAge } = config
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [fromCache, setFromCache] = useState<boolean>(false)

  const fetchData = useCallback(
    async (bypassCache: boolean): Promise<void> => {
      const cached = cache.get(url) as CacheEntry<T> | undefined

      if (!bypassCache && isEntryValid(cached, maxAge)) {
        setData(cached!.data)
        setFromCache(true)
        setError(null)
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`)
        }
        const json: T = await response.json()
        cache.set(url, { data: json, timestamp: Date.now() })
        setData(json)
        setFromCache(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong.')
      } finally {
        setLoading(false)
      }
    },
    [url, maxAge]
  )

  useEffect(() => {
    fetchData(false)
  }, [fetchData])

  const refetch = useCallback((): void => {
    fetchData(true)
  }, [fetchData])

  const invalidateCache = useCallback((): void => {
    cache.delete(url)
    fetchData(true)
  }, [url, fetchData])

  return { data, loading, error, fromCache, refetch, invalidateCache }
}

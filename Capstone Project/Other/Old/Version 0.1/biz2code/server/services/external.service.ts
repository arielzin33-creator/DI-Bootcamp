/**
 * ─────────────────────────────────────────────────────────────
 * PURPOSE   World Bank + iTunes clients, cached in external_cache.
 * WHY       Both are keyless. iTunes sends no CORS headers and rate-limits
 *           ~20/min, so calls must be server-side and cached. The seed
 *           project ships pre-cached so the demo survives bad wifi.
 * DEPENDS   db/query.ts
 * ADR       ADR-009
 * ─────────────────────────────────────────────────────────────
 *
 * HOW TO RUN THESE MANUALLY (before Demo Day):
 *   npx tsx server/scripts/fetch-seed-data.ts
 *
 * That script calls the two functions below directly — no database, no
 * running server required — and writes the real responses straight into
 * server/data/seed-project.json, replacing the PLACEHOLDER entries.
 */

import { query } from '../db/query';

const WORLD_BANK_BASE = 'https://api.worldbank.org/v2';
const ITUNES_BASE = 'https://itunes.apple.com/search';

// ---------------------------------------------------------------- cache ---
export async function getCached<T>(source: string, key: string): Promise<T | null> {
  const row = await query<{ payload: T }>(
    'SELECT payload FROM external_cache WHERE source = $1 AND cache_key = $2',
    [source, key],
  );
  return row[0]?.payload ?? null;
}

export async function setCached(source: string, key: string, payload: unknown) {
  await query(
    `INSERT INTO external_cache (source, cache_key, payload, fetched_at)
     VALUES ($1, $2, $3, now())
     ON CONFLICT (source, cache_key)
     DO UPDATE SET payload = $3, fetched_at = now()`,
    [source, key, JSON.stringify(payload)],
  );
}

// ------------------------------------------------------------ World Bank ---
export interface WorldBankResult {
  country: string;
  indicator: string;
  indicatorName: string | null;
  value: number | null;
  year: number | null;
}

/**
 * indicator examples: SP.POP.TOTL (population), IT.NET.USER.ZS (% internet users)
 * countryIso2: e.g. 'IL' for Israel. Keyless — no auth header needed.
 */
export async function worldBankIndicator(
  countryIso2: string,
  indicator: string,
): Promise<WorldBankResult | null> {
  const cacheKey = `${countryIso2}/${indicator}`;
  try {
    const url = `${WORLD_BANK_BASE}/country/${countryIso2}/indicator/${indicator}` +
                `?format=json&per_page=5&mrv=1`;   // most recent non-empty value
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`World Bank ${res.status}`);
    const json = (await res.json()) as [unknown, Array<{
      country: { value: string }; indicator: { value: string };
      value: number | null; date: string;
    }> | null];
    const entry = json[1]?.[0];
    if (!entry) return null;
    const result: WorldBankResult = {
      country: entry.country.value,
      indicator,
      indicatorName: entry.indicator.value,
      value: entry.value,
      year: Number(entry.date),
    };
    await setCached('worldbank', cacheKey, result).catch(() => {}); // cache best-effort
    return result;
  } catch (err) {
    // Network failure: fall through to cache. If nothing cached, caller renders unvalidated.
    const cached = await getCached<WorldBankResult>('worldbank', cacheKey).catch(() => null);
    return cached;
  }
}

// --------------------------------------------------------------- iTunes ---
export interface ItunesApp {
  trackName: string;
  artistName: string;
  price: number;
  formattedPrice: string | null;
  averageUserRating: number | null;
  userRatingCount: number | null;
  primaryGenreName: string;
  trackViewUrl: string;
}

/**
 * Apple's public iTunes Search API. No key. ~20 req/min guidance. No CORS —
 * this MUST be called server-side (a browser fetch to this URL will fail).
 */
export async function itunesSearch(
  term: string,
  country = 'US',
  limit = 5,
): Promise<ItunesApp[]> {
  const cacheKey = `${term}/${country}`;
  try {
    const url = `${ITUNES_BASE}?term=${encodeURIComponent(term)}&country=${country}` +
                `&entity=software&limit=${limit}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`iTunes ${res.status}`);
    const json = (await res.json()) as { results: ItunesApp[] };
    await setCached('itunes', cacheKey, json.results).catch(() => {});
    return json.results;
  } catch {
    const cached = await getCached<ItunesApp[]>('itunes', cacheKey).catch(() => null);
    return cached ?? [];
  }
}

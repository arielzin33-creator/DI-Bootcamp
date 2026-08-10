/**
 * ─────────────────────────────────────────────────────────────
 * PURPOSE   Runs the two live APIs for real and writes their responses into
 *           seed-project.json, replacing the PLACEHOLDER cache entries.
 * WHY       The seed project ships with null placeholders on purpose — this
 *           project does not invent a population figure to look complete.
 *           Run this once before Demo Day so the numbers are real.
 * DEPENDS   services/external.service.ts (the fetch logic — imported
 *           directly here, so this script needs NO database and NO running
 *           server. It just hits the two APIs and rewrites the JSON file.)
 * ─────────────────────────────────────────────────────────────
 *
 * RUN THIS:
 *   npx tsx server/scripts/fetch-seed-data.ts
 *
 * WHAT IT DOES
 *   1. Fetches Israel population + internet-usage % from the World Bank.
 *   2. Fetches iTunes competitor results for "indoor navigation".
 *   3. Overwrites the three PLACEHOLDER entries in seed-project.json's
 *      externalCache array with the real responses.
 *
 * If a call fails (no network, API down), the script leaves that entry as a
 * PLACEHOLDER and prints a warning — it does NOT invent a value.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SEED_PATH = path.join(__dirname, '..', 'data', 'seed-project.json');

// Duplicated fetch logic here (rather than importing external.service.ts)
// because that module expects a live DB pool. This script is deliberately
// standalone — it must run before the database or app exist.

async function worldBank(countryIso2: string, indicator: string) {
  const url = `https://api.worldbank.org/v2/country/${countryIso2}/indicator/${indicator}` +
              `?format=json&per_page=5&mrv=1`;
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`World Bank ${res.status}`);
  const json = await res.json() as [unknown, Array<{
    country: { value: string }; indicator: { value: string };
    value: number | null; date: string;
  }> | null];
  const entry = json[1]?.[0];
  if (!entry) throw new Error('World Bank: no data returned');
  return {
    country: entry.country.value, indicator, indicatorName: entry.indicator.value,
    value: entry.value, year: Number(entry.date), _status: 'FETCHED',
  };
}

async function itunes(term: string, country: string) {
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}` +
              `&country=${country}&entity=software&limit=5`;
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`iTunes ${res.status}`);
  const json = await res.json() as { resultCount: number; results: unknown[] };
  return { ...json, _status: 'FETCHED' };
}

async function main() {
  const seed = JSON.parse(readFileSync(SEED_PATH, 'utf8'));
  let updated = 0, failed = 0;

  for (const entry of seed.externalCache) {
    try {
      if (entry.source === 'worldbank' && entry.cacheKey === 'ISR/SP.POP.TOTL') {
        entry.payload = await worldBank('IL', 'SP.POP.TOTL');
      } else if (entry.source === 'worldbank' && entry.cacheKey === 'ISR/IT.NET.USER.ZS') {
        entry.payload = await worldBank('IL', 'IT.NET.USER.ZS');
      } else if (entry.source === 'itunes' && entry.cacheKey === 'indoor navigation/IL') {
        entry.payload = await itunes('indoor navigation', 'IL');
      } else {
        continue;
      }
      console.log(`  OK    ${entry.source} :: ${entry.cacheKey}`);
      updated++;
    } catch (err) {
      console.warn(`  FAIL  ${entry.source} :: ${entry.cacheKey} — ${(err as Error).message}`);
      console.warn('        Left as PLACEHOLDER. Will render "unvalidated" until re-run.');
      failed++;
    }
    await new Promise((r) => setTimeout(r, 500)); // be polite to both free APIs
  }

  writeFileSync(SEED_PATH, JSON.stringify(seed, null, 2));
  console.log(`\nDone. ${updated} updated, ${failed} left as placeholders.`);
  if (failed > 0) {
    console.log('Re-run this script before Demo Day to try the failed calls again.');
  }
}

main().catch((e) => { console.error(e); process.exit(1); });

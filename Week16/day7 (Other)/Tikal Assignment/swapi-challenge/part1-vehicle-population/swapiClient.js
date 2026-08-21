const BASE_URL = "https://swapi.py4e.com/api";

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`SWAPI request failed (${response.status}): ${url}`);
  }
  return response.json();
}

// Follows `next` links until every page's results are collected.
export async function fetchAllPages(resource) {
  const results = [];
  let url = `${BASE_URL}/${resource}/`;
  while (url) {
    const page = await fetchJson(url);
    results.push(...page.results);
    url = page.next;
  }
  return results;
}

// Fetches a set of URLs in parallel, deduped, and returns a Map keyed by URL —
// the shared building block behind resolving pilots and homeworlds without
// ever re-fetching the same resource twice.
export async function fetchByUrls(urls) {
  const uniqueUrls = [...new Set(urls)];
  const entries = await Promise.all(
    uniqueUrls.map(async (url) => [url, await fetchJson(url)])
  );
  return new Map(entries);
}

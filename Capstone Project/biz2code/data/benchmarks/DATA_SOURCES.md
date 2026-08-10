# Data Sources Catalogue

Where biz2code's numbers come from, what's free, what isn't, and what to add later.

---

## Tier 1 — Live APIs, wired into the MVP

| Source | Auth | Cost | Covers | Constraint |
|---|---|---|---|---|
| **World Bank Indicators v2** | none | free | TAM/SAM/SOM grounding, population, GDP, urbanisation, internet penetration | ~16,000 indicators; CC-BY, attribution required; annual granularity |
| **Apple iTunes Search API** | none | free | Competitor discovery, pricing, ratings, category, release dates | ~20 calls/min; **no CORS — server-side only**; iOS only |

---

## Tier 2 — Free APIs worth adding next (not in MVP)

| Source | Auth | Covers |
|---|---|---|
| REST Countries | none | Country metadata, population, region, currency |
| FRED (St. Louis Fed) | free key | US macro time series, CPI, rates |
| Eurostat REST | none | EU demographics and economics |
| OECD SDMX | none | Member-country economic indicators |
| UN Data / UNSD | none | Global development indicators |
| Wikidata SPARQL | none | Entity data, company facts |
| data.gov.il | none | Israeli public datasets |
| Open Exchange Rates | free tier | Currency conversion for multi-market projections |
| Google Books / Crossref | none | Academic and published-source lookups |

---

## Tier 3 — Benchmark publishers (report-only, no free API)

These are where the `benchmarks.*.json` figures ultimately originate. **None expose a
free API.** They publish annual PDFs and web reports; the constants file exists because
of this gap.

| Publisher | Report | Access |
|---|---|---|
| Adjust | Mobile App Trends | Free report download |
| AppsFlyer | State of App Marketing / State of Subscriptions | Free report download |
| Liftoff | Mobile Ad Creative / Gaming Apps Report | Free report download |
| Sensor Tower | State of Mobile | Free summary, paid data |
| Business of Apps | CPI / ARPU research pages | Free web |
| UXCam | Retention benchmarks | Free web |
| Statista | Category statistics | Freemium, mostly paywalled |

**Workflow:** download the report → find the figure → update the JSON → set
`confidence` to `primary` → run `validate_benchmarks.py`.

---

## Tier 4 — Paid APIs (future work)

Would convert large blocks of placeholders into `primary`-tier values. All out of
scope for a one-week MVP on cost grounds.

| Provider | Indicative cost | Covers |
|---|---|---|
| Sensor Tower | enterprise / custom | Download + revenue estimates |
| data.ai (App Annie) | enterprise / custom | Market intelligence |
| Adjust / AppsFlyer (as customers) | usage-based | Own-cohort attribution data |
| AppFollow | ~$111/mo entry | Review management, ASO analytics |
| SerpApi | ~$75/mo | App Store SERP scraping |
| SimilarWeb | paid | Web/app traffic estimates |
| Crunchbase | paid | Funding and company data |

---

## Tier 5 — MCP servers

Per the project decision: **APIs preferred; MCP only where no suitable API exists.**

Relevant if the project continues past MVP:
- World Bank economic-indicator MCP servers exist on public registries (wrap the same
  free API — no advantage over calling it directly)
- Web-search MCP — would enable live market research, but reintroduces the
  ungrounded-citation risk the constants file exists to eliminate
- Filesystem / database MCP — for agentic document assembly

**Not recommended for the MVP.** MCP adds a protocol layer and a failure surface for
data already reachable over plain HTTP.

---

## Deliberately excluded

| Source | Why |
|---|---|
| Google Trends | No official API; unofficial wrappers break and rate-limit |
| Google Play | No official free data API |
| LLM's own knowledge | The entire point of the guardrail. The model may only cite the constants file or a Tier-1 API response |

---

## Coverage today

- **43 / 194** vertical metrics sourced across 16 verticals
- **21 / 23** cross-vertical aggregate metrics sourced
- **0** verticals with zero data
- **5** proxy metrics (borrowed from an adjacent vertical — flagged in output)
- **2** metrics with conflicting published sources (disagreement recorded, not hidden)

### Confidence tiers
- `primary` — read from the publisher's own report *(none yet — all current entries are via summaries)*
- `secondary` — real published figure via a summary naming the primary vendor
- `tertiary` — industry-blog aggregation; vendor unnamed or unclear. Weakest usable tier
- `placeholder` — `value: null`, renders **"unvalidated"**

### Two conflicts you should know about

**Fintech D30 retention — published values range 2% to 12%.** Adjust 2026 reports 2%,
down from 3% the prior year. Other sources report 10–15%. One source states the widely
circulated 30 / 17.6 / 11.6 figure traces to an AppsFlyer 2023 *subscription* cohort
recycled for three years. The app must surface this disagreement rather than pick one.

**Social D30 retention — published values range 5% to 22%.** Stored as a band spanning
all reported values.

### Two figures left deliberately unvalidated

**LTV:CAC 3:1** and **tech debt at 30% of dev effort** are rules of thumb, not measured
benchmarks. Both remain placeholders. A separate, sourced figure — a 1.5x LTV:CAC
campaign viability floor — is stored instead.

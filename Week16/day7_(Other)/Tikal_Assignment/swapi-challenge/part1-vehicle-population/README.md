# Part 1 — Vehicle with the highest pilot-homeworld population sum

## Run it

```bash
npm start
```

(Node 18+; uses the built-in `fetch`, no dependencies.)

## Result (live SWAPI data)

| Field | Value |
|---|---|
| Vehicle name with the largest sum | **Tsmeu-6 personal wheel bike** |
| Related home planets and their respective population | `[Kalee, 4000000000]` |
| Related pilot names | `[Grievous]` |

## Approach

1. `swapiClient.js` — two small building blocks: `fetchAllPages()` follows
   SWAPI's `next` pagination links, and `fetchByUrls()` fetches a set of
   URLs in parallel *after deduping them*, returning a `Map` keyed by URL.
2. `findVehiclesWithHighestPopulation.js`:
   - Fetch all vehicles, then immediately drop any with an empty `pilots`
     array — they can't contribute to the answer, so no pilot/planet
     network calls are wasted on them. (This matters: only 8 of the 39
     vehicles have any named pilots.)
   - Collect every pilot URL across the surviving vehicles, dedupe, and
     fetch them all in parallel in one batch — a pilot flown by two
     different vehicles (or listed on a vehicle twice) is only fetched
     once.
   - Same again one level deeper for homeworlds: collect every pilot's
     `homeworld` URL, dedupe, fetch in parallel.
   - For each vehicle, sum its pilots' homeworld populations (SWAPI's
     `"unknown"` population values are excluded from the sum rather than
     treated as 0 — "no data" isn't a claim of zero population) and return
     whichever vehicle(s) have the highest sum. Ties are supported (the
     brief's own phrasing, "which vehicle **names**", is plural) — none
     occurred in the live data, but the code doesn't assume that.

Total network calls stay proportional to the number of *distinct* vehicles,
pilots, and planets involved — never to the number of (vehicle, pilot) or
(pilot, planet) pairs, which is what a naive nested-loop-with-fetch-inside
implementation would do instead.

## A modeling note

"Sum of population for all its pilots' home planets" is summed **per pilot**,
not per unique planet — a vehicle with two pilots from the same homeworld
counts that planet's population twice toward the sum. The **displayed**
"related home planets" list still shows each planet only once, since
repeating an identical `[name, population]` pair wouldn't add information.
This distinction doesn't change the actual winner here (no vehicle's pilots
share a homeworld in the current dataset), but the two are computed
independently on purpose.

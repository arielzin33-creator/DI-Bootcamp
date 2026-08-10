/**
 * ─────────────────────────────────────────────────────────────
 * PURPOSE   Loads seed-project.json into the database.
 * WHY       Demo Day must not depend on typing 20 answers live, or on the
 *           network being cooperative. This inserts 15 pre-filled answers and
 *           the cached API responses, leaving the 5 demo questions blank.
 * DEPENDS   ../data/seed-project.json (project root), db/query.ts
 * ADR       ADR-009
 * ─────────────────────────────────────────────────────────────
 *
 * Run: npm run db:seed
 *
 * TODO
 *   [ ] Create (or find) the demo user
 *   [ ] Insert the project with is_seed = true, plus its 4 phases rows
 *   [ ] Insert every answer where clearOnDemo === false
 *   [ ] Insert externalCache rows
 *   [ ] Make it idempotent - re-running must not duplicate
 *   [ ] BEFORE DEMO DAY: replace the PLACEHOLDER cache payloads with real
 *       World Bank / iTunes responses, then commit them
 */

import seed from '../../data/seed-project.json' with { type: 'json' };

async function main() {
  console.log(`Seeding: ${seed.project.name}`);
  const prefill = seed.answers.filter((a) => !a.clearOnDemo);
  console.log(
    `  ${prefill.length} answers pre-filled, ` +
    `${seed.answers.length - prefill.length} left blank for the live demo`,
  );
  // TODO
}

main().catch((e) => { console.error(e); process.exit(1); });

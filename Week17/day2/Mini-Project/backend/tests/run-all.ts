/**
 * Runs every backend test file in one process.
 *
 *     npm test
 *
 * None of these need a database or the network beyond localhost, so they are safe to
 * run anywhere -- including in CI.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";

const files = ["logic.test.ts", "diff.test.ts", "websocket.test.ts"];

let failed = 0;

for (const file of files) {
  console.log(`\n${"=".repeat(60)}\n  ${file}\n${"=".repeat(60)}`);
  const result = spawnSync(
    process.execPath,
    [path.join(__dirname, "..", "node_modules", "tsx", "dist", "cli.mjs"), path.join(__dirname, file)],
    { stdio: "inherit" },
  );
  if (result.status !== 0) failed++;
}

if (failed > 0) {
  console.error(`\n${failed} test file(s) FAILED\n`);
  process.exit(1);
}
console.log("\nAll backend test files passed.\n");

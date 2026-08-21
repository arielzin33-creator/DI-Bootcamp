/**
 * Tests for the line diff used by version history.
 *
 *     npx tsx tests/diff.test.ts
 */
import "./setupEnv";

import assert from "node:assert/strict";
import { diffLines, diffStats } from "../src/helpers/diff";

let passed = 0;
function check(name: string, fn: () => void): void {
  fn();
  passed++;
  console.log("  ok -", name);
}

/** Compact rendering so failures are readable: "=a", "+b", "-c". */
function render(oldText: string, newText: string): string {
  return diffLines(oldText, newText)
    .map((line) => `${line.type === "added" ? "+" : line.type === "removed" ? "-" : "="}${line.text}`)
    .join("|");
}

console.log("\n== diffLines ==");

check("identical text produces only unchanged lines", () => {
  assert.equal(render("a\nb\nc", "a\nb\nc"), "=a|=b|=c");
  assert.deepEqual(diffStats(diffLines("a\nb", "a\nb")), { added: 0, removed: 0 });
});

check("a pure addition at the end", () => {
  assert.equal(render("a\nb", "a\nb\nc"), "=a|=b|+c");
  assert.deepEqual(diffStats(diffLines("a\nb", "a\nb\nc")), { added: 1, removed: 0 });
});

check("a pure deletion", () => {
  assert.equal(render("a\nb\nc", "a\nc"), "=a|-b|=c");
  assert.deepEqual(diffStats(diffLines("a\nb\nc", "a\nc")), { added: 0, removed: 1 });
});

check("a changed line shows as remove + add", () => {
  assert.equal(render("a\nb\nc", "a\nB\nc"), "=a|-b|+B|=c");
  assert.deepEqual(diffStats(diffLines("a\nb\nc", "a\nB\nc")), { added: 1, removed: 1 });
});

check("an insertion in the middle keeps the common lines", () => {
  assert.equal(render("a\nc", "a\nb\nc"), "=a|+b|=c");
});

check("empty original means everything is added (first version)", () => {
  assert.equal(render("", "a\nb"), "-|+a|+b");
});

check("a full rewrite", () => {
  assert.equal(render("x\ny", "a\nb"), "-x|-y|+a|+b");
});

check("line numbers point into the right side of the diff", () => {
  const lines = diffLines("a\nb\nc", "a\nB\nc");
  assert.deepEqual(
    lines.map((l) => [l.type, l.oldLine, l.newLine]),
    [
      ["unchanged", 1, 1],
      ["removed", 2, null],
      ["added", null, 2],
      ["unchanged", 3, 3],
    ],
  );
});

check("finds the longest common subsequence, not just a prefix match", () => {
  // A naive line-by-line comparison would call all four lines changed; the LCS
  // should recognise that a, c and d are still there.
  assert.equal(render("a\nb\nc\nd", "a\nc\nd"), "=a|-b|=c|=d");
});

check("very large inputs degrade gracefully instead of exploding", () => {
  const huge = Array.from({ length: 6000 }, (_, i) => `line ${i}`).join("\n");
  const result = diffLines(huge, `${huge}\nextra`);
  assert.equal(result.length, 1);
  assert.match(result[0]!.text, /too large/i);
});

console.log(`\nALL ${passed} DIFF CHECKS PASSED\n`);

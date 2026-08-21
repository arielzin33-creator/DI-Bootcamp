/**
 * A line-level diff, for showing what changed between two versions of a story
 * ("bonus points for implementing diff editor like in Git").
 *
 * Implemented as a classic longest-common-subsequence over lines -- the same idea
 * `git diff` uses. Written by hand rather than pulled from npm so the algorithm is
 * visible, and because it is about 40 lines.
 *
 * Complexity is O(n*m) in time and memory. For story-sized text (hundreds of lines)
 * that is trivially fast; `MAX_LINES` guards against someone pasting a novel and
 * turning a diff request into a denial-of-service.
 */
import type { DiffLine } from "@storyapp/types";

const MAX_LINES = 5_000;

export function diffLines(oldText: string, newText: string): DiffLine[] {
  const oldLines = oldText.split("\n");
  const newLines = newText.split("\n");

  if (oldLines.length > MAX_LINES || newLines.length > MAX_LINES) {
    // Degrade gracefully rather than allocating a 25-million-cell table.
    return [
      {
        type: "unchanged",
        oldLine: null,
        newLine: null,
        text: "(Texts are too large to diff line by line.)",
      },
    ];
  }

  // lcs[i][j] = length of the longest common subsequence of oldLines[i:] and newLines[j:]
  const lcs: number[][] = Array.from({ length: oldLines.length + 1 }, () =>
    new Array<number>(newLines.length + 1).fill(0),
  );

  for (let i = oldLines.length - 1; i >= 0; i--) {
    for (let j = newLines.length - 1; j >= 0; j--) {
      lcs[i]![j] =
        oldLines[i] === newLines[j]
          ? lcs[i + 1]![j + 1]! + 1
          : Math.max(lcs[i + 1]![j]!, lcs[i]![j + 1]!);
    }
  }

  // Walk the table forwards, emitting a line at each step.
  const result: DiffLine[] = [];
  let i = 0;
  let j = 0;

  while (i < oldLines.length && j < newLines.length) {
    if (oldLines[i] === newLines[j]) {
      result.push({ type: "unchanged", oldLine: i + 1, newLine: j + 1, text: oldLines[i]! });
      i++;
      j++;
    } else if (lcs[i + 1]![j]! >= lcs[i]![j + 1]!) {
      result.push({ type: "removed", oldLine: i + 1, newLine: null, text: oldLines[i]! });
      i++;
    } else {
      result.push({ type: "added", oldLine: null, newLine: j + 1, text: newLines[j]! });
      j++;
    }
  }

  // Whatever is left over is a pure deletion or a pure addition.
  while (i < oldLines.length) {
    result.push({ type: "removed", oldLine: i + 1, newLine: null, text: oldLines[i]! });
    i++;
  }
  while (j < newLines.length) {
    result.push({ type: "added", oldLine: null, newLine: j + 1, text: newLines[j]! });
    j++;
  }

  return result;
}

/** Summary counts, for showing "+12 -3" next to a version in the history list. */
export function diffStats(lines: DiffLine[]): { added: number; removed: number } {
  let added = 0;
  let removed = 0;
  for (const line of lines) {
    if (line.type === "added") added++;
    else if (line.type === "removed") removed++;
  }
  return { added, removed };
}

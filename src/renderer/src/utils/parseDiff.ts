import type { DiffLine } from "../types";

const PLACEHOLDER: DiffLine = { num: 0, content: "", type: "placeholder" };

/**
 * Parse unified diff into aligned left/right arrays for side-by-side view.
 * Removed lines pair with placeholders on the right.
 * Added lines pair with placeholders on the left.
 * This keeps both columns the same length so rows line up like GitHub.
 */
export function parseDiff(raw: string): {
  left: DiffLine[];
  right: DiffLine[];
} {
  const left: DiffLine[] = [];
  const right: DiffLine[] = [];
  let leftNum = 0;
  let rightNum = 0;

  const lines = raw.split("\n");
  let inHunk = false;

  // Buffer removed/added runs so we can pair them
  let removedBuf: DiffLine[] = [];
  let addedBuf: DiffLine[] = [];

  function flushBuffers(): void {
    const max = Math.max(removedBuf.length, addedBuf.length);
    for (let i = 0; i < max; i++) {
      left.push(i < removedBuf.length ? removedBuf[i] : PLACEHOLDER);
      right.push(i < addedBuf.length ? addedBuf[i] : PLACEHOLDER);
    }
    removedBuf = [];
    addedBuf = [];
  }

  for (const line of lines) {
    const hunkMatch = line.match(/^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
    if (hunkMatch) {
      flushBuffers();
      leftNum = parseInt(hunkMatch[1], 10) - 1;
      rightNum = parseInt(hunkMatch[2], 10) - 1;
      inHunk = true;
      continue;
    }

    if (!inHunk) continue;

    if (line.startsWith("-")) {
      leftNum++;
      removedBuf.push({
        num: leftNum,
        content: line.slice(1),
        type: "removed",
      });
    } else if (line.startsWith("+")) {
      rightNum++;
      addedBuf.push({ num: rightNum, content: line.slice(1), type: "added" });
    } else {
      // Context line — flush any pending add/remove first
      flushBuffers();
      leftNum++;
      rightNum++;
      const content = line.startsWith(" ") ? line.slice(1) : line;
      left.push({ num: leftNum, content, type: "unchanged" });
      right.push({ num: rightNum, content, type: "unchanged" });
    }
  }

  flushBuffers();
  return { left, right };
}

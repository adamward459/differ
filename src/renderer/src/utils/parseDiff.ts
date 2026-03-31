import type { DiffLine } from "../types";

/**
 * Parse unified diff output into left/right line arrays for side-by-side view.
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

  for (const line of lines) {
    // Hunk header: @@ -a,b +c,d @@
    const hunkMatch = line.match(/^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
    if (hunkMatch) {
      leftNum = parseInt(hunkMatch[1], 10) - 1;
      rightNum = parseInt(hunkMatch[2], 10) - 1;
      inHunk = true;
      continue;
    }

    if (!inHunk) continue;

    if (line.startsWith("-")) {
      leftNum++;
      left.push({ num: leftNum, content: line.slice(1), type: "removed" });
    } else if (line.startsWith("+")) {
      rightNum++;
      right.push({ num: rightNum, content: line.slice(1), type: "added" });
    } else if (line.startsWith(" ") || line === "") {
      leftNum++;
      rightNum++;
      const content = line.startsWith(" ") ? line.slice(1) : line;
      left.push({ num: leftNum, content, type: "unchanged" });
      right.push({ num: rightNum, content, type: "unchanged" });
    }
  }

  return { left, right };
}

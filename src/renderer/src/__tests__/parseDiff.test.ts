import { describe, it, expect } from "vitest";
import { parseDiff } from "../utils/parseDiff";

describe("parseDiff", () => {
  it("returns empty arrays for empty input", () => {
    const { left, right } = parseDiff("");
    expect(left).toEqual([]);
    expect(right).toEqual([]);
  });

  it("parses context lines", () => {
    const raw = "@@ -1,2 +1,2 @@\n hello\n world";
    const { left, right } = parseDiff(raw);
    expect(left).toHaveLength(2);
    expect(right).toHaveLength(2);
    expect(left[0]).toEqual({ num: 1, content: "hello", type: "unchanged" });
    expect(right[0]).toEqual({ num: 1, content: "hello", type: "unchanged" });
  });

  it("parses added lines with placeholder on left", () => {
    const raw = "@@ -1,1 +1,2 @@\n context\n+added line";
    const { left, right } = parseDiff(raw);
    expect(left).toHaveLength(2);
    expect(right).toHaveLength(2);
    expect(left[1]).toEqual({ num: 0, content: "", type: "placeholder" });
    expect(right[1]).toEqual({ num: 2, content: "added line", type: "added" });
  });

  it("parses removed lines with placeholder on right", () => {
    const raw = "@@ -1,2 +1,1 @@\n context\n-removed line";
    const { left, right } = parseDiff(raw);
    expect(left).toHaveLength(2);
    expect(right).toHaveLength(2);
    expect(left[1]).toEqual({
      num: 2,
      content: "removed line",
      type: "removed",
    });
    expect(right[1]).toEqual({ num: 0, content: "", type: "placeholder" });
  });

  it("pairs removed and added lines side by side", () => {
    const raw = "@@ -1,1 +1,1 @@\n-old\n+new";
    const { left, right } = parseDiff(raw);
    expect(left).toHaveLength(1);
    expect(right).toHaveLength(1);
    expect(left[0]).toEqual({ num: 1, content: "old", type: "removed" });
    expect(right[0]).toEqual({ num: 1, content: "new", type: "added" });
  });

  it("pads with placeholders when removed/added counts differ", () => {
    const raw = "@@ -1,1 +1,3 @@\n-old\n+new1\n+new2\n+new3";
    const { left, right } = parseDiff(raw);
    expect(left).toHaveLength(3);
    expect(right).toHaveLength(3);
    expect(left[0].type).toBe("removed");
    expect(left[1].type).toBe("placeholder");
    expect(left[2].type).toBe("placeholder");
    expect(right[0].type).toBe("added");
    expect(right[1].type).toBe("added");
    expect(right[2].type).toBe("added");
  });

  it("handles multiple hunks", () => {
    const raw = [
      "@@ -1,1 +1,1 @@",
      "-a",
      "+b",
      "@@ -10,1 +10,1 @@",
      "-c",
      "+d",
    ].join("\n");
    const { left, right } = parseDiff(raw);
    expect(left).toHaveLength(2);
    expect(left[0]).toEqual({ num: 1, content: "a", type: "removed" });
    expect(left[1]).toEqual({ num: 10, content: "c", type: "removed" });
    expect(right[0]).toEqual({ num: 1, content: "b", type: "added" });
    expect(right[1]).toEqual({ num: 10, content: "d", type: "added" });
  });

  it("ignores lines before first hunk header", () => {
    const raw =
      "diff --git a/f b/f\nindex abc..def\n--- a/f\n+++ b/f\n@@ -1,1 +1,1 @@\n-x\n+y";
    const { left, right } = parseDiff(raw);
    expect(left).toHaveLength(1);
    expect(right).toHaveLength(1);
  });

  it("keeps left and right arrays the same length", () => {
    const raw =
      "@@ -1,3 +1,5 @@\n context\n-rm1\n-rm2\n+add1\n+add2\n+add3\n+add4\n context2";
    const { left, right } = parseDiff(raw);
    expect(left.length).toBe(right.length);
  });
});

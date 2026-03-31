import { memo } from "react";
import type { DiffLine, LineType } from "../types";

const lineColor: Record<LineType, string> = {
  added: "bg-diff-add-bg text-diff-add",
  removed: "bg-diff-rm-bg text-diff-rm",
  unchanged: "text-text-secondary",
};

const gutterColor: Record<LineType, string> = {
  added: "text-diff-add-gutter",
  removed: "text-diff-rm-gutter",
  unchanged: "text-text-muted",
};

const DiffColumn = memo(function DiffColumn({
  lines,
  label,
}: {
  lines: DiffLine[];
  label: string;
}) {
  return (
    <div className="flex-1 min-w-0 overflow-auto">
      <div className="sticky top-0 z-10 bg-surface-overlay backdrop-blur-sm border-b border-border-subtle px-4 py-2">
        <span className="text-xs text-text-muted font-mono">{label}</span>
      </div>
      <div className="font-mono text-[13px] leading-6">
        {lines.map(line => (
          <div key={line.num} className={`flex ${lineColor[line.type]}`}>
            <span
              className={`shrink-0 w-12 text-right pr-3 select-none ${gutterColor[line.type]}`}
            >
              {line.num}
            </span>
            <span
              className={`shrink-0 w-5 select-none text-center ${
                line.type === "added"
                  ? "text-diff-add"
                  : line.type === "removed"
                    ? "text-diff-rm"
                    : "text-transparent"
              }`}
            >
              {line.type === "added"
                ? "+"
                : line.type === "removed"
                  ? "−"
                  : " "}
            </span>
            <span className="whitespace-pre pr-4">{line.content || " "}</span>
          </div>
        ))}
      </div>
    </div>
  );
});

export default DiffColumn;

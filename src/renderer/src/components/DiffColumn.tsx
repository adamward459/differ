import { memo, useState, useCallback } from "react";
import { RiAddLine, RiChat3Line } from "@remixicon/react";
import CommentThread from "./CommentThread";
import type { DiffLine, DiffSide, LineType, Comment } from "../types";

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

interface ThreadMap {
  [line: number]: Comment[];
}

const DiffColumn = memo(function DiffColumn({
  lines,
  label,
  side,
  threads,
  onAddComment,
}: {
  lines: DiffLine[];
  label: string;
  side: DiffSide;
  threads: ThreadMap;
  onAddComment: (side: DiffSide, line: number, body: string) => void;
}) {
  const [openLine, setOpenLine] = useState<number | null>(null);

  const handleAdd = useCallback(
    (line: number, body: string) => {
      onAddComment(side, line, body);
    },
    [side, onAddComment],
  );

  const handleClose = useCallback(() => setOpenLine(null), []);

  return (
    <div className="flex-1 min-w-0 overflow-auto">
      <div className="sticky top-0 z-10 bg-surface-overlay backdrop-blur-sm border-b border-border-subtle px-4 py-2">
        <span className="text-xs text-text-muted font-mono">{label}</span>
      </div>
      <div className="font-mono text-[13px] leading-6">
        {lines.map(line => {
          const hasThread = threads[line.num]?.length > 0;
          const isOpen = openLine === line.num;

          return (
            <div key={line.num}>
              <div
                className={`group/line flex ${lineColor[line.type]} relative`}
              >
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
                <span className="whitespace-pre pr-4 flex-1">
                  {line.content || " "}
                </span>
                <span className="shrink-0 flex items-center pr-2 gap-0.5">
                  {hasThread && !isOpen && (
                    <button
                      onClick={() => setOpenLine(line.num)}
                      className="p-0.5 rounded text-accent hover:bg-item-hover"
                      aria-label={`View comments on line ${line.num}`}
                    >
                      <RiChat3Line className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => setOpenLine(isOpen ? null : line.num)}
                    className="p-0.5 rounded text-text-muted hover:text-accent hover:bg-item-hover opacity-0 group-hover/line:opacity-100 transition-opacity"
                    aria-label={`Add comment on line ${line.num}`}
                  >
                    <RiAddLine className="w-3.5 h-3.5" />
                  </button>
                </span>
              </div>
              {isOpen && (
                <CommentThread
                  comments={threads[line.num] ?? []}
                  onAdd={body => handleAdd(line.num, body)}
                  onClose={handleClose}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default DiffColumn;

import { memo, useState, useCallback, type RefObject } from "react";
import { RiAddLine, RiChat3Line } from "@remixicon/react";
import CommentThread from "./CommentThread";
import type { DiffLine, DiffSide, LineType, Comment } from "../types";

const lineColor: Record<LineType, string> = {
  added: "bg-diff-add-bg text-diff-add",
  removed: "bg-diff-rm-bg text-diff-rm",
  unchanged: "text-text-secondary",
  placeholder: "bg-surface-alt",
};

const gutterColor: Record<LineType, string> = {
  added: "text-diff-add-gutter",
  removed: "text-diff-rm-gutter",
  unchanged: "text-text-muted",
  placeholder: "text-transparent",
};

interface ThreadMap {
  [line: number]: { comments: Comment[]; outdated: boolean };
}

const DiffColumn = memo(function DiffColumn({
  lines,
  label,
  side,
  threads,
  onAddComment,
  scrollRef,
  onScroll,
}: {
  lines: DiffLine[];
  label: string;
  side: DiffSide;
  threads: ThreadMap;
  onAddComment: (side: DiffSide, line: number, body: string) => void;
  scrollRef: RefObject<HTMLDivElement | null>;
  onScroll: (source: DiffSide) => void;
}) {
  const [openLine, setOpenLine] = useState<number | null>(null);

  const handleAdd = useCallback(
    (line: number, body: string) => {
      onAddComment(side, line, body);
    },
    [side, onAddComment],
  );

  const handleClose = useCallback(() => setOpenLine(null), []);

  const handleScroll = useCallback(() => onScroll(side), [side, onScroll]);

  return (
    <div
      className="flex-1 min-w-0 overflow-auto"
      ref={scrollRef}
      onScroll={handleScroll}
    >
      <div className="sticky top-0 z-10 bg-surface-overlay backdrop-blur-md border-b border-border-subtle px-4 py-2">
        <span className="text-[11px] text-text-muted font-mono tracking-wide">
          {label}
        </span>
      </div>
      <div className="font-mono text-[13px] leading-7">
        {lines.map((line, idx) => {
          if (line.type === "placeholder") {
            return (
              <div
                key={`ph-${idx}`}
                className={`flex ${lineColor.placeholder}`}
              >
                <span className="shrink-0 w-12">&nbsp;</span>
                <span className="shrink-0 w-5">&nbsp;</span>
                <span className="flex-1">&nbsp;</span>
              </div>
            );
          }

          const hasThread = threads[line.num]?.comments?.length > 0;
          const isOpen = openLine === line.num;

          return (
            <div key={`${line.type}-${line.num}`}>
              <div
                className={`group/line flex ${lineColor[line.type]} relative transition-colors duration-75`}
              >
                <span
                  className={`shrink-0 w-12 text-right pr-3 select-none text-[12px] ${gutterColor[line.type]}`}
                >
                  {line.num}
                </span>
                <span
                  className={`shrink-0 w-5 select-none text-center font-medium ${
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
                <span className="whitespace-pre-wrap break-all pr-4 flex-1">
                  {line.content || " "}
                </span>
                <span className="shrink-0 flex items-center pr-2 gap-0.5">
                  {hasThread && !isOpen && (
                    <button
                      onClick={() => setOpenLine(line.num)}
                      className="p-0.5 rounded-md text-accent hover:bg-accent-soft transition-colors duration-150"
                      aria-label={`View comments on line ${line.num}`}
                      title={`View comments on line ${line.num}`}
                    >
                      <RiChat3Line className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => setOpenLine(isOpen ? null : line.num)}
                    className="p-0.5 rounded-md text-text-muted hover:text-accent hover:bg-accent-soft opacity-0 group-hover/line:opacity-100 transition-all duration-150"
                    aria-label={`Add comment on line ${line.num}`}
                    title={`Add comment on line ${line.num}`}
                  >
                    <RiAddLine className="w-3.5 h-3.5" />
                  </button>
                </span>
              </div>
              {isOpen && (
                <CommentThread
                  comments={threads[line.num]?.comments ?? []}
                  outdated={threads[line.num]?.outdated ?? false}
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

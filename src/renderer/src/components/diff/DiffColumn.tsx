import { memo, useState, useCallback, type RefObject } from "react";
import DiffLineRow from "./DiffLineRow";
import CommentThread from "../comments/CommentThread";
import type { DiffLine, DiffSide, ThreadMap } from "../../types";

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

  const handleToggle = useCallback((lineNum: number) => {
    setOpenLine(prev => (prev === lineNum ? null : lineNum));
  }, []);

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
          const key =
            line.type === "placeholder"
              ? `ph-${idx}`
              : `${line.type}-${line.num}`;
          const hasThread = threads[line.num]?.comments?.length > 0;
          const isOpen = openLine === line.num;

          return (
            <div key={key}>
              <DiffLineRow
                line={line}
                hasThread={hasThread}
                isOpen={isOpen}
                onToggle={handleToggle}
              />
              {isOpen && line.type !== "placeholder" && (
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

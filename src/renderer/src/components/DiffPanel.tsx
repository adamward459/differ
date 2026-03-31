import { memo } from "react";
import DiffColumn from "./DiffColumn";
import type { DiffLine, DiffSide, Comment } from "../types";

interface ThreadMap {
  [line: number]: Comment[];
}

const DiffPanel = memo(function DiffPanel({
  leftLines,
  rightLines,
  fileName,
  additions,
  deletions,
  leftThreads,
  rightThreads,
  onAddComment,
}: {
  leftLines: DiffLine[];
  rightLines: DiffLine[];
  fileName: string;
  additions: number;
  deletions: number;
  leftThreads: ThreadMap;
  rightThreads: ThreadMap;
  onAddComment: (side: DiffSide, line: number, body: string) => void;
}) {
  return (
    <main className="flex-1 flex flex-col min-w-0">
      <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-border bg-surface-alt">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-mono text-text-secondary truncate">
            {fileName}
          </span>
          <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-badge-bg text-badge-text">
            modified
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs font-mono text-diff-add">+{additions}</span>
          <span className="text-xs text-text-muted mx-1">/</span>
          <span className="text-xs font-mono text-diff-rm">−{deletions}</span>
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        <DiffColumn
          lines={leftLines}
          label={`a/${fileName}`}
          side="left"
          threads={leftThreads}
          onAddComment={onAddComment}
        />
        <div className="w-px bg-border shrink-0" />
        <DiffColumn
          lines={rightLines}
          label={`b/${fileName}`}
          side="right"
          threads={rightThreads}
          onAddComment={onAddComment}
        />
      </div>
    </main>
  );
});

export default DiffPanel;

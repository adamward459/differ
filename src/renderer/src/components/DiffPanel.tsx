import { memo, useRef, useCallback, useMemo, useState } from "react";
import { RiFileCopyLine, RiCheckLine } from "@remixicon/react";
import DiffColumn from "./DiffColumn";
import type {
  DiffLine,
  DiffSide,
  Comment,
  CommentThread,
  FileEntry,
} from "../types";

interface ThreadMap {
  [line: number]: { comments: Comment[]; outdated: boolean };
}

const statusBadge: Record<
  NonNullable<FileEntry["status"]>,
  { label: string; cls: string }
> = {
  modified: { label: "modified", cls: "bg-badge-bg text-badge-text" },
  added: { label: "added", cls: "bg-diff-add-bg text-diff-add" },
  untracked: { label: "untracked", cls: "bg-diff-add-bg text-diff-add" },
  deleted: { label: "deleted", cls: "bg-diff-rm-bg text-diff-rm" },
  renamed: { label: "renamed", cls: "bg-badge-bg text-badge-text" },
};

const DiffPanel = memo(function DiffPanel({
  leftLines,
  rightLines,
  fileName,
  additions,
  deletions,
  status,
  leftThreads,
  rightThreads,
  onAddComment,
  threads,
}: {
  leftLines: DiffLine[];
  rightLines: DiffLine[];
  fileName: string;
  additions: number;
  deletions: number;
  status?: FileEntry["status"];
  leftThreads: ThreadMap;
  rightThreads: ThreadMap;
  onAddComment: (side: DiffSide, line: number, body: string) => void;
  threads: CommentThread[];
}) {
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const syncing = useRef(false);

  const activeNonOutdatedThreads = useMemo(
    () =>
      threads.filter(
        t => t.file === fileName && !t.outdated && t.comments.length > 0,
      ),
    [threads, fileName],
  );

  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  const handleCopyComments = useCallback(() => {
    const parts: string[] = [];
    for (const t of activeNonOutdatedThreads) {
      for (const c of t.comments) {
        parts.push(`${t.file}#${t.line}\n${c.body}`);
      }
    }
    if (parts.length === 0) return;
    navigator.clipboard.writeText(parts.join("\n-----\n"));
    setCopied(true);
    clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(false), 1500);
  }, [activeNonOutdatedThreads]);

  const handleScroll = useCallback((source: DiffSide) => {
    if (syncing.current) return;
    syncing.current = true;
    const from = source === "left" ? leftRef.current : rightRef.current;
    const to = source === "left" ? rightRef.current : leftRef.current;
    if (from && to) {
      to.scrollTop = from.scrollTop;
      to.scrollLeft = from.scrollLeft;
    }
    syncing.current = false;
  }, []);

  return (
    <main className="flex-1 flex flex-col min-w-0">
      <div className="shrink-0 flex items-center justify-between px-5 py-3 border-b border-border bg-surface-alt">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-[13px] font-mono font-medium text-text truncate">
            {fileName}
          </span>
          {status && (
            <span
              className={`shrink-0 text-[11px] font-medium px-2.5 py-0.5 rounded-full ${statusBadge[status]?.cls ?? "bg-badge-bg text-badge-text"}`}
            >
              {statusBadge[status]?.label ?? status}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-[12px] font-mono">
          {activeNonOutdatedThreads.length > 0 && (
            <button
              onClick={handleCopyComments}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all duration-150 text-[11px] font-sans ${copied ? "text-diff-add" : "text-text-muted hover:text-text-secondary hover:bg-item-hover"}`}
              aria-label="Copy all comments"
              title="Copy all comments (excludes outdated)"
            >
              {copied ? (
                <RiCheckLine className="w-3.5 h-3.5" />
              ) : (
                <RiFileCopyLine className="w-3.5 h-3.5" />
              )}
              <span>{copied ? "Copied" : "Copy comments"}</span>
            </button>
          )}
          <span className="px-2 py-0.5 rounded-md bg-diff-add-bg text-diff-add font-medium">
            +{additions}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-diff-rm-bg text-diff-rm font-medium">
            −{deletions}
          </span>
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        <DiffColumn
          lines={leftLines}
          label={`a/${fileName}`}
          side="left"
          threads={leftThreads}
          onAddComment={onAddComment}
          scrollRef={leftRef}
          onScroll={handleScroll}
        />
        <div className="w-px bg-border shrink-0" />
        <DiffColumn
          lines={rightLines}
          label={`b/${fileName}`}
          side="right"
          threads={rightThreads}
          onAddComment={onAddComment}
          scrollRef={rightRef}
          onScroll={handleScroll}
        />
      </div>
    </main>
  );
});

export default DiffPanel;

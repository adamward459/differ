import { memo, useRef, useCallback, useMemo, useState } from "react";
import { RiFileCopyLine, RiCheckLine } from "@remixicon/react";
import DiffColumn from "./DiffColumn";
import StatusBadge from "../common/StatusBadge";
import DiffStats from "../common/DiffStats";
import Button from "../common/Button";
import type {
  DiffLine,
  DiffSide,
  CommentThread,
  ThreadMap,
  FileEntry,
} from "../../types";

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
          {status && <StatusBadge status={status} />}
        </div>
        <div className="flex items-center gap-2 text-[12px] font-mono">
          {activeNonOutdatedThreads.length > 0 && (
            <Button
              icon={copied ? RiCheckLine : RiFileCopyLine}
              variant={copied ? "accent" : "ghost"}
              size="sm"
              onClick={handleCopyComments}
              aria-label="Copy all comments"
              title="Copy all comments (excludes outdated)"
              className={copied ? "text-diff-add" : ""}
            >
              {copied ? "Copied" : "Copy comments"}
            </Button>
          )}
          <DiffStats additions={additions} deletions={deletions} />
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

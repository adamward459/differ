import { useState, useCallback, useMemo } from 'react';
import type { DiffLine, DiffSide, CommentThread, ThreadMap } from '../types';

/** Check each thread against current diff lines; mark outdated if content changed. */
function markOutdatedThreads(
  threads: CommentThread[],
  file: string,
  left: DiffLine[],
  right: DiffLine[],
): CommentThread[] {
  let changed = false;
  const updated = threads.map(t => {
    if (t.file !== file || t.lineContent === undefined) return t;
    const lines = t.side === 'left' ? left : right;
    const current = lines.find(l => l.num === t.line);
    const isOutdated = !current || current.content !== t.lineContent;
    if (isOutdated !== !!t.outdated) {
      changed = true;
      return { ...t, outdated: isOutdated };
    }
    return t;
  });
  return changed ? updated : threads;
}

function buildThreadMap(
  threads: CommentThread[],
  file: string | null,
  side: DiffSide,
): ThreadMap {
  const map: ThreadMap = {};
  if (!file) return map;
  for (const t of threads) {
    if (t.file === file && t.side === side)
      map[t.line] = { comments: t.comments, outdated: !!t.outdated };
  }
  return map;
}

export function useThreads(
  activeFile: string | null,
  leftLines: DiffLine[],
  rightLines: DiffLine[],
) {
  const [threads, setThreads] = useState<CommentThread[]>([]);

  const handleAddComment = useCallback(
    (side: DiffSide, line: number, body: string) => {
      if (!activeFile) return;
      const lines = side === 'left' ? leftLines : rightLines;
      const lineContent = lines.find(l => l.num === line)?.content ?? '';
      setThreads(prev => {
        const idx = prev.findIndex(
          t => t.file === activeFile && t.side === side && t.line === line,
        );
        const comment = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          body,
          createdAt: Date.now(),
        };
        if (idx >= 0) {
          const existing = prev[idx];
          const updated = [...prev];
          updated[idx] = {
            ...existing,
            comments: [...existing.comments, comment],
          };
          return updated;
        }
        return [
          ...prev,
          {
            file: activeFile,
            side,
            line,
            comments: [comment],
            lineContent,
            outdated: false,
          },
        ];
      });
    },
    [activeFile, leftLines, rightLines],
  );

  const handleDeleteComment = useCallback(
    (side: DiffSide, line: number, commentId: string) => {
      if (!activeFile) return;
      setThreads(prev => {
        const idx = prev.findIndex(
          t => t.file === activeFile && t.side === side && t.line === line,
        );
        if (idx < 0) return prev;
        const remaining = prev[idx].comments.filter(c => c.id !== commentId);
        if (remaining.length === 0) {
          return prev.filter((_, i) => i !== idx);
        }
        const updated = [...prev];
        updated[idx] = { ...updated[idx], comments: remaining };
        return updated;
      });
    },
    [activeFile],
  );

  const refreshOutdated = useCallback(
    (file: string, left: DiffLine[], right: DiffLine[]) => {
      setThreads(prev => markOutdatedThreads(prev, file, left, right));
    },
    [],
  );

  const leftThreads = useMemo(
    () => buildThreadMap(threads, activeFile, 'left'),
    [threads, activeFile],
  );

  const rightThreads = useMemo(
    () => buildThreadMap(threads, activeFile, 'right'),
    [threads, activeFile],
  );

  return {
    threads,
    leftThreads,
    rightThreads,
    handleAddComment,
    handleDeleteComment,
    refreshOutdated,
  };
}

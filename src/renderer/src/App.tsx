import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { RiFolderOpenLine } from "@remixicon/react";
import Sidebar from "./components/Sidebar";
import DiffPanel from "./components/DiffPanel";
import type { FileEntry, DiffLine, DiffSide, CommentThread } from "./types";
import { parseDiff } from "./utils/parseDiff";

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
    const lines = t.side === "left" ? left : right;
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

function App(): React.JSX.Element {
  const [folderPath, setFolderPath] = useState<string | null>(null);
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [leftLines, setLeftLines] = useState<DiffLine[]>([]);
  const [rightLines, setRightLines] = useState<DiffLine[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [threads, setThreads] = useState<CommentThread[]>([]);

  const handleAddComment = useCallback(
    (side: DiffSide, line: number, body: string) => {
      if (!activeFile) return;
      const lines = side === "left" ? leftLines : rightLines;
      const lineContent = lines.find(l => l.num === line)?.content ?? "";
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
          const updated = [...prev];
          updated[idx] = {
            ...updated[idx],
            comments: [...updated[idx].comments, comment],
            outdated: false,
            lineContent,
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

  const leftThreads = useMemo(() => {
    const map: Record<
      number,
      { comments: CommentThread["comments"]; outdated: boolean }
    > = {};
    if (!activeFile) return map;
    for (const t of threads) {
      if (t.file === activeFile && t.side === "left")
        map[t.line] = { comments: t.comments, outdated: !!t.outdated };
    }
    return map;
  }, [threads, activeFile]);

  const rightThreads = useMemo(() => {
    const map: Record<
      number,
      { comments: CommentThread["comments"]; outdated: boolean }
    > = {};
    if (!activeFile) return map;
    for (const t of threads) {
      if (t.file === activeFile && t.side === "right")
        map[t.line] = { comments: t.comments, outdated: !!t.outdated };
    }
    return map;
  }, [threads, activeFile]);

  const handleOpenFolder = useCallback(async () => {
    const selected = await window.api.openFolder();
    if (!selected) return;

    setFolderPath(selected);
    setLoading(true);
    setError(null);
    setActiveFile(null);
    setLeftLines([]);
    setRightLines([]);

    const result = await window.api.getChangedFiles(selected);
    setLoading(false);

    if (result.error) {
      setError(result.error);
      setFiles([]);
      return;
    }

    const entries: FileEntry[] = (result.files ?? []).map(
      (f: { name: string; status: string }) => ({
        name: f.name,
        additions: 0,
        deletions: 0,
        status: f.status as FileEntry["status"],
      }),
    );
    setFiles(entries);

    // Start watching the new folder
    window.api.watchRepo(selected);
  }, []);

  const handleSelectFile = useCallback(
    async (fileName: string) => {
      if (!folderPath) return;
      setActiveFile(fileName);

      const result = await window.api.getFileDiff(folderPath, fileName);
      if (result.error) return;

      let left: DiffLine[];
      let right: DiffLine[];
      if (result.raw) {
        ({ left, right } = parseDiff(result.raw));
      } else {
        left = (result.leftLines as DiffLine[]) ?? [];
        right = (result.rightLines as DiffLine[]) ?? [];
      }
      setLeftLines(left);
      setRightLines(right);
      setThreads(prev => markOutdatedThreads(prev, fileName, left, right));
    },
    [folderPath],
  );

  // Keep refs in sync for the watcher callback
  const folderRef = useRef(folderPath);
  const activeFileRef = useRef(activeFile);
  folderRef.current = folderPath;
  activeFileRef.current = activeFile;

  // Subscribe to file system changes and refresh
  useEffect(() => {
    const unsubscribe = window.api.onRepoChanged(async () => {
      const fp = folderRef.current;
      if (!fp) return;

      // Refresh file list
      const result = await window.api.getChangedFiles(fp);
      if (result.error) return;

      const entries: FileEntry[] = (result.files ?? []).map(
        (f: { name: string; status: string }) => ({
          name: f.name,
          additions: 0,
          deletions: 0,
          status: f.status as FileEntry["status"],
        }),
      );
      setFiles(entries);

      // Refresh active diff if still in the list
      const af = activeFileRef.current;
      if (af) {
        const stillExists = entries.some(e => e.name === af);
        if (stillExists) {
          const diffResult = await window.api.getFileDiff(fp, af);
          if (!diffResult.error) {
            let left: DiffLine[];
            let right: DiffLine[];
            if (diffResult.raw) {
              ({ left, right } = parseDiff(diffResult.raw));
            } else {
              left = (diffResult.leftLines as DiffLine[]) ?? [];
              right = (diffResult.rightLines as DiffLine[]) ?? [];
            }
            setLeftLines(left);
            setRightLines(right);
            setThreads(prev => markOutdatedThreads(prev, af, left, right));
          }
        } else {
          // File no longer changed — clear diff
          setActiveFile(null);
          setLeftLines([]);
          setRightLines([]);
        }
      }
    });

    return () => {
      unsubscribe();
      window.api.unwatchRepo();
    };
  }, []);

  // No folder selected — show landing
  if (!folderPath) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface text-text">
        <div className="flex flex-col items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-accent-soft flex items-center justify-center">
            <RiFolderOpenLine className="w-7 h-7 text-accent" />
          </div>
          <div className="text-center">
            <p className="text-[15px] font-semibold text-text mb-1">
              Open a repository
            </p>
            <p className="text-[13px] text-text-muted">
              Select a folder to view its changes
            </p>
          </div>
          <button
            onClick={handleOpenFolder}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-white text-[13px] font-medium hover:opacity-90 transition-opacity shadow-sm"
          >
            Open Folder
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-surface text-text overflow-hidden">
      <Sidebar
        files={files}
        activeFile={activeFile}
        onSelectFile={handleSelectFile}
        onOpenFolder={handleOpenFolder}
      />

      {loading && (
        <div className="flex-1 flex items-center justify-center text-text-muted text-[13px]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-5 h-5 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
            <span>Loading…</span>
          </div>
        </div>
      )}

      {error && (
        <div className="flex-1 flex items-center justify-center text-[13px]">
          <div className="px-4 py-3 rounded-xl bg-diff-rm-bg text-diff-rm">
            {error}
          </div>
        </div>
      )}

      {!loading && !error && activeFile && (
        <DiffPanel
          leftLines={leftLines}
          rightLines={rightLines}
          fileName={activeFile}
          additions={rightLines.filter(l => l.type === "added").length}
          deletions={leftLines.filter(l => l.type === "removed").length}
          status={files.find(f => f.name === activeFile)?.status}
          leftThreads={leftThreads}
          rightThreads={rightThreads}
          onAddComment={handleAddComment}
          threads={threads}
        />
      )}

      {!loading && !error && !activeFile && (
        <div className="flex-1 flex items-center justify-center text-text-muted text-[13px]">
          Select a file to view its diff
        </div>
      )}
    </div>
  );
}

export default App;

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { RiFolderOpenLine } from "@remixicon/react";
import Sidebar from "./components/Sidebar";
import DiffPanel from "./components/DiffPanel";
import type { FileEntry, DiffLine, DiffSide, CommentThread } from "./types";
import { parseDiff } from "./utils/parseDiff";

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
          };
          return updated;
        }
        return [...prev, { file: activeFile, side, line, comments: [comment] }];
      });
    },
    [activeFile],
  );

  const leftThreads = useMemo(() => {
    const map: Record<number, CommentThread["comments"]> = {};
    if (!activeFile) return map;
    for (const t of threads) {
      if (t.file === activeFile && t.side === "left") map[t.line] = t.comments;
    }
    return map;
  }, [threads, activeFile]);

  const rightThreads = useMemo(() => {
    const map: Record<number, CommentThread["comments"]> = {};
    if (!activeFile) return map;
    for (const t of threads) {
      if (t.file === activeFile && t.side === "right") map[t.line] = t.comments;
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

      if (result.raw) {
        const { left, right } = parseDiff(result.raw);
        setLeftLines(left);
        setRightLines(right);
      } else {
        setLeftLines((result.leftLines as DiffLine[]) ?? []);
        setRightLines((result.rightLines as DiffLine[]) ?? []);
      }
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
            if (diffResult.raw) {
              const { left, right } = parseDiff(diffResult.raw);
              setLeftLines(left);
              setRightLines(right);
            } else {
              setLeftLines((diffResult.leftLines as DiffLine[]) ?? []);
              setRightLines((diffResult.rightLines as DiffLine[]) ?? []);
            }
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
        <button
          onClick={handleOpenFolder}
          className="flex items-center gap-2 px-5 py-3 rounded-lg bg-accent text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <RiFolderOpenLine className="w-5 h-5" />
          Open Folder
        </button>
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
        <div className="flex-1 flex items-center justify-center text-text-muted text-sm">
          Loading…
        </div>
      )}

      {error && (
        <div className="flex-1 flex items-center justify-center text-diff-rm text-sm">
          {error}
        </div>
      )}

      {!loading && !error && activeFile && (
        <DiffPanel
          leftLines={leftLines}
          rightLines={rightLines}
          fileName={activeFile}
          additions={rightLines.filter(l => l.type === "added").length}
          deletions={leftLines.filter(l => l.type === "removed").length}
          leftThreads={leftThreads}
          rightThreads={rightThreads}
          onAddComment={handleAddComment}
        />
      )}

      {!loading && !error && !activeFile && (
        <div className="flex-1 flex items-center justify-center text-text-muted text-sm">
          Select a file to view its diff
        </div>
      )}
    </div>
  );
}

export default App;

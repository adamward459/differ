import { memo } from "react";
import { RiGitBranchLine, RiFolderOpenLine } from "@remixicon/react";
import FileItem from "./FileItem";
import type { FileEntry } from "../types";

const Sidebar = memo(function Sidebar({
  files,
  activeFile,
  onSelectFile,
  onOpenFolder,
}: {
  files: FileEntry[];
  activeFile: string | null;
  onSelectFile: (name: string) => void;
  onOpenFolder: () => void;
}) {
  return (
    <aside className="w-72 shrink-0 border-r border-border flex flex-col bg-surface-alt">
      <div className="px-4 py-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <RiGitBranchLine className="w-5 h-5 text-accent" />
            <h1 className="text-base font-semibold tracking-tight">Differ</h1>
          </div>
          <button
            onClick={onOpenFolder}
            className="p-1.5 rounded-md hover:bg-item-hover text-text-muted hover:text-text-secondary transition-colors"
            aria-label="Open folder"
          >
            <RiFolderOpenLine className="w-4 h-4" />
          </button>
        </div>
        <div className="text-xs text-text-muted">
          {files.length} files changed
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {files.map(file => (
          <FileItem
            key={file.name}
            name={file.name}
            additions={file.additions}
            deletions={file.deletions}
            status={file.status}
            active={file.name === activeFile}
            onClick={() => onSelectFile(file.name)}
          />
        ))}
      </nav>
    </aside>
  );
});

export default Sidebar;

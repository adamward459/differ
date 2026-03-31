import { memo, useCallback, useRef } from "react";
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
  const navRef = useRef<HTMLElement>(null);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLElement>) => {
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
      e.preventDefault();

      const nav = navRef.current;
      if (!nav) return;

      const items = Array.from(
        nav.querySelectorAll<HTMLButtonElement>("[data-file-item]"),
      );
      if (items.length === 0) return;

      const current = document.activeElement as HTMLElement;
      const idx = items.indexOf(current as HTMLButtonElement);
      let next: number;

      if (e.key === "ArrowDown") {
        next = idx < items.length - 1 ? idx + 1 : 0;
      } else {
        next = idx > 0 ? idx - 1 : items.length - 1;
      }

      items[next].focus();
      onSelectFile(files[next].name);
    },
    [files, onSelectFile],
  );

  return (
    <aside className="w-72 shrink-0 border-r border-border flex flex-col bg-surface-alt">
      <div className="px-4 pt-5 pb-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-accent-soft flex items-center justify-center">
              <RiGitBranchLine className="w-4 h-4 text-accent" />
            </div>
            <h1 className="text-[15px] font-semibold tracking-tight text-text">
              Differ
            </h1>
          </div>
          <button
            onClick={onOpenFolder}
            className="p-1.5 rounded-lg hover:bg-item-hover text-text-muted hover:text-text-secondary transition-all duration-150"
            aria-label="Open folder"
            title="Open folder"
          >
            <RiFolderOpenLine className="w-4 h-4" />
          </button>
        </div>
        <div className="text-[11px] font-medium uppercase tracking-widest text-text-muted">
          {files.length} changed {files.length === 1 ? "file" : "files"}
        </div>
      </div>

      <nav
        ref={navRef}
        role="listbox"
        aria-label="Changed files"
        onKeyDown={handleKeyDown}
        className="flex-1 overflow-y-auto p-2 space-y-0.5"
      >
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

import { memo } from "react";
import { RiGitBranchLine } from "@remixicon/react";
import FileItem from "./FileItem";
import type { FileEntry } from "../types";

const Sidebar = memo(function Sidebar({ files }: { files: FileEntry[] }) {
  return (
    <aside className="w-72 shrink-0 border-r border-neutral-800 flex flex-col bg-neutral-900/50">
      <div className="px-4 py-4 border-b border-neutral-800">
        <div className="flex items-center gap-2 mb-3">
          <RiGitBranchLine className="w-5 h-5 text-blue-400" />
          <h1 className="text-base font-semibold tracking-tight">Differ</h1>
        </div>
        <div className="text-xs text-neutral-500">
          {files.length} files changed
          <span className="mx-1.5">·</span>
          <span className="text-green-500">
            +{files.reduce((s, f) => s + f.additions, 0)}
          </span>
          <span className="mx-1">·</span>
          <span className="text-red-500">
            −{files.reduce((s, f) => s + f.deletions, 0)}
          </span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {files.map((file, i) => (
          <FileItem
            key={file.name}
            name={file.name}
            additions={file.additions}
            deletions={file.deletions}
            active={i === 1}
          />
        ))}
      </nav>
    </aside>
  );
});

export default Sidebar;

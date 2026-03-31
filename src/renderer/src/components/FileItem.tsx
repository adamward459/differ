import { memo } from "react";
import { RiFileCodeLine } from "@remixicon/react";

const FileItem = memo(function FileItem({
  name,
  additions,
  deletions,
  active,
}: {
  name: string;
  additions: number;
  deletions: number;
  active: boolean;
}) {
  return (
    <button
      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
        active
          ? "bg-item-active text-text"
          : "text-text-muted hover:bg-item-hover hover:text-text-secondary"
      }`}
    >
      <div className="flex items-center gap-2 min-w-0">
        <RiFileCodeLine className="shrink-0 w-4 h-4 text-text-muted" />
        <span className="truncate text-sm font-mono">{name}</span>
      </div>
      <div className="flex gap-2 mt-1 ml-6 text-xs font-mono">
        {additions > 0 && <span className="text-diff-add">+{additions}</span>}
        {deletions > 0 && <span className="text-diff-rm">−{deletions}</span>}
      </div>
    </button>
  );
});

export default FileItem;

import { memo } from "react";
import { RiFileCodeLine } from "@remixicon/react";

const statusLabel: Record<string, string> = {
  modified: "M",
  added: "A",
  untracked: "U",
  deleted: "D",
  renamed: "R",
};

const statusColor: Record<string, string> = {
  modified: "text-accent",
  added: "text-diff-add",
  untracked: "text-diff-add",
  deleted: "text-diff-rm",
  renamed: "text-accent",
};

const FileItem = memo(function FileItem({
  name,
  additions,
  deletions,
  status,
  active,
  onClick,
}: {
  name: string;
  additions: number;
  deletions: number;
  status?: string;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      data-file-item
      role="option"
      aria-selected={active}
      tabIndex={active ? 0 : -1}
      onClick={onClick}
      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
        active
          ? "bg-item-active text-text"
          : "text-text-muted hover:bg-item-hover hover:text-text-secondary"
      } focus-visible:outline-2 focus-visible:outline-accent`}
    >
      <div className="flex items-center gap-2 min-w-0">
        <RiFileCodeLine className="shrink-0 w-4 h-4 text-text-muted" />
        <span className="truncate text-sm font-mono flex-1">{name}</span>
        {status && (
          <span
            className={`shrink-0 text-xs font-mono ${statusColor[status] ?? "text-text-muted"}`}
          >
            {statusLabel[status] ?? status}
          </span>
        )}
      </div>
      {(additions > 0 || deletions > 0) && (
        <div className="flex gap-2 mt-1 ml-6 text-xs font-mono">
          {additions > 0 && <span className="text-diff-add">+{additions}</span>}
          {deletions > 0 && <span className="text-diff-rm">−{deletions}</span>}
        </div>
      )}
    </button>
  );
});

export default FileItem;

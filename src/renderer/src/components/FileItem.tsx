import { memo } from "react";
import {
  RiFileCodeLine,
  RiAddCircleLine,
  RiCloseCircleLine,
  RiEditLine,
  RiQuestionLine,
  RiArrowLeftRightLine,
} from "@remixicon/react";

const statusConfig: Record<
  string,
  { label: string; color: string; Icon: typeof RiEditLine }
> = {
  modified: { label: "M", color: "text-accent", Icon: RiEditLine },
  added: { label: "A", color: "text-diff-add", Icon: RiAddCircleLine },
  untracked: { label: "U", color: "text-diff-add", Icon: RiQuestionLine },
  deleted: { label: "D", color: "text-diff-rm", Icon: RiCloseCircleLine },
  renamed: { label: "R", color: "text-accent", Icon: RiArrowLeftRightLine },
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
  const cfg = status ? statusConfig[status] : undefined;

  return (
    <button
      data-file-item
      role="option"
      aria-selected={active}
      tabIndex={active ? 0 : -1}
      onClick={onClick}
      className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-150 group ${
        active
          ? "bg-item-active text-text shadow-[inset_0_0_0_1px_var(--border)]"
          : "text-text-secondary hover:bg-item-hover hover:text-text"
      } focus-visible:outline-2 focus-visible:outline-accent`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <RiFileCodeLine
          className={`shrink-0 w-4 h-4 transition-colors duration-150 ${
            active
              ? "text-accent"
              : "text-text-muted group-hover:text-text-secondary"
          }`}
        />
        <span className="truncate text-[13px] font-mono flex-1">{name}</span>
        {cfg && (
          <span
            className={`shrink-0 text-[11px] font-semibold font-mono ${cfg.color}`}
          >
            {cfg.label}
          </span>
        )}
      </div>
      {(additions > 0 || deletions > 0) && (
        <div className="flex gap-2 mt-1 ml-[26px] text-[11px] font-mono">
          {additions > 0 && <span className="text-diff-add">+{additions}</span>}
          {deletions > 0 && <span className="text-diff-rm">−{deletions}</span>}
        </div>
      )}
    </button>
  );
});

export default FileItem;

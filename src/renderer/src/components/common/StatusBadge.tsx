import { memo } from "react";
import type { FileEntry } from "../../types";

const badgeStyles: Record<
  NonNullable<FileEntry["status"]>,
  { label: string; abbr: string; cls: string }
> = {
  modified: {
    label: "modified",
    abbr: "M",
    cls: "bg-badge-bg text-badge-text",
  },
  added: { label: "added", abbr: "A", cls: "bg-diff-add-bg text-diff-add" },
  untracked: {
    label: "untracked",
    abbr: "U",
    cls: "bg-diff-add-bg text-diff-add",
  },
  deleted: { label: "deleted", abbr: "D", cls: "bg-diff-rm-bg text-diff-rm" },
  renamed: { label: "renamed", abbr: "R", cls: "bg-badge-bg text-badge-text" },
};

const StatusBadge = memo(function StatusBadge({
  status,
  compact = false,
}: {
  status: NonNullable<FileEntry["status"]>;
  compact?: boolean;
}) {
  const cfg = badgeStyles[status];
  if (!cfg) return null;

  return (
    <span
      className={`shrink-0 font-medium ${cfg.cls} ${
        compact
          ? "text-[11px] font-semibold font-mono"
          : "text-[11px] px-2.5 py-0.5 rounded-full"
      }`}
    >
      {compact ? cfg.abbr : cfg.label}
    </span>
  );
});

export default StatusBadge;

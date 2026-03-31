import { memo } from "react";
import DiffColumn from "./DiffColumn";
import type { DiffLine } from "../types";

const DiffPanel = memo(function DiffPanel({
  leftLines,
  rightLines,
  fileName,
  additions,
  deletions,
}: {
  leftLines: DiffLine[];
  rightLines: DiffLine[];
  fileName: string;
  additions: number;
  deletions: number;
}) {
  return (
    <main className="flex-1 flex flex-col min-w-0">
      <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-neutral-800 bg-neutral-900/30">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-mono text-neutral-300 truncate">
            {fileName}
          </span>
          <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400">
            modified
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs font-mono text-green-500">+{additions}</span>
          <span className="text-xs text-neutral-600 mx-1">/</span>
          <span className="text-xs font-mono text-red-500">−{deletions}</span>
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        <DiffColumn lines={leftLines} label={`a/${fileName}`} />
        <div className="w-px bg-neutral-800 shrink-0" />
        <DiffColumn lines={rightLines} label={`b/${fileName}`} />
      </div>
    </main>
  );
});

export default DiffPanel;

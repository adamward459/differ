import { memo } from "react";

const DiffStats = memo(function DiffStats({
  additions,
  deletions,
}: {
  additions: number;
  deletions: number;
}) {
  if (additions === 0 && deletions === 0) return null;

  return (
    <div className="flex items-center gap-2 text-[12px] font-mono">
      {additions > 0 && (
        <span className="px-2 py-0.5 rounded-md bg-diff-add-bg text-diff-add font-medium">
          +{additions}
        </span>
      )}
      {deletions > 0 && (
        <span className="px-2 py-0.5 rounded-md bg-diff-rm-bg text-diff-rm font-medium">
          −{deletions}
        </span>
      )}
    </div>
  );
});

export default DiffStats;

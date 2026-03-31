import { memo } from "react";
import { RiAddLine, RiChat3Line } from "@remixicon/react";
import type { DiffLine, LineType } from "../../types";

const lineColor: Record<LineType, string> = {
  added: "bg-diff-add-bg text-diff-add",
  removed: "bg-diff-rm-bg text-diff-rm",
  unchanged: "text-text-secondary",
  placeholder: "bg-surface-alt",
};

const gutterColor: Record<LineType, string> = {
  added: "text-diff-add-gutter",
  removed: "text-diff-rm-gutter",
  unchanged: "text-text-muted",
  placeholder: "text-transparent",
};

const prefixChar: Record<LineType, string> = {
  added: "+",
  removed: "−",
  unchanged: " ",
  placeholder: " ",
};

const DiffLineRow = memo(function DiffLineRow({
  line,
  hasThread,
  isOpen,
  onToggle,
}: {
  line: DiffLine;
  hasThread: boolean;
  isOpen: boolean;
  onToggle: (lineNum: number) => void;
}) {
  if (line.type === "placeholder") {
    return (
      <div className={`flex ${lineColor.placeholder}`}>
        <span className="shrink-0 w-12">&nbsp;</span>
        <span className="shrink-0 w-5">&nbsp;</span>
        <span className="flex-1">&nbsp;</span>
      </div>
    );
  }

  return (
    <div
      className={`group/line flex ${lineColor[line.type]} relative transition-colors duration-75`}
    >
      <span
        className={`shrink-0 w-12 text-right pr-3 select-none text-[12px] ${gutterColor[line.type]}`}
      >
        {line.num}
      </span>
      <span
        className={`shrink-0 w-5 select-none text-center font-medium ${
          line.type === "added"
            ? "text-diff-add"
            : line.type === "removed"
              ? "text-diff-rm"
              : "text-transparent"
        }`}
      >
        {prefixChar[line.type]}
      </span>
      <span className="whitespace-pre-wrap break-all pr-4 flex-1">
        {line.content || " "}
      </span>
      <span className="shrink-0 flex items-center pr-2 gap-0.5">
        {hasThread && !isOpen && (
          <button
            onClick={() => onToggle(line.num)}
            className="p-0.5 rounded-md text-accent hover:bg-accent-soft transition-colors duration-150"
            aria-label={`View comments on line ${line.num}`}
            title={`View comments on line ${line.num}`}
          >
            <RiChat3Line className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          onClick={() => onToggle(line.num)}
          className="p-0.5 rounded-md text-text-muted hover:text-accent hover:bg-accent-soft opacity-0 group-hover/line:opacity-100 transition-all duration-150"
          aria-label={`Add comment on line ${line.num}`}
          title={`Add comment on line ${line.num}`}
        >
          <RiAddLine className="w-3.5 h-3.5" />
        </button>
      </span>
    </div>
  );
});

export default DiffLineRow;

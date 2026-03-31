import { memo, useState, useCallback, useRef, useEffect } from "react";
import { RiSendPlaneFill, RiCloseLine, RiHistoryLine } from "@remixicon/react";
import IconButton from "../common/IconButton";
import type { Comment } from "../../types";

const CommentThread = memo(function CommentThread({
  comments,
  outdated,
  onAdd,
  onClose,
}: {
  comments: Comment[];
  outdated: boolean;
  onAdd: (body: string) => void;
  onClose: () => void;
}) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setValue("");
  }, [value, onAdd]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleSubmit();
      }
      if (e.key === "Escape") {
        onClose();
      }
    },
    [handleSubmit, onClose],
  );

  return (
    <div className="border border-comment-border rounded-xl bg-comment-bg mx-3 my-1.5 shadow-sm overflow-hidden">
      {outdated && (
        <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-badge-bg text-badge-text text-[11px] font-medium border-b border-comment-border">
          <RiHistoryLine className="w-3.5 h-3.5 shrink-0" />
          <span>
            Outdated — this code has changed since these comments were added
          </span>
        </div>
      )}
      {comments.length > 0 && (
        <div className="divide-y divide-comment-border">
          {comments.map(c => (
            <div
              key={c.id}
              className="px-3.5 py-2.5 text-[12px] leading-relaxed text-text-secondary whitespace-pre-wrap"
            >
              {c.body}
            </div>
          ))}
        </div>
      )}
      <div className="flex items-start gap-1.5 p-2.5 border-t border-comment-border">
        <textarea
          ref={inputRef}
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a comment… (⌘↵ to send)"
          rows={2}
          className="flex-1 text-[12px] bg-comment-input-bg text-text rounded-lg px-3 py-2 resize-none border border-border-subtle focus:border-accent focus:ring-1 focus:ring-accent/20 focus:outline-none transition-all duration-150"
        />
        <IconButton
          icon={RiSendPlaneFill}
          variant="accent"
          size="sm"
          onClick={handleSubmit}
          disabled={!value.trim()}
          aria-label="Submit comment"
          title="Submit comment"
        />
        <IconButton
          icon={RiCloseLine}
          variant="ghost"
          size="sm"
          onClick={onClose}
          aria-label="Close comment"
          title="Close comment"
        />
      </div>
    </div>
  );
});

export default CommentThread;

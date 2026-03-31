import { memo, useState, useCallback, useRef, useEffect } from "react";
import { RiSendPlaneFill, RiCloseLine } from "@remixicon/react";
import type { Comment } from "../types";

const CommentThread = memo(function CommentThread({
  comments,
  onAdd,
  onClose,
}: {
  comments: Comment[];
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
    <div className="border border-comment-border rounded-lg bg-comment-bg mx-2 my-1 shadow-sm">
      {comments.length > 0 && (
        <div className="divide-y divide-comment-border">
          {comments.map(c => (
            <div
              key={c.id}
              className="px-3 py-2 text-xs text-text-secondary whitespace-pre-wrap"
            >
              {c.body}
            </div>
          ))}
        </div>
      )}
      <div className="flex items-start gap-1 p-2 border-t border-comment-border">
        <textarea
          ref={inputRef}
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a comment… (⌘↵ to send)"
          rows={2}
          className="flex-1 text-xs bg-comment-input-bg text-text rounded px-2 py-1.5 resize-none border border-border-subtle focus:border-accent focus:outline-none"
        />
        <button
          onClick={handleSubmit}
          disabled={!value.trim()}
          className="shrink-0 p-1.5 rounded text-accent hover:bg-item-hover disabled:opacity-30 transition-opacity"
          aria-label="Submit comment"
        >
          <RiSendPlaneFill className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onClose}
          className="shrink-0 p-1.5 rounded text-text-muted hover:bg-item-hover transition-opacity"
          aria-label="Close comment"
        >
          <RiCloseLine className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
});

export default CommentThread;

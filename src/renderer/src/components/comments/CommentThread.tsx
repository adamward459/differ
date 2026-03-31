import { memo, useState, useCallback, useRef, useEffect } from "react";
import {
  RiSendPlaneFill,
  RiCloseLine,
  RiHistoryLine,
  RiDeleteBinLine,
  RiArrowDownSLine,
  RiArrowRightSLine,
} from "@remixicon/react";
import IconButton from "../common/IconButton";
import type { Comment } from "../../types";

const CommentThread = memo(function CommentThread({
  comments,
  outdated,
  onAdd,
  onDelete,
  onClose,
}: {
  comments: Comment[];
  outdated: boolean;
  onAdd: (body: string) => void;
  onDelete: (commentId: string) => void;
  onClose: () => void;
}) {
  const [value, setValue] = useState("");
  const [collapsed, setCollapsed] = useState(outdated);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!collapsed) inputRef.current?.focus();
  }, [collapsed]);

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

  const hasComments = comments.length > 0;

  return (
    <div className="border border-comment-border rounded-xl bg-comment-bg mx-3 my-1.5 shadow-sm overflow-hidden">
      {hasComments && (
        <div className="flex items-center gap-1 px-2.5 py-1.5 border-b border-comment-border">
          <button
            type="button"
            onClick={() => setCollapsed(prev => !prev)}
            className="flex items-center gap-1 text-[11px] font-medium text-text-muted hover:text-text-secondary transition-colors duration-150"
            aria-expanded={!collapsed}
            aria-label="Toggle thread"
          >
            {collapsed ? (
              <RiArrowRightSLine className="w-3.5 h-3.5" />
            ) : (
              <RiArrowDownSLine className="w-3.5 h-3.5" />
            )}
            <span>
              {comments.length} {comments.length === 1 ? "comment" : "comments"}
            </span>
          </button>
          <span className="flex-1" />
          <IconButton
            icon={RiCloseLine}
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="!p-0.5 !rounded-md"
            aria-label="Close comment"
            title="Close comment"
          />
        </div>
      )}
      {outdated && (
        <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-badge-bg text-badge-text text-[11px] font-medium border-b border-comment-border">
          <RiHistoryLine className="w-3.5 h-3.5 shrink-0" />
          <span>
            Outdated — this code has changed since these comments were added
          </span>
        </div>
      )}
      {(!hasComments || !collapsed) && (
        <>
          {hasComments && (
            <div className="divide-y divide-comment-border">
              {comments.map(c => (
                <div
                  key={c.id}
                  className="group/comment flex items-start gap-1 px-3.5 py-2.5 text-[12px] leading-relaxed text-text-secondary"
                >
                  <span className="whitespace-pre-wrap flex-1">{c.body}</span>
                  <IconButton
                    icon={RiDeleteBinLine}
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(c.id)}
                    className="!p-0.5 !rounded-md opacity-0 group-hover/comment:opacity-100 shrink-0"
                    aria-label={`Delete comment`}
                    title="Delete comment"
                  />
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
            {!hasComments && (
              <IconButton
                icon={RiCloseLine}
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="!p-0.5 !rounded-md"
                aria-label="Close comment"
                title="Close comment"
              />
            )}
          </div>
        </>
      )}
    </div>
  );
});

export default CommentThread;

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import CommentThread from "../components/comments/CommentThread";
import type { Comment } from "../types";

describe("CommentThread", () => {
  const onAdd = vi.fn();
  const onClose = vi.fn();

  afterEach(() => {
    onAdd.mockClear();
    onClose.mockClear();
  });

  it("renders existing comments", () => {
    const comments: Comment[] = [
      { id: "1", body: "First comment", createdAt: 1000 },
      { id: "2", body: "Second comment", createdAt: 2000 },
    ];
    render(
      <CommentThread
        comments={comments}
        outdated={false}
        onAdd={onAdd}
        onClose={onClose}
      />,
    );
    expect(screen.getByText("First comment")).toBeInTheDocument();
    expect(screen.getByText("Second comment")).toBeInTheDocument();
  });

  it("shows outdated banner when outdated is true", () => {
    render(
      <CommentThread
        comments={[]}
        outdated={true}
        onAdd={onAdd}
        onClose={onClose}
      />,
    );
    expect(screen.getByText(/Outdated/)).toBeInTheDocument();
  });

  it("does not show outdated banner when outdated is false", () => {
    render(
      <CommentThread
        comments={[]}
        outdated={false}
        onAdd={onAdd}
        onClose={onClose}
      />,
    );
    expect(screen.queryByText(/Outdated/)).not.toBeInTheDocument();
  });

  it("focuses textarea on mount", () => {
    render(
      <CommentThread
        comments={[]}
        outdated={false}
        onAdd={onAdd}
        onClose={onClose}
      />,
    );
    const textarea = screen.getByPlaceholderText(/Add a comment/);
    expect(document.activeElement).toBe(textarea);
  });

  it("submits comment on button click", () => {
    render(
      <CommentThread
        comments={[]}
        outdated={false}
        onAdd={onAdd}
        onClose={onClose}
      />,
    );
    const textarea = screen.getByPlaceholderText(/Add a comment/);
    fireEvent.change(textarea, { target: { value: "new comment" } });
    fireEvent.click(screen.getByTitle("Submit comment"));
    expect(onAdd).toHaveBeenCalledWith("new comment");
  });

  it("does not submit empty comment", () => {
    render(
      <CommentThread
        comments={[]}
        outdated={false}
        onAdd={onAdd}
        onClose={onClose}
      />,
    );
    fireEvent.click(screen.getByTitle("Submit comment"));
    expect(onAdd).not.toHaveBeenCalled();
  });

  it("clears textarea after submit", () => {
    render(
      <CommentThread
        comments={[]}
        outdated={false}
        onAdd={onAdd}
        onClose={onClose}
      />,
    );
    const textarea = screen.getByPlaceholderText(
      /Add a comment/,
    ) as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: "test" } });
    fireEvent.click(screen.getByTitle("Submit comment"));
    expect(textarea.value).toBe("");
  });

  it("calls onClose when close button is clicked", () => {
    render(
      <CommentThread
        comments={[]}
        outdated={false}
        onAdd={onAdd}
        onClose={onClose}
      />,
    );
    fireEvent.click(screen.getByTitle("Close comment"));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("calls onClose on Escape key", () => {
    render(
      <CommentThread
        comments={[]}
        outdated={false}
        onAdd={onAdd}
        onClose={onClose}
      />,
    );
    const textarea = screen.getByPlaceholderText(/Add a comment/);
    fireEvent.keyDown(textarea, { key: "Escape" });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("submits on Cmd+Enter", () => {
    render(
      <CommentThread
        comments={[]}
        outdated={false}
        onAdd={onAdd}
        onClose={onClose}
      />,
    );
    const textarea = screen.getByPlaceholderText(/Add a comment/);
    fireEvent.change(textarea, { target: { value: "cmd enter" } });
    fireEvent.keyDown(textarea, { key: "Enter", metaKey: true });
    expect(onAdd).toHaveBeenCalledWith("cmd enter");
  });
});

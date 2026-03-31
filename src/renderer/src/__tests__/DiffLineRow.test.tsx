import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import DiffLineRow from "../components/diff/DiffLineRow";
import type { DiffLine } from "../types";

describe("DiffLineRow", () => {
  const onToggle = vi.fn();

  afterEach(() => {
    onToggle.mockClear();
  });

  it("renders placeholder as empty row", () => {
    const line: DiffLine = { num: 0, content: "", type: "placeholder" };
    const { container } = render(
      <DiffLineRow
        line={line}
        hasThread={false}
        isOpen={false}
        onToggle={onToggle}
      />,
    );
    // Placeholder should not show line number or add button
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(container.textContent?.trim()).toBe("");
  });

  it("renders added line with line number and + prefix", () => {
    const line: DiffLine = { num: 5, content: "new code", type: "added" };
    const { container } = render(
      <DiffLineRow
        line={line}
        hasThread={false}
        isOpen={false}
        onToggle={onToggle}
      />,
    );
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("new code")).toBeInTheDocument();
    expect(container.textContent).toContain("+");
  });

  it("renders removed line with − prefix", () => {
    const line: DiffLine = { num: 3, content: "old code", type: "removed" };
    const { container } = render(
      <DiffLineRow
        line={line}
        hasThread={false}
        isOpen={false}
        onToggle={onToggle}
      />,
    );
    expect(screen.getByText("old code")).toBeInTheDocument();
    expect(container.textContent).toContain("−");
  });

  it("shows thread indicator when hasThread is true and not open", () => {
    const line: DiffLine = { num: 1, content: "code", type: "unchanged" };
    render(
      <DiffLineRow
        line={line}
        hasThread={true}
        isOpen={false}
        onToggle={onToggle}
      />,
    );
    expect(screen.getByTitle("View comments on line 1")).toBeInTheDocument();
  });

  it("hides thread indicator when isOpen is true", () => {
    const line: DiffLine = { num: 1, content: "code", type: "unchanged" };
    render(
      <DiffLineRow
        line={line}
        hasThread={true}
        isOpen={true}
        onToggle={onToggle}
      />,
    );
    expect(
      screen.queryByTitle("View comments on line 1"),
    ).not.toBeInTheDocument();
  });

  it("calls onToggle when add comment button is clicked", () => {
    const line: DiffLine = { num: 7, content: "code", type: "unchanged" };
    render(
      <DiffLineRow
        line={line}
        hasThread={false}
        isOpen={false}
        onToggle={onToggle}
      />,
    );
    fireEvent.click(screen.getByTitle("Add comment on line 7"));
    expect(onToggle).toHaveBeenCalledWith(7);
  });
});

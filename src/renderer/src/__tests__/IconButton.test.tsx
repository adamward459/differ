import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import IconButton from "../components/common/IconButton";

function MockIcon({ className }: { className?: string }) {
  return <svg data-testid="icon" className={className} />;
}

describe("IconButton", () => {
  it("renders the icon", () => {
    render(<IconButton icon={MockIcon} aria-label="test" />);
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const onClick = vi.fn();
    render(<IconButton icon={MockIcon} onClick={onClick} aria-label="test" />);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("is disabled when disabled prop is set", () => {
    render(<IconButton icon={MockIcon} disabled aria-label="test" />);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("applies accent variant styles", () => {
    render(<IconButton icon={MockIcon} variant="accent" aria-label="test" />);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("text-accent");
  });
});

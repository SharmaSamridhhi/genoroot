import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { YesNoSwipeCard } from "@/components/inputs/YesNoSwipeCard";

describe("YesNoSwipeCard", () => {
  it("has visibly labeled Yes/No buttons that work by click alone (laptop path)", async () => {
    const onChange = vi.fn();
    render(<YesNoSwipeCard value={null} onChange={onChange} />);

    await userEvent.click(screen.getByRole("button", { name: "Yes" }));
    expect(onChange).toHaveBeenCalledWith(true);

    await userEvent.click(screen.getByRole("button", { name: "No" }));
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it("reflects the current value via aria-pressed on the matching button", () => {
    render(<YesNoSwipeCard value={true} onChange={() => {}} />);
    expect(screen.getByRole("button", { name: "Yes" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(screen.getByRole("button", { name: "No" })).toHaveAttribute(
      "aria-pressed",
      "false"
    );
  });

  it("both buttons are present even before any answer is given", () => {
    render(<YesNoSwipeCard value={null} onChange={() => {}} />);
    expect(screen.getByRole("button", { name: "Yes" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "No" })).toBeInTheDocument();
  });
});

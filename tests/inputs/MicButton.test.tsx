import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MicButton } from "@/components/inputs/MicButton";

describe("MicButton", () => {
  it("renders nothing when isSupported is false — never a dead mic button", () => {
    const { container } = render(
      <MicButton
        isSupported={false}
        isListening={false}
        error={null}
        onStart={() => {}}
        onStop={() => {}}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("calls onStart when idle and clicked", async () => {
    const onStart = vi.fn();
    render(
      <MicButton
        isSupported
        isListening={false}
        error={null}
        onStart={onStart}
        onStop={() => {}}
      />
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Speak your answer" })
    );
    expect(onStart).toHaveBeenCalled();
  });

  it("calls onStop when listening and clicked", async () => {
    const onStop = vi.fn();
    render(
      <MicButton
        isSupported
        isListening
        error={null}
        onStart={() => {}}
        onStop={onStop}
      />
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Stop recording" })
    );
    expect(onStop).toHaveBeenCalled();
  });

  it("shows a non-blocking inline error message rather than a modal", () => {
    render(
      <MicButton
        isSupported
        isListening={false}
        error="Mic access denied — you can type instead"
        onStart={() => {}}
        onStop={() => {}}
      />
    );
    expect(
      screen.getByText("Mic access denied — you can type instead")
    ).toBeInTheDocument();
    // The button itself must still be present and clickable — no dead end.
    expect(screen.getByRole("button")).toBeInTheDocument();
  });
});

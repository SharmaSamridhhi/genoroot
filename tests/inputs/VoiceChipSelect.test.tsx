import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { VoiceChipSelect } from "@/components/inputs/VoiceChipSelect";
import { useVoiceInput } from "@/lib/voice/useVoiceInput";
import { interpretTranscript } from "@/lib/voice/interpretTranscript";

vi.mock("@/lib/voice/useVoiceInput");
vi.mock("@/lib/voice/interpretTranscript");

const OPTIONS = ["Less than 6 months", "6-12 months", "Over a year"];

// isListening has to actually flip to false once stop() is called, matching
// the real hook — a static mockReturnValue would leave every re-render
// stuck at isListening: true.
function mockListening(transcript: string) {
  const state = { isListening: true };
  const stop = vi.fn(() => {
    state.isListening = false;
  });
  vi.mocked(useVoiceInput).mockImplementation(() => ({
    isSupported: true,
    isListening: state.isListening,
    transcript,
    error: null,
    level: 0,
    start: vi.fn(),
    stop,
  }));
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("VoiceChipSelect", () => {
  it("commits a high-confidence match directly — no tap-to-confirm needed", async () => {
    const onChange = vi.fn();
    mockListening("less than 6 months");
    vi.mocked(interpretTranscript).mockResolvedValue({
      suggestedOptions: ["Less than 6 months"],
      confidence: "high",
    });

    render(
      <VoiceChipSelect
        questionKey="duration"
        options={OPTIONS}
        mode="single"
        value={null}
        onChange={onChange}
      />
    );

    await userEvent.click(
      screen.getByRole("button", { name: "Stop recording" })
    );

    await waitFor(() =>
      expect(onChange).toHaveBeenCalledWith("Less than 6 months")
    );
    expect(screen.queryByText("Did you mean:")).not.toBeInTheDocument();
  });

  it("asks for explicit confirmation on a low-confidence match, and does not write until tapped", async () => {
    const onChange = vi.fn();
    mockListening("something unclear");
    vi.mocked(interpretTranscript).mockResolvedValue({
      suggestedOptions: ["6-12 months"],
      confidence: "low",
    });

    render(
      <VoiceChipSelect
        questionKey="duration"
        options={OPTIONS}
        mode="single"
        value={null}
        onChange={onChange}
      />
    );

    await userEvent.click(
      screen.getByRole("button", { name: "Stop recording" })
    );

    await waitFor(() =>
      expect(screen.getByText("Did you mean:")).toBeInTheDocument()
    );
    expect(onChange).not.toHaveBeenCalled();

    // "6-12 months" appears both as a normal chip and as the suggestion —
    // scope the click to the suggestion box specifically.
    const suggestionBox = screen.getByText("Did you mean:").parentElement!;
    await userEvent.click(
      within(suggestionBox).getByRole("button", { name: "6-12 months" })
    );
    expect(onChange).toHaveBeenCalledWith("6-12 months");
  });
});

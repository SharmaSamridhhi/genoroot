import { describe, it, expect, vi, afterEach } from "vitest";
import { interpretTranscript } from "@/lib/voice/interpretTranscript";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("interpretTranscript", () => {
  it("resolves a clear local match without any network call to /api/parse", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    const result = await interpretTranscript(
      "it's been over a year",
      "choice_match",
      ["Less than 6 months", "6-12 months", "Over a year"]
    );

    expect(result).toEqual({
      suggestedOptions: ["Over a year"],
      confidence: "high",
    });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("falls through to /api/parse when the local match is inconclusive", async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ matchedOptions: ["Saliva"], confidence: "high" }),
    });
    vi.stubGlobal("fetch", fetchSpy);

    const result = await interpretTranscript(
      "whichever is easiest honestly",
      "choice_match",
      ["Saliva", "Blood", "Either"]
    );

    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/parse",
      expect.objectContaining({ method: "POST" })
    );
    expect(result).toEqual({
      suggestedOptions: ["Saliva"],
      confidence: "high",
    });
  });

  it("always calls /api/parse for free_text — there's no local matching for open text", async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ text: "Cleaned up text.", confidence: "high" }),
    });
    vi.stubGlobal("fetch", fetchSpy);

    const result = await interpretTranscript(
      "uh some rambling answer",
      "free_text"
    );

    expect(fetchSpy).toHaveBeenCalled();
    expect(result).toEqual({
      suggestedText: "Cleaned up text.",
      confidence: "high",
    });
  });

  it("never throws — falls back to the raw transcript when the network call fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));

    const result = await interpretTranscript(
      "some free text answer",
      "free_text"
    );

    expect(result).toEqual({
      suggestedText: "some free text answer",
      confidence: "low",
    });
  });
});

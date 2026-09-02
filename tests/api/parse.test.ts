import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { POST } from "@/app/api/parse/route";

function req(body: unknown): Request {
  return new Request("http://localhost/api/parse", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

const ORIGINAL_ENV = process.env.GROQ_API_KEY;

beforeEach(() => {
  process.env.GROQ_API_KEY = "test-key";
});

afterEach(() => {
  process.env.GROQ_API_KEY = ORIGINAL_ENV;
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function mockGroqResponse(content: unknown) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: JSON.stringify(content) } }],
      }),
    })
  );
}

describe("POST /api/parse", () => {
  it("discards any model-returned option not present in the input options list (guardrail)", async () => {
    mockGroqResponse({
      matchedOptions: ["6-12 months", "Invented Option That Does Not Exist"],
    });

    const res = await POST(
      req({
        transcript: "somewhere around 6 to 12 months",
        fieldType: "choice_match",
        options: ["Less than 6 months", "6-12 months", "Over a year"],
      })
    );
    const data = await res.json();

    expect(data.matchedOptions).toEqual(["6-12 months"]);
    expect(data.matchedOptions).not.toContain(
      "Invented Option That Does Not Exist"
    );
  });

  it("falls back to the raw transcript for free_text when Groq errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("network down"))
    );

    const res = await POST(
      req({ transcript: "used keratin last month", fieldType: "free_text" })
    );
    const data = await res.json();

    expect(data.text).toBe("used keratin last month");
    expect(data.confidence).toBe("low");
  });

  it("falls back to an empty match list for choice_match when Groq returns a non-OK response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));

    const res = await POST(
      req({
        transcript: "not sure",
        fieldType: "choice_match",
        options: ["Saliva", "Blood", "Either"],
      })
    );
    const data = await res.json();

    expect(data.matchedOptions).toEqual([]);
    expect(data.confidence).toBe("low");
  });

  it("never blocks the patient when no GROQ_API_KEY is configured — fails soft", async () => {
    delete process.env.GROQ_API_KEY;
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    const res = await POST(
      req({ transcript: "hello there", fieldType: "free_text" })
    );
    const data = await res.json();

    expect(data.text).toBe("hello there");
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("cleans up free-text transcripts using the model's response when available", async () => {
    mockGroqResponse({ text: "Used keratin treatment last month." });

    const res = await POST(
      req({
        transcript: "um like keratin treatment last month yeah",
        fieldType: "free_text",
      })
    );
    const data = await res.json();

    expect(data.text).toBe("Used keratin treatment last month.");
    expect(data.confidence).toBe("high");
  });

  it("returns 400 for a malformed request body", async () => {
    const res = await POST(req({ fieldType: "free_text" })); // missing transcript
    expect(res.status).toBe(400);
  });
});

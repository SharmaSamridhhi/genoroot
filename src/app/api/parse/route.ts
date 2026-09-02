import { NextResponse } from "next/server";

// The only place GROQ_API_KEY is read — never sent to the client. See GR-012.
// Model picked for latency: this sits in the middle of an interaction the
// patient is actively waiting on.
const GROQ_MODEL = "llama-3.1-8b-instant";
const GROQ_TIMEOUT_MS = 4000;

export type FieldType = "free_text" | "choice_match";

export interface ParseRequestBody {
  transcript: string;
  fieldType: FieldType;
  options?: string[];
}

export interface ParseResponseBody {
  text?: string;
  matchedOptions?: string[];
  confidence: "high" | "low";
}

function fallbackResponse(
  fieldType: FieldType,
  transcript: string
): ParseResponseBody {
  // Never blocks the patient: free-text falls back to the raw transcript
  // (still fully editable), choice fields fall back to "no confident match" so
  // the patient just taps an option manually.
  return fieldType === "free_text"
    ? { text: transcript, confidence: "low" }
    : { matchedOptions: [], confidence: "low" };
}

function buildPrompt(
  fieldType: FieldType,
  transcript: string,
  options?: string[]
): string {
  if (fieldType === "free_text") {
    return [
      "Clean up this spoken transcript into a short, readable sentence for a",
      "medical intake form. Keep the original meaning; only fix filler words",
      'and grammar. Respond with strict JSON: {"text": "..."}.',
      "",
      `Transcript: "${transcript}"`,
    ].join("\n");
  }
  return [
    `A patient said: "${transcript}"`,
    "Which of these options best match what they said? Choose only from this",
    `exact list (respond with the strings verbatim): ${JSON.stringify(options ?? [])}.`,
    'Respond with strict JSON: {"matchedOptions": ["..."]} — use an empty array',
    "if nothing matches well. Never invent an option not in the list.",
  ].join("\n");
}

export async function POST(
  request: Request
): Promise<NextResponse<ParseResponseBody>> {
  let body: ParseRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ confidence: "low" }, { status: 400 });
  }

  const { transcript, fieldType, options } = body;
  if (!transcript || typeof transcript !== "string" || !fieldType) {
    return NextResponse.json({ confidence: "low" }, { status: 400 });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    // No key configured (e.g. local dev without .env.local) — fail soft.
    return NextResponse.json(fallbackResponse(fieldType, transcript));
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GROQ_TIMEOUT_MS);

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          {
            role: "user",
            content: buildPrompt(fieldType, transcript, options),
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0,
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      return NextResponse.json(fallbackResponse(fieldType, transcript));
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    if (typeof content !== "string") {
      return NextResponse.json(fallbackResponse(fieldType, transcript));
    }

    const parsed = JSON.parse(content);

    if (fieldType === "free_text") {
      const text =
        typeof parsed.text === "string" && parsed.text.trim()
          ? parsed.text
          : transcript;
      return NextResponse.json({ text, confidence: "high" });
    }

    // Guardrail: the model can only ever narrow down to options that actually
    // exist in the list we gave it — never trust an invented string through.
    const rawMatches: unknown[] = Array.isArray(parsed.matchedOptions)
      ? parsed.matchedOptions
      : [];
    const validated = rawMatches.filter(
      (m): m is string => typeof m === "string" && (options ?? []).includes(m)
    );
    return NextResponse.json({
      matchedOptions: validated,
      confidence: validated.length > 0 ? "high" : "low",
    });
  } catch {
    return NextResponse.json(fallbackResponse(fieldType, transcript));
  } finally {
    clearTimeout(timeout);
  }
}

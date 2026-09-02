import { localMatchTranscript } from "./matchTranscript";
import type { FieldType, ParseResponseBody } from "@/app/api/parse/route";

export interface InterpretResult {
  suggestedText?: string;
  suggestedOptions?: string[];
  confidence: "high" | "low";
}

/**
 * Groq is the fallback, not the default: for choice fields, a clear local
 * match resolves instantly with zero network call. Only an inconclusive local
 * match, or a genuinely free-text field, reaches the /api/parse route (which
 * is the only place that talks to Groq — this function never calls it directly).
 */
export async function interpretTranscript(
  transcript: string,
  fieldType: FieldType,
  options?: string[]
): Promise<InterpretResult> {
  if (fieldType === "choice_match" && options) {
    const local = localMatchTranscript(transcript, options);
    if (local.matched && local.confidence === "high") {
      return { suggestedOptions: [local.matched], confidence: "high" };
    }
  }

  try {
    const res = await fetch("/api/parse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript, fieldType, options }),
    });
    if (!res.ok) throw new Error("parse request failed");
    const data: ParseResponseBody = await res.json();

    return fieldType === "free_text"
      ? { suggestedText: data.text ?? transcript, confidence: data.confidence }
      : {
          suggestedOptions: data.matchedOptions ?? [],
          confidence: data.confidence,
        };
  } catch {
    // Never blocks the patient — same fallback shape the route itself uses.
    return fieldType === "free_text"
      ? { suggestedText: transcript, confidence: "low" }
      : { suggestedOptions: [], confidence: "low" };
  }
}

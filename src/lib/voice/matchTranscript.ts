function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .trim();
}

export interface LocalMatchResult {
  matched: string | null;
  confidence: "high" | "low";
}

const WORD_OVERLAP_THRESHOLD = 0.6;

/**
 * Deterministic, no-network fuzzy match — tried before ever calling Groq. Handles
 * the large majority of cases: the patient says something close to (or exactly
 * containing) an actual option.
 */
export function localMatchTranscript(
  transcript: string,
  options: string[]
): LocalMatchResult {
  const normalizedTranscript = normalize(transcript);
  if (!normalizedTranscript) return { matched: null, confidence: "low" };

  const transcriptWords = new Set(
    normalizedTranscript.split(/\s+/).filter(Boolean)
  );

  let best: { option: string; score: number } | null = null;
  for (const option of options) {
    const normalizedOption = normalize(option);
    if (!normalizedOption) continue;

    if (normalizedTranscript.includes(normalizedOption)) {
      return { matched: option, confidence: "high" };
    }

    const optionWords = normalizedOption.split(/\s+/).filter(Boolean);
    const overlap = optionWords.filter((w) => transcriptWords.has(w)).length;
    const score = optionWords.length > 0 ? overlap / optionWords.length : 0;
    if (!best || score > best.score) best = { option, score };
  }

  if (best && best.score >= WORD_OVERLAP_THRESHOLD) {
    return { matched: best.option, confidence: "high" };
  }
  return { matched: null, confidence: "low" };
}

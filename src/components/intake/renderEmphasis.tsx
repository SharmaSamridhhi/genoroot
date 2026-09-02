import type { ReactNode } from "react";

const EMPHASIS_PATTERN = /\*([^*]+)\*/g;

/**
 * Parses question-copy.ts's `*phrase*` convention into the mixed-type
 * headline treatment (GR-019): the base clause stays plain, the marked
 * phrase renders in the display face, italic, gradient-filled. Kept as a
 * render-time parser rather than JSX in question-copy.ts so that file stays
 * plain data, per its own header comment.
 */
export function renderEmphasis(text: string): ReactNode {
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  EMPHASIS_PATTERN.lastIndex = 0;
  while ((match = EMPHASIS_PATTERN.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(
      <em
        key={key++}
        className="font-display text-gradient-root font-medium italic"
      >
        {match[1]}
      </em>
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts;
}

/** Plain-text contexts (e.g. SummaryView's small `<dt>` labels) want the
 * marked-up label without the `*` characters and without JSX emphasis. */
export function stripEmphasis(text: string): string {
  return text.replace(/\*/g, "");
}

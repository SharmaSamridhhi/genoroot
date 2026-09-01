// Shared animation vocabulary — every animated component in the app should pull
// durations/easings from here rather than hardcoding magic numbers, so motion
// feels like one system instead of ad hoc per-component timings.

export const DURATION = {
  fast: 0.15,
  base: 0.25,
  slow: 0.4,
} as const;

export const EASE = [0.22, 1, 0.36, 1] as const; // one shared "snappy settle" curve

// How long a one-tap answer (chip/yes-no) lingers, showing its own selection
// feedback, before auto-advancing — used by QuestionRenderer and TableCardFlow.
export const AUTO_ADVANCE_DELAY_MS = 220;

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Wraps a normal transition so it collapses to instant when reduced motion is requested. */
export function motionTransition(duration: number = DURATION.base) {
  if (prefersReducedMotion()) {
    return { duration: 0 };
  }
  return { duration, ease: EASE };
}

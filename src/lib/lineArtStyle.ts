// Shared stroke vocabulary for the app's decorative line-art (QuestionArt,
// HabitRowArt) — one consistent thin, low-opacity register so every one of
// these reads as background texture, never as a functional icon.
export const LINE_ART_STROKE = {
  fill: "none",
  strokeWidth: 1.4,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export const LINE_ART_FLOAT = {
  animate: { y: [0, -6, 0] },
  transition: { duration: 3.6, repeat: Infinity, ease: "easeInOut" as const },
};

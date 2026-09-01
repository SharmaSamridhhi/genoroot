import "@testing-library/jest-dom/vitest";

// jsdom doesn't implement matchMedia — default it to "no preference" so components
// that call prefersReducedMotion() (lib/motion/tokens.ts) don't crash in tests that
// don't care about reduced-motion specifically. Tests that do care override this.
if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  })) as unknown as typeof window.matchMedia;
}

import { afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";

// GR-015's store persists to localStorage. Without this, a persisted blob
// written by one test would leak into the next test's createIntakeStore()
// call and rehydrate unexpected state.
afterEach(() => {
  if (typeof window !== "undefined") {
    window.localStorage.clear();
  }
});

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

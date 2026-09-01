import { describe, it, expect, afterEach, vi } from "vitest";
import {
  motionTransition,
  prefersReducedMotion,
  DURATION,
} from "@/lib/motion/tokens";

function mockMatchMedia(matches: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

describe("prefersReducedMotion / motionTransition", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("prefersReducedMotion reflects the media query", () => {
    mockMatchMedia(true);
    expect(prefersReducedMotion()).toBe(true);

    mockMatchMedia(false);
    expect(prefersReducedMotion()).toBe(false);
  });

  it("motionTransition collapses to an instant (duration 0) when reduced motion is requested", () => {
    mockMatchMedia(true);
    expect(motionTransition()).toEqual({ duration: 0 });
  });

  it("motionTransition uses the shared duration/ease otherwise", () => {
    mockMatchMedia(false);
    const t = motionTransition();
    expect(t.duration).toBe(DURATION.base);
    expect(t).toHaveProperty("ease");
  });
});

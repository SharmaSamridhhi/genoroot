import { describe, it, expect, vi } from "vitest";
import { createIntakeStore } from "@/lib/engine/store";

const STORAGE_KEY = "genoroot-intake-v1";

async function waitForHydration(
  useStore: ReturnType<typeof createIntakeStore>
) {
  await vi.waitFor(() => {
    expect(useStore.persist.hasHydrated()).toBe(true);
  });
}

describe("GR-015 local persistence", () => {
  it("resumes at the first unanswered step after reload, not back at onboarding", async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        state: {
          profile: { age: 30, sex: "Male" },
          answers: {
            A: { age_hair_loss_began: 28, duration: "Over a year" },
            B: {},
            C: { habits: {} },
            D: { products: [], procedures: [] },
            E: {},
          },
        },
        version: 1,
      })
    );

    const useStore = createIntakeStore();
    await waitForHydration(useStore);

    expect(useStore.getState().profile).toEqual({ age: 30, sex: "Male" });
    expect(useStore.getState().answers.A.duration).toBe("Over a year");
    // First A-section question left unanswered is family_history — not onboarding,
    // and not blindly "step 1" either.
    expect(useStore.getState().currentStep).toEqual({
      section: "A",
      questionKey: "family_history",
    });
  });

  it("resumes to onboarding when no profile was ever set, even with some answers persisted", async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        state: {
          profile: null,
          answers: {
            A: {},
            B: {},
            C: { habits: {} },
            D: { products: [], procedures: [] },
            E: {},
          },
        },
        version: 1,
      })
    );

    const useStore = createIntakeStore();
    await waitForHydration(useStore);

    expect(useStore.getState().currentStep).toEqual({
      section: "onboarding",
      questionKey: "profile",
    });
  });

  it("falls back to a fresh intake — no crash — on a version-mismatched blob", async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        state: {
          profile: { age: 99, sex: "Male" },
          answers: { A: { duration: "Over a year" } },
        },
        version: 999, // some future/incompatible schema version
      })
    );

    const useStore = createIntakeStore();
    await waitForHydration(useStore);

    expect(useStore.getState().profile).toBeNull();
    expect(useStore.getState().currentStep).toEqual({
      section: "onboarding",
      questionKey: "profile",
    });
  });

  it("falls back to a fresh intake — no crash — on a corrupted (non-JSON) blob", async () => {
    localStorage.setItem(STORAGE_KEY, "{not valid json at all");

    const useStore = createIntakeStore();

    // The important assertion is simply that construction + hydration never
    // throws; a corrupted blob just means "nothing usable was found".
    await expect(waitForHydration(useStore)).resolves.not.toThrow();
    expect(useStore.getState().currentStep).toEqual({
      section: "onboarding",
      questionKey: "profile",
    });
  });

  it("reset() clears localStorage — a later store instance doesn't resurrect the old intake", async () => {
    const useStore = createIntakeStore();
    await waitForHydration(useStore);

    useStore.getState().setProfile({ age: 40, sex: "Female" });
    useStore
      .getState()
      .answer({ section: "A", questionKey: "age_hair_loss_began" }, 35);

    await vi.waitFor(() => {
      expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();
    });

    useStore.getState().reset();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();

    const freshStore = createIntakeStore();
    await waitForHydration(freshStore);
    expect(freshStore.getState().profile).toBeNull();
    expect(freshStore.getState().currentStep).toEqual({
      section: "onboarding",
      questionKey: "profile",
    });
  });

  it("never talks to the network — persistence is 100% client-side localStorage", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    const useStore = createIntakeStore();
    await waitForHydration(useStore);
    useStore.getState().setProfile({ age: 25, sex: "Male" });
    useStore
      .getState()
      .answer({ section: "A", questionKey: "duration" }, "6-12 months");

    expect(fetchSpy).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
});

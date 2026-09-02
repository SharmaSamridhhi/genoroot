import { create } from "zustand";
import { persist, type PersistStorage } from "zustand/middleware";
import type {
  Answers,
  PatientProfile,
  ProcedureRow,
  ProductRow,
} from "@/lib/schema/types";
import {
  applyExclusiveSelection,
  clearHabitsDependentFields,
  clearProcedureRowDependents,
  clearProductRowDependents,
} from "@/lib/rules";
import {
  getNextStep,
  getPrevStep,
  ONBOARDING_STEP,
  type StepId,
} from "./steps";
import {
  getProgress,
  getResumeStep,
  isComplete,
  type Progress,
} from "./completeness";

export function emptyAnswers(): Answers {
  return {
    A: {},
    B: {},
    C: { habits: {} },
    D: { products: [], procedures: [] },
    E: {},
  };
}

export interface IntakeState {
  profile: PatientProfile | null;
  answers: Answers;
  currentStep: StepId;

  setProfile: (profile: PatientProfile) => void;
  answer: (step: StepId, value: unknown) => void;
  toggleMultiOption: (step: StepId, option: string) => void;
  next: () => void;
  back: () => void;
  isComplete: () => boolean;
  getProgress: () => Progress;
  reset: () => void;
}

// This app has no login and no concept of multiple concurrent patients, so
// persistence is intentionally simple: one versioned key, one in-progress
// intake. A schema change that would make an old blob's shape incompatible
// bumps this version — see `migrate` below, which discards rather than crashes.
const STORAGE_KEY = "genoroot-intake-v1";
const STORAGE_VERSION = 1;

// Next.js prerenders /intake's static shell on the server, where `localStorage`
// doesn't exist — every access is guarded so that never throws during a build
// or SSR pass. JSON parsing is also wrapped directly (rather than relying on
// createJSONStorage's own parsing) so a corrupted/hand-edited blob in
// localStorage degrades to "nothing found" instead of throwing during
// rehydration and leaving the store stuck mid-hydration forever.
const safeStorage: PersistStorage<Pick<IntakeState, "profile" | "answers">> = {
  getItem: (name) => {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(name);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(name, JSON.stringify(value));
    }
  },
  removeItem: (name) => {
    if (typeof window !== "undefined") window.localStorage.removeItem(name);
  },
};

/**
 * Factory rather than a bare singleton so tests (and GR-017's persona suite) can
 * spin up an isolated store per test instead of sharing global state. The app
 * itself uses the singleton `useIntakeStore` exported below. (Tests must clear
 * localStorage between runs — see tests/setup.ts — or a persisted blob from one
 * test would leak into the next store instance's rehydration.)
 */
export function createIntakeStore() {
  return create<IntakeState>()(
    persist(
      (set, get) => ({
        profile: null,
        answers: emptyAnswers(),
        currentStep: ONBOARDING_STEP,

        setProfile: (profile) => set({ profile }),

        answer: (step, value) => {
          const answers = structuredClone(get().answers);

          if (step.section === "onboarding") return;

          const sectionAnswers = answers[step.section] as Record<
            string,
            unknown
          >;

          if (step.subKey) {
            sectionAnswers[step.subKey] = value;
            set({ answers });
            return;
          }

          if (step.questionKey === "habits") {
            answers.C.habits = clearHabitsDependentFields(
              value as Parameters<typeof clearHabitsDependentFields>[0]
            );
            set({ answers });
            return;
          }
          if (step.questionKey === "products") {
            answers.D.products = (value as ProductRow[]).map((row) =>
              clearProductRowDependents(row)
            );
            set({ answers });
            return;
          }
          if (step.questionKey === "procedures") {
            answers.D.procedures = (value as ProcedureRow[]).map((row) =>
              clearProcedureRowDependents(row)
            );
            set({ answers });
            return;
          }

          sectionAnswers[step.questionKey] = value;
          set({ answers });
        },

        toggleMultiOption: (step, option) => {
          const answers = structuredClone(get().answers);
          const sectionAnswers = answers[
            step.section as keyof Answers
          ] as Record<string, unknown>;
          const current =
            (sectionAnswers[step.questionKey] as string[] | undefined) ?? [];
          sectionAnswers[step.questionKey] = applyExclusiveSelection(
            step.questionKey,
            current,
            option
          );
          set({ answers });
        },

        next: () => {
          const { currentStep, profile, answers } = get();
          const nextStep = getNextStep(currentStep, profile, answers);
          if (nextStep) set({ currentStep: nextStep });
        },

        back: () => {
          const { currentStep, profile, answers } = get();
          const prevStep = getPrevStep(currentStep, profile, answers);
          if (prevStep) set({ currentStep: prevStep });
        },

        isComplete: () => {
          const { profile, answers } = get();
          return isComplete(profile, answers);
        },

        getProgress: () => {
          const { profile, answers } = get();
          return getProgress(profile, answers);
        },

        reset: () => {
          // Order matters: persist auto-saves on every set(), so clearing
          // storage has to happen *after* the state change, not before it —
          // otherwise persist's own write on this same set() call would
          // immediately resurrect a (fresh, but non-empty) blob right after.
          set({
            profile: null,
            answers: emptyAnswers(),
            currentStep: ONBOARDING_STEP,
          });
          if (typeof window !== "undefined") {
            window.localStorage.removeItem(STORAGE_KEY);
          }
        },
      }),
      {
        name: STORAGE_KEY,
        version: STORAGE_VERSION,
        storage: safeStorage,
        // Only profile/answers are persisted — currentStep is always recomputed
        // on rehydration (below) rather than trusted verbatim.
        partialize: (state) => ({
          profile: state.profile,
          answers: state.answers,
        }),
        migrate: (_persistedState, version) => {
          // Any version other than the current one is treated as incompatible —
          // fall back to a fresh intake rather than risk rehydrating a shape
          // this build's engine doesn't understand.
          if (version !== STORAGE_VERSION) {
            return { profile: null, answers: emptyAnswers() };
          }
          return _persistedState as Pick<IntakeState, "profile" | "answers">;
        },
        onRehydrateStorage: () => (state) => {
          if (state) {
            state.currentStep = getResumeStep(state.profile, state.answers);
          }
        },
      }
    )
  );
}

// Inferred rather than hand-declared: the persist middleware augments the
// bound store with a `.persist` namespace (hasHydrated/onFinishHydration/etc)
// that a manually-written `UseBoundStore<StoreApi<IntakeState>>` type wouldn't
// include.
export type IntakeStore = ReturnType<typeof createIntakeStore>;

export const useIntakeStore = createIntakeStore();

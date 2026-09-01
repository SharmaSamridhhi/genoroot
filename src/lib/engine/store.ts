import { create, type StoreApi, type UseBoundStore } from "zustand";
import type {
  Answers,
  PatientProfile,
  ProcedureRow,
  ProductRow,
} from "@/lib/schema/types";
import {
  applyExclusiveSelection,
  clearDependentFields,
  clearHabitsDependentFields,
} from "@/lib/rules";
import { getNextStep, getPrevStep, type StepId } from "./steps";
import { getProgress, isComplete, type Progress } from "./completeness";

export function emptyAnswers(): Answers {
  return {
    A: {},
    B: {},
    C: { habits: {} },
    D: { products: [], procedures: [] },
    E: {},
  };
}

export const ONBOARDING_STEP: StepId = {
  section: "onboarding",
  questionKey: "profile",
};

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

export type IntakeStore = UseBoundStore<StoreApi<IntakeState>>;

/**
 * Factory rather than a bare singleton so tests (and GR-017's persona suite) can
 * spin up an isolated store per test instead of sharing global state. The app
 * itself uses the singleton `useIntakeStore` exported below.
 */
export function createIntakeStore(): IntakeStore {
  return create<IntakeState>((set, get) => ({
    profile: null,
    answers: emptyAnswers(),
    currentStep: ONBOARDING_STEP,

    setProfile: (profile) => set({ profile }),

    answer: (step, value) => {
      const answers = structuredClone(get().answers);

      if (step.section === "onboarding") return;

      const sectionAnswers = answers[step.section] as Record<string, unknown>;

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
          clearDependentFields(row)
        );
        set({ answers });
        return;
      }
      if (step.questionKey === "procedures") {
        answers.D.procedures = (value as ProcedureRow[]).map((row) =>
          clearDependentFields(row)
        );
        set({ answers });
        return;
      }

      sectionAnswers[step.questionKey] = value;
      set({ answers });
    },

    toggleMultiOption: (step, option) => {
      const answers = structuredClone(get().answers);
      const sectionAnswers = answers[step.section as keyof Answers] as Record<
        string,
        unknown
      >;
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

    reset: () =>
      set({
        profile: null,
        answers: emptyAnswers(),
        currentStep: ONBOARDING_STEP,
      }),
  }));
}

export const useIntakeStore = createIntakeStore();

"use client";

import type { ReactNode } from "react";
import { useIntakeStore } from "@/lib/engine/store";
import type { StepId } from "@/lib/engine/steps";
import { isStepAnswered } from "@/lib/engine/completeness";
import { INTAKE_SCHEMA, type Question } from "@/lib/schema/intake-schema";
import type { Answers } from "@/lib/schema/types";
import {
  ChipSelect,
  NumberInput,
  TextInput,
  YesNoSwipeCard,
} from "@/components/inputs";
import { questionLabel } from "./question-copy";

type RenderableDef = Question | { type: "single" | "text"; options?: string[] };

function findQuestionDef(step: StepId): RenderableDef | null {
  const section = INTAKE_SCHEMA.sections.find((s) => s.id === step.section);
  const question = section?.questions.find((q) => q.key === step.questionKey);
  if (!question) return null;

  if (
    step.subKey &&
    "followup" in question &&
    question.followup?.key === step.subKey
  ) {
    return { type: question.followup.type, options: question.followup.options };
  }
  return question;
}

function getValue(step: StepId, answers: Answers): unknown {
  const sectionAnswers = answers[step.section as keyof Answers] as Record<
    string,
    unknown
  >;
  const key = step.subKey ?? step.questionKey;
  return sectionAnswers?.[key] ?? null;
}

// Only the question types that don't auto-advance need an explicit Continue button —
// multi-select and text take multiple actions before the patient is "done", and the
// table placeholder needs a way to move on until GR-010 lands.
const NEEDS_CONTINUE_BUTTON = new Set(["multi", "number", "text", "table"]);

export function QuestionRenderer({ step }: { step: StepId }) {
  const answers = useIntakeStore((s) => s.answers);
  const answer = useIntakeStore((s) => s.answer);
  const next = useIntakeStore((s) => s.next);

  const def = findQuestionDef(step);
  if (!def) return null;

  const value = getValue(step, answers);
  const label = questionLabel(step.subKey ?? step.questionKey);
  const answered = isStepAnswered(step, answers);

  function setValue(v: unknown) {
    answer(step, v);
  }

  function autoAdvance(v: unknown) {
    setValue(v);
    // Small delay so the selection's own feedback animation is visible before the
    // step transitions away — an instant jump-cut would undercut the "snappy" feel.
    window.setTimeout(() => next(), 220);
  }

  let control: ReactNode = null;

  switch (def.type) {
    case "number":
      control = (
        <NumberInput value={value as number | null} onChange={setValue} />
      );
      break;
    case "single":
      control = (
        <ChipSelect
          questionKey={step.subKey ?? step.questionKey}
          options={def.options ?? []}
          mode="single"
          value={value as string | null}
          onChange={(v) => autoAdvance(v)}
        />
      );
      break;
    case "multi":
      control = (
        <ChipSelect
          questionKey={step.questionKey}
          options={def.options ?? []}
          mode="multi"
          value={value as string[] | null}
          onChange={setValue}
        />
      );
      break;
    case "yesno":
      control = (
        <YesNoSwipeCard
          value={value as boolean | null}
          onChange={(v) => autoAdvance(v)}
        />
      );
      break;
    case "text":
      control = (
        <TextInput
          value={(value as string | null) ?? ""}
          onChange={setValue}
          placeholder="Type your answer…"
          multiline
        />
      );
      break;
    case "table":
      control = (
        <div className="rounded-lg border border-dashed border-neutral-300 p-6 text-center text-neutral-500 dark:border-neutral-700">
          This question is answered as a quick card-by-card flow — coming in a
          later build (GR-010).
        </div>
      );
      break;
  }

  const showContinue = NEEDS_CONTINUE_BUTTON.has(def.type);
  const continueDisabled = def.type !== "table" && !answered;

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-semibold">{label}</h2>
      {control}
      {showContinue && (
        <button
          type="button"
          disabled={continueDisabled}
          onClick={() => next()}
          className="min-h-11 self-start rounded-full bg-indigo-600 px-6 py-3 text-base font-medium text-white transition-opacity disabled:opacity-40"
        >
          Continue
        </button>
      )}
    </div>
  );
}

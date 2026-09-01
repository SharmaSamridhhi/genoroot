"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useIntakeStore } from "@/lib/engine/store";
import { stepEquals, type StepId } from "@/lib/engine/steps";
import { isStepAnswered } from "@/lib/engine/completeness";
import { INTAKE_SCHEMA, type Question } from "@/lib/schema/intake-schema";
import type { Answers } from "@/lib/schema/types";
import {
  ChipSelect,
  NumberInput,
  TextInput,
  YesNoSwipeCard,
} from "@/components/inputs";
import {
  ConsentScreen,
  ScalpPatternPicker,
  TableCardFlow,
  getHabitsRowConfigs,
  getUniformRowConfigs,
  habitsToRows,
  rowsToHabits,
  withRowLabels,
} from "@/components/questions";
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
// multi-select, number, and text take multiple actions before the patient is
// "done", and a table needs an explicit way to leave once every row is answered
// (TableCardFlow auto-advances *within* itself; this button leaves the whole
// table question).
const NEEDS_CONTINUE_BUTTON = new Set(["multi", "number", "text", "table"]);

export function QuestionRenderer({ step }: { step: StepId }) {
  const answers = useIntakeStore((s) => s.answers);
  const answer = useIntakeStore((s) => s.answer);
  const next = useIntakeStore((s) => s.next);

  // Belt-and-suspenders cleanup for the autoAdvance timer below — on its own this
  // isn't sufficient (AnimatePresence keeps an exiting instance mounted for the
  // full ~250ms exit animation, which is *longer* than the 220ms autoAdvance
  // delay, so unmount-based cancellation alone can lose the race). The real guard
  // is the live-step comparison inside the timer callback itself.
  const pendingAdvanceRef = useRef<number | null>(null);
  useEffect(() => {
    return () => {
      if (pendingAdvanceRef.current !== null) {
        window.clearTimeout(pendingAdvanceRef.current);
      }
    };
  }, []);

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
    // Only actually advances if `step` (captured here) is still the live current
    // step when the timer fires — if the patient has already navigated away (e.g.
    // hit Back before this fires), this becomes a no-op instead of silently
    // shoving them forward from wherever they ended up.
    pendingAdvanceRef.current = window.setTimeout(() => {
      if (stepEquals(useIntakeStore.getState().currentStep, step)) {
        next();
      }
    }, 220);
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
      control =
        step.questionKey === "pattern" ? (
          <ScalpPatternPicker
            value={(value as string[] | null) ?? []}
            onChange={setValue}
          />
        ) : (
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
      control =
        step.questionKey === "consent" ? (
          <ConsentScreen
            value={value as boolean | null}
            onChange={(v) => autoAdvance(v)}
          />
        ) : (
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
    case "table": {
      const tableKey = step.questionKey as "habits" | "products" | "procedures";
      const rowConfigs =
        tableKey === "habits"
          ? getHabitsRowConfigs()
          : getUniformRowConfigs(tableKey);
      const tableValue =
        tableKey === "habits"
          ? habitsToRows(
              answers.C.habits as Record<string, unknown>,
              rowConfigs
            )
          : ((answers.D[tableKey] as Record<string, unknown>[]) ?? []);

      control = (
        <TableCardFlow
          rows={rowConfigs}
          value={tableValue}
          onChange={(rows) =>
            setValue(
              tableKey === "habits"
                ? rowsToHabits(rows)
                : withRowLabels(rows, rowConfigs)
            )
          }
        />
      );
      break;
    }
  }

  const showContinue = NEEDS_CONTINUE_BUTTON.has(def.type);
  const continueDisabled = !answered;

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

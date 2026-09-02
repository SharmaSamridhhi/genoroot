"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useIntakeStore } from "@/lib/engine/store";
import { getProgress, isComplete } from "@/lib/engine/completeness";
import { motionTransition } from "@/lib/motion/tokens";
import { IconArrowLeft } from "@/components/icons/manifest";
import { OnboardingStep } from "./OnboardingStep";
import { ProgressBar } from "./ProgressBar";
import { SectionHeader } from "./SectionHeader";
import { useQuestionRender } from "./useQuestionRender";
import { renderEmphasis } from "./renderEmphasis";
import { RootLineArt } from "./RootLineArt";

export function IntakeFlow() {
  const currentStep = useIntakeStore((s) => s.currentStep);
  const back = useIntakeStore((s) => s.back);
  const profile = useIntakeStore((s) => s.profile);
  const answers = useIntakeStore((s) => s.answers);
  const router = useRouter();

  const progress = getProgress(profile, answers);
  const complete = isComplete(profile, answers);
  const question = useQuestionRender(currentStep);

  useEffect(() => {
    if (complete) {
      router.push("/review");
    }
  }, [complete, router]);

  if (currentStep.section === "onboarding") {
    return <OnboardingStep />;
  }

  if (!question) return null;

  const stepKey = `${currentStep.section}-${currentStep.subKey ?? currentStep.questionKey}`;

  return (
    <div className="relative mx-auto flex min-h-screen max-w-md flex-col gap-10 px-4 py-8 lg:max-w-6xl lg:justify-center lg:gap-0 lg:px-16 lg:py-12">
      <div className="flex flex-col gap-8 lg:absolute lg:top-12 lg:right-16 lg:left-16 lg:gap-3">
        <ProgressBar
          percent={progress.percent}
          currentSection={currentStep.section}
        />
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Back"
            onClick={back}
            className="border-line text-ink-soft hover:border-copper flex h-11 w-11 items-center justify-center rounded-full border transition-colors"
          >
            <IconArrowLeft size={18} animate={false} />
          </button>
          <SectionHeader section={currentStep.section} />
        </div>
      </div>

      {/* A bare keyed motion.div (no AnimatePresence/exit) rather than mode="wait":
          this content changes on every answer, sometimes in rapid succession
          (auto-advance + Back revisiting earlier steps), and mode="wait" depends
          on an exit-complete callback that's unreliable under rapid/backgrounded-
          tab conditions — see TableCardFlow.tsx's identical note. A fresh mount
          still plays its own enter animation on every key change, which is what
          actually matters. */}
      <motion.div
        key={stepKey}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={motionTransition()}
        className="relative flex flex-col gap-10 lg:mt-28 lg:grid lg:grid-cols-[1.15fr_1fr] lg:items-center lg:gap-16"
      >
        <div className="lg:border-line/70 relative flex flex-col gap-4 lg:min-h-[22rem] lg:justify-center lg:border-r lg:pr-16">
          <h2 className="text-ink font-sans text-2xl leading-tight font-light lg:text-[2.75rem]">
            {renderEmphasis(question.label)}
          </h2>
          <RootLineArt />
        </div>

        <div className="flex flex-col gap-6">
          {question.control}
          {question.showContinue && (
            <button
              type="button"
              disabled={question.continueDisabled}
              onClick={question.onContinue}
              className="bg-gradient-root-solid min-h-11 self-start rounded-full px-6 py-3 text-base font-semibold text-white shadow-[0_14px_26px_-12px_rgba(157,90,47,0.45)] transition-opacity disabled:opacity-40"
            >
              Continue
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

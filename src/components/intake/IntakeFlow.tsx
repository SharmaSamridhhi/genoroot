"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useIntakeStore } from "@/lib/engine/store";
import { getProgress, isComplete } from "@/lib/engine/completeness";
import { motionTransition } from "@/lib/motion/tokens";
import { IconArrowLeft } from "@/components/icons/manifest";
import { OnboardingStep } from "./OnboardingStep";
import { ProgressBar } from "./ProgressBar";
import { SectionHeader } from "./SectionHeader";
import { QuestionRenderer } from "./QuestionRenderer";

export function IntakeFlow() {
  const currentStep = useIntakeStore((s) => s.currentStep);
  const back = useIntakeStore((s) => s.back);
  const profile = useIntakeStore((s) => s.profile);
  const answers = useIntakeStore((s) => s.answers);
  const router = useRouter();

  const progress = getProgress(profile, answers);
  const complete = isComplete(profile, answers);

  useEffect(() => {
    if (complete) {
      router.push("/review");
    }
  }, [complete, router]);

  if (currentStep.section === "onboarding") {
    return <OnboardingStep />;
  }

  const stepKey = `${currentStep.section}-${currentStep.subKey ?? currentStep.questionKey}`;

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col gap-8 px-4 py-8">
      <ProgressBar
        percent={progress.percent}
        currentSection={currentStep.section}
      />
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Back"
          onClick={back}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-neutral-300 dark:border-neutral-700"
        >
          <IconArrowLeft size={18} animate={false} />
        </button>
        <SectionHeader section={currentStep.section} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={stepKey}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={motionTransition()}
        >
          <QuestionRenderer step={currentStep} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

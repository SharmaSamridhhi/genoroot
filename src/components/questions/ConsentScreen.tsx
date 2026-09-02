"use client";

import { motion } from "framer-motion";
import { IconShield } from "@/components/icons/manifest";
import { motionTransition } from "@/lib/motion/tokens";

interface ConsentScreenProps {
  value: boolean | null;
  onChange: (value: boolean) => void;
}

// Deliberately more restrained than the rest of the app: no swipe gesture, no
// playful bounce, no pre-selected default — this is the one screen where the
// interaction should read as formal and unambiguous, not gamified.
export function ConsentScreen({ value, onChange }: ConsentScreenProps) {
  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-neutral-300 bg-neutral-50 p-6 dark:border-neutral-700 dark:bg-neutral-900">
      <div className="flex items-start gap-3">
        <IconShield
          size={28}
          animate={false}
          className="mt-0.5 shrink-0 text-neutral-500"
        />
        <p className="text-base text-neutral-700 dark:text-neutral-300">
          We&apos;d like to collect a sample (saliva or blood) and run a genetic
          analysis as part of your consultation. Your sample and results are
          used only for your care at this clinic.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <motion.button
          type="button"
          onClick={() => onChange(false)}
          whileTap={{ scale: 0.98 }}
          transition={motionTransition(0.15)}
          aria-pressed={value === false}
          className={[
            "min-h-11 flex-1 rounded-xl border px-6 py-3 text-base font-medium transition-colors",
            value === false
              ? "border-neutral-600 bg-neutral-600 text-white"
              : "border-neutral-300 bg-white text-neutral-800 hover:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100",
          ].join(" ")}
        >
          I do not agree
        </motion.button>
        <motion.button
          type="button"
          onClick={() => onChange(true)}
          whileTap={{ scale: 0.98 }}
          transition={motionTransition(0.15)}
          aria-pressed={value === true}
          className={[
            "min-h-11 flex-1 rounded-xl border px-6 py-3 text-base font-medium transition-colors",
            value === true
              ? "border-indigo-600 bg-indigo-600 text-white"
              : "border-neutral-300 bg-white text-neutral-800 hover:border-indigo-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100",
          ].join(" ")}
        >
          I agree
        </motion.button>
      </div>
    </div>
  );
}

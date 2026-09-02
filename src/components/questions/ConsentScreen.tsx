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
    <div className="border-line bg-sage flex flex-col gap-6 rounded-2xl border p-6">
      <div className="flex items-start gap-3">
        <IconShield
          size={28}
          animate={false}
          className="text-moss-deep mt-0.5 shrink-0"
        />
        <p className="text-ink text-base">
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
              ? "border-ink-soft bg-ink-soft text-white"
              : "border-line bg-card text-ink hover:border-ink-soft",
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
              ? "bg-gradient-root-solid border-transparent text-white"
              : "border-line bg-card text-ink hover:border-copper",
          ].join(" ")}
        >
          I agree
        </motion.button>
      </div>
    </div>
  );
}

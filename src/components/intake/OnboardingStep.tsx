"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useIntakeStore } from "@/lib/engine/store";
import type { Sex } from "@/lib/schema/types";
import { IconUser } from "@/components/icons/manifest";
import { motionTransition } from "@/lib/motion/tokens";

const SEX_OPTIONS: Sex[] = ["Male", "Female", "Prefer not to say"];

export function OnboardingStep() {
  const setProfile = useIntakeStore((s) => s.setProfile);
  const next = useIntakeStore((s) => s.next);

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState<Sex | null>(null);

  const ageNumber = Number(age);
  const canContinue =
    age.trim() !== "" &&
    !Number.isNaN(ageNumber) &&
    ageNumber > 0 &&
    sex !== null;

  function handleContinue() {
    if (!canContinue || sex === null) return;
    setProfile({ name: name.trim() || undefined, age: ageNumber, sex });
    next();
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={motionTransition()}
      className="mx-auto flex max-w-md flex-col gap-6 px-4 py-10"
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <IconUser size={40} />
        <h1 className="text-2xl font-semibold">
          Let&apos;s get you checked in
        </h1>
        <p className="text-neutral-500">
          Just a couple of things so we ask you the right next few questions.
        </p>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
          Name <span className="font-normal">(optional)</span>
        </span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Priya Sharma"
          className="h-11 rounded-lg border border-neutral-300 p-3 text-base dark:border-neutral-700 dark:bg-neutral-900"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
          Age
        </span>
        <input
          type="number"
          inputMode="numeric"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          placeholder="e.g. 32"
          className="h-11 rounded-lg border border-neutral-300 p-3 text-base dark:border-neutral-700 dark:bg-neutral-900"
        />
      </label>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
          Sex
        </span>
        <div className="flex flex-wrap gap-3" role="group">
          {SEX_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={sex === option}
              onClick={() => setSex(option)}
              className={[
                "min-h-11 rounded-full border px-4 py-2 text-base transition-colors",
                sex === option
                  ? "border-indigo-600 bg-indigo-600 text-white"
                  : "border-neutral-300 bg-white text-neutral-800 hover:border-indigo-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100",
              ].join(" ")}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        disabled={!canContinue}
        onClick={handleContinue}
        className="min-h-11 rounded-full bg-indigo-600 px-6 py-3 text-base font-medium text-white transition-opacity disabled:opacity-40"
      >
        Continue
      </button>
    </motion.div>
  );
}

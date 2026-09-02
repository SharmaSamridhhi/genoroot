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
      className="mx-auto flex max-w-md flex-col gap-6 px-4 py-10 lg:max-w-xl lg:py-24"
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <IconUser size={40} className="text-copper-deep" />
        <h1 className="text-ink font-sans text-2xl font-light lg:text-4xl">
          Let&apos;s get you{" "}
          <em className="font-display text-gradient-root font-medium italic not-italic">
            checked in
          </em>
        </h1>
        <p className="text-ink-soft">
          Just a couple of things so we ask you the right next few questions.
        </p>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-ink-soft text-sm font-medium">
          Name <span className="font-normal">(optional)</span>
        </span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Priya Sharma"
          className="border-line bg-card text-ink focus:border-copper h-11 rounded-lg border p-3 text-base focus:outline-none"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-ink-soft text-sm font-medium">Age</span>
        <input
          type="number"
          inputMode="numeric"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          placeholder="e.g. 32"
          className="border-line bg-card text-ink focus:border-copper h-11 rounded-lg border p-3 text-base focus:outline-none"
        />
      </label>

      <div className="flex flex-col gap-2">
        <span className="text-ink-soft text-sm font-medium">Sex</span>
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
                  ? "bg-gradient-root-solid border-transparent text-white"
                  : "border-line bg-card text-ink hover:border-copper",
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
        className="bg-gradient-root-solid min-h-11 rounded-full px-6 py-3 text-base font-semibold text-white shadow-[0_14px_26px_-12px_rgba(157,90,47,0.45)] transition-opacity disabled:opacity-40"
      >
        Continue
      </button>
    </motion.div>
  );
}

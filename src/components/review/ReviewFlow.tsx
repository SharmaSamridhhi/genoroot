"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useIntakeStore } from "@/lib/engine/store";
import { assembleOutput } from "@/lib/engine/assemble";
import { isComplete } from "@/lib/engine/completeness";
import { SummaryView } from "./SummaryView";
import { JsonView } from "./JsonView";

type ViewMode = "summary" | "json";

export function ReviewFlow() {
  const profile = useIntakeStore((s) => s.profile);
  const answers = useIntakeStore((s) => s.answers);
  const reset = useIntakeStore((s) => s.reset);
  const router = useRouter();

  const [view, setView] = useState<ViewMode>("summary");
  const [copied, setCopied] = useState(false);

  const complete = profile !== null && isComplete(profile, answers);

  // This screen only makes sense for a genuinely complete intake — if reached
  // directly (e.g. a stale bookmark, or mid-intake before GR-015 resumes the
  // patient), send them back rather than crashing on assembleOutput's
  // non-null profile requirement.
  useEffect(() => {
    if (!complete) {
      router.push("/intake");
    }
  }, [complete, router]);

  if (!profile || !complete) {
    return null;
  }

  const output = assembleOutput(profile, answers);
  const json = JSON.stringify(output, null, 2);

  async function handleCopy() {
    await navigator.clipboard.writeText(json);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  function handleDownload() {
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "genoroot-intake.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  function handleStartOver() {
    reset();
    router.push("/intake");
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-4 py-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">Intake complete</h1>
        <p className="text-neutral-500">
          Here&apos;s what {output.patient.name || "the patient"} shared, ready
          for the doctor.
        </p>
      </header>

      {!output.sections.E.consent && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
          Sample collection requires consent — patient declined.
        </div>
      )}

      <div className="flex gap-2" role="tablist" aria-label="Output view">
        <button
          type="button"
          role="tab"
          aria-selected={view === "summary"}
          onClick={() => setView("summary")}
          className={`min-h-11 rounded-full border px-4 py-2 text-sm font-medium ${
            view === "summary"
              ? "border-indigo-600 bg-indigo-600 text-white"
              : "border-neutral-300 dark:border-neutral-700"
          }`}
        >
          Summary
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={view === "json"}
          onClick={() => setView("json")}
          className={`min-h-11 rounded-full border px-4 py-2 text-sm font-medium ${
            view === "json"
              ? "border-indigo-600 bg-indigo-600 text-white"
              : "border-neutral-300 dark:border-neutral-700"
          }`}
        >
          Raw JSON
        </button>
      </div>

      {view === "summary" ? (
        <SummaryView output={output} />
      ) : (
        <JsonView json={json} />
      )}

      <div className="mt-4 flex flex-wrap gap-2 border-t border-neutral-200 pt-4 dark:border-neutral-800">
        <button
          type="button"
          onClick={handleCopy}
          className="min-h-11 rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium dark:border-neutral-700"
        >
          {copied ? "Copied!" : "Copy JSON"}
        </button>
        <button
          type="button"
          onClick={handleDownload}
          className="min-h-11 rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium dark:border-neutral-700"
        >
          Download JSON
        </button>
        <button
          type="button"
          onClick={handleStartOver}
          className="min-h-11 rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-500 dark:border-neutral-700"
        >
          Start over
        </button>
      </div>
    </div>
  );
}

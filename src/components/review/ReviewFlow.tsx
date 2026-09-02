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
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-4 py-8 lg:max-w-3xl lg:py-16">
      <header className="flex flex-col gap-1">
        <h1 className="text-ink font-sans text-2xl font-light lg:text-4xl">
          Intake{" "}
          <em className="font-display text-gradient-root font-medium italic not-italic">
            complete
          </em>
        </h1>
        <p className="text-ink-soft">
          Here&apos;s what {output.patient.name || "the patient"} shared, ready
          for the doctor.
        </p>
      </header>

      {!output.sections.E.consent && (
        <div className="border-copper-soft bg-linen-2 text-copper-deep rounded-lg border p-3 text-sm">
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
              ? "bg-gradient-root-solid border-transparent text-white"
              : "border-line text-ink"
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
              ? "bg-gradient-root-solid border-transparent text-white"
              : "border-line text-ink"
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

      <div className="border-line mt-4 flex flex-wrap gap-2 border-t pt-4">
        <button
          type="button"
          onClick={handleCopy}
          className="border-line text-ink min-h-11 rounded-full border px-4 py-2 text-sm font-medium"
        >
          {copied ? "Copied!" : "Copy JSON"}
        </button>
        <button
          type="button"
          onClick={handleDownload}
          className="border-line text-ink min-h-11 rounded-full border px-4 py-2 text-sm font-medium"
        >
          Download JSON
        </button>
        <button
          type="button"
          onClick={handleStartOver}
          className="border-line text-ink-soft min-h-11 rounded-full border px-4 py-2 text-sm font-medium"
        >
          Start over
        </button>
      </div>
    </div>
  );
}

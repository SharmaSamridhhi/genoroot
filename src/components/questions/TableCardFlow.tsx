"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ChipSelect,
  VoiceTextInput,
  YesNoSwipeCard,
} from "@/components/inputs";
import { AUTO_ADVANCE_DELAY_MS, motionTransition } from "@/lib/motion/tokens";
import { HabitRowArt } from "./HabitRowArt";
import type { RowConfig, RowFieldConfig } from "./tableConfigs";

interface TableCardFlowProps {
  rows: RowConfig[];
  value: Record<string, unknown>[];
  onChange: (rows: Record<string, unknown>[]) => void;
}

// A row with more than one field always has a yes/no lead field first (see
// tableConfigs.ts) — its dependents only become visible once the lead is
// answered `true`. A single-field row (e.g. hair_wash_frequency) has no lead/
// dependent split at all.
function getVisibleFields(
  row: RowConfig,
  rowAnswer: Record<string, unknown>
): RowFieldConfig[] {
  if (row.fields.length <= 1) return row.fields;
  const [lead] = row.fields;
  return rowAnswer[lead.key] === true ? row.fields : [lead];
}

export function TableCardFlow({ rows, value, onChange }: TableCardFlowProps) {
  const safeValue = rows.map((_, i) => value[i] ?? {});
  const [rowIndex, setRowIndex] = useState(0);
  const [fieldIndex, setFieldIndex] = useState(0);

  const clampedRowIndex = Math.min(rowIndex, rows.length - 1);
  const row = rows[clampedRowIndex];
  const rowAnswer = safeValue[clampedRowIndex];
  const fields = getVisibleFields(row, rowAnswer);
  const clampedFieldIndex = Math.min(fieldIndex, fields.length - 1);
  const field = fields[clampedFieldIndex];

  function updateField(key: string, val: unknown) {
    const updatedRow = { ...safeValue[clampedRowIndex], [key]: val };
    onChange(safeValue.map((r, i) => (i === clampedRowIndex ? updatedRow : r)));
    return updatedRow;
  }

  function advanceFrom(
    updatedRowAnswer: Record<string, unknown>,
    fromKey: string
  ) {
    const stillVisible = getVisibleFields(row, updatedRowAnswer);
    const idx = stillVisible.findIndex((f) => f.key === fromKey);
    if (idx + 1 < stillVisible.length) {
      setFieldIndex(idx + 1);
    } else if (clampedRowIndex + 1 < rows.length) {
      setRowIndex(clampedRowIndex + 1);
      setFieldIndex(0);
    }
    // Last field of the last row: nothing to advance to — the outer Continue
    // button (driven by isStepAnswered) lights up once this commits.
  }

  function answerAndAutoAdvance(key: string, val: unknown) {
    const updated = updateField(key, val);
    window.setTimeout(() => advanceFrom(updated, key), AUTO_ADVANCE_DELAY_MS);
  }

  function goBack() {
    if (clampedFieldIndex > 0) {
      setFieldIndex(clampedFieldIndex - 1);
    } else if (clampedRowIndex > 0) {
      const prevRow = rows[clampedRowIndex - 1];
      const prevAnswer = safeValue[clampedRowIndex - 1];
      setRowIndex(clampedRowIndex - 1);
      setFieldIndex(getVisibleFields(prevRow, prevAnswer).length - 1);
    }
  }

  const canGoBack = clampedRowIndex > 0 || clampedFieldIndex > 0;
  const currentValue = rowAnswer[field.key];

  // The habits table's lead field always shares its row's label exactly
  // ("Do you smoke?" as both) — showing it twice (once tiny above, once as
  // the real question) read as confusing rather than as context, so it's
  // only shown separately when it actually adds information (product/
  // procedure rows, where the row is the product name, not the question).
  const showRowLabel = row.label !== field.label;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-ink-soft font-mono text-xs tracking-wide uppercase">
          Row {clampedRowIndex + 1} of {rows.length}
        </span>
        {canGoBack && (
          <button
            type="button"
            onClick={goBack}
            className="flex min-h-11 items-center px-2 text-sm underline underline-offset-2"
          >
            Back
          </button>
        )}
      </div>

      {/* A bare keyed motion.div (no AnimatePresence/exit) rather than mode="wait":
          fields change fast here (auto-advance + back navigation revisiting
          earlier fields), and mode="wait" depends on an exit-complete callback
          that's unreliable under rapid/backgrounded-tab conditions — see
          IntakeFlow.tsx's investigation note. A fresh mount still plays its own
          enter animation on every key change, which is what actually matters. */}
      <motion.div
        key={`${clampedRowIndex}-${field.key}`}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={motionTransition(0.18)}
        className="relative flex flex-col gap-4 overflow-hidden"
      >
        <HabitRowArt habitKey={row.fields[0].key} />
        <div className="flex flex-col gap-1">
          {showRowLabel && (
            <p className="text-ink text-lg font-semibold">{row.label}</p>
          )}
          <h3 className="text-ink text-2xl font-medium">{field.label}</h3>
        </div>

        {field.type === "yesno" && (
          <YesNoSwipeCard
            value={(currentValue as boolean | null) ?? null}
            onChange={(v) => answerAndAutoAdvance(field.key, v)}
          />
        )}

        {field.type === "single" && (
          <ChipSelect
            questionKey={field.key}
            options={field.options ?? []}
            mode="single"
            value={(currentValue as string | null) ?? null}
            onChange={(v) => answerAndAutoAdvance(field.key, v)}
          />
        )}

        {field.type === "text" && (
          <div className="flex flex-col items-start gap-3">
            <VoiceTextInput
              value={(currentValue as string | null) ?? ""}
              onChange={(v) => updateField(field.key, v)}
              placeholder="Type here…"
            />
            <button
              type="button"
              onClick={() => advanceFrom(rowAnswer, field.key)}
              className="bg-gradient-root-solid min-h-11 rounded-full px-6 py-3 text-base font-medium text-white"
            >
              Next
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

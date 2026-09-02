import { INTAKE_SCHEMA, type Question } from "@/lib/schema/intake-schema";

// Patient-facing copy for the table questions (Q11-Q13) — kept separate from
// lib/schema for the same reason as question-copy.ts: schema is the pure data
// contract, this is presentation.
const FIELD_LABELS: Record<string, string> = {
  smoking: "Do you smoke?",
  smoking_severity: "About how much?",
  alcohol: "Do you drink alcohol?",
  hard_water: "Is your water hard or mineral-heavy?",
  hair_wash_frequency: "How often do you wash your hair?",
  heating_tools_styling_chemicals:
    "Do you use heating tools or styling chemicals?",
  salon_treatments: "Any salon treatments — keratin, rebonding, smoothening?",
  salon_treatment_detail: "Which treatment, and roughly when?",
  used: "Have you used this?",
  duration: "For how long?",
  helped: "Did it help?",
  side_effects: "Any side effects?",
  done: "Have you had this done?",
  sessions: "How many sessions?",
};

export interface RowFieldConfig {
  key: string;
  label: string;
  type: "yesno" | "single" | "text";
  options?: string[];
}

export interface RowConfig {
  label: string;
  fields: RowFieldConfig[];
}

function findQuestion(key: string): Question {
  const question = INTAKE_SCHEMA.sections
    .flatMap((s) => s.questions)
    .find((q) => q.key === key);
  if (!question) throw new Error(`Unknown table question: ${key}`);
  return question;
}

/** Q11 — six heterogeneous rows, each its own field (+ optional yes/no-gated followup). */
export function getHabitsRowConfigs(): RowConfig[] {
  const habits = findQuestion("habits");
  if (!("rows" in habits) || !Array.isArray(habits.rows)) return [];

  return (
    habits.rows as {
      key: string;
      type: "yesno" | "single";
      options?: string[];
      followup?: { key: string; type: "single" | "text"; options?: string[] };
    }[]
  ).map((row) => {
    const fields: RowFieldConfig[] = [
      {
        key: row.key,
        label: FIELD_LABELS[row.key] ?? row.key,
        type: row.type,
        options: row.options,
      },
    ];
    if (row.followup) {
      fields.push({
        key: row.followup.key,
        label: FIELD_LABELS[row.followup.key] ?? row.followup.key,
        type: row.followup.type,
        options: row.followup.options,
      });
    }
    return { label: FIELD_LABELS[row.key] ?? row.key, fields };
  });
}

/** Q12/Q13 — uniform rows sharing the same column set; "bool" columns render as yes/no. */
export function getUniformRowConfigs(
  questionKey: "products" | "procedures"
): RowConfig[] {
  const question = findQuestion(questionKey);
  if (!("rows" in question) || !("columns" in question)) return [];

  const rows = question.rows as string[];
  const columns = question.columns as {
    key: string;
    type: "bool" | "single" | "yesno";
    options?: string[];
  }[];

  return rows.map((rowLabel) => ({
    label: rowLabel,
    fields: columns.map((col) => ({
      key: col.key,
      label: FIELD_LABELS[col.key] ?? col.key,
      type: col.type === "bool" ? "yesno" : col.type,
      options: col.options,
    })),
  }));
}

// --- Adapters between TableCardFlow's normalized `Record<string,unknown>[]`
// (positionally aligned with a RowConfig[]) and the store's actual shapes. ---

/** habits is a single flat object in the store, not an array — split it into
 * one slice per row so TableCardFlow can treat it like the other two tables. */
export function habitsToRows(
  habits: Record<string, unknown>,
  rowConfigs: RowConfig[]
): Record<string, unknown>[] {
  return rowConfigs.map((row) => {
    const slice: Record<string, unknown> = {};
    for (const field of row.fields) {
      if (habits[field.key] !== undefined) slice[field.key] = habits[field.key];
    }
    return slice;
  });
}

export function rowsToHabits(
  rows: Record<string, unknown>[]
): Record<string, unknown> {
  return rows.reduce<Record<string, unknown>>(
    (acc, row) => Object.assign(acc, row),
    {}
  );
}

/** products/procedures are already arrays positionally aligned with the schema's
 * row order — this just re-attaches the `row` label TableCardFlow doesn't manage. */
export function withRowLabels(
  rows: Record<string, unknown>[],
  rowConfigs: RowConfig[]
): Record<string, unknown>[] {
  return rows.map((row, i) => ({ ...row, row: rowConfigs[i].label }));
}

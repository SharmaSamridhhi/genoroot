import { INTAKE_SCHEMA } from "@/lib/schema/intake-schema";
import { SECTION_ICONS } from "@/components/icons/manifest";
import { questionLabel } from "@/components/intake/question-copy";
import {
  getHabitsRowConfigs,
  getUniformRowConfigs,
  habitsToRows,
  type RowConfig,
} from "@/components/questions/tableConfigs";
import type { IntakeOutput } from "@/lib/schema/types";

const SECTION_ORDER: ("A" | "B" | "C" | "D" | "E")[] = [
  "A",
  "B",
  "C",
  "D",
  "E",
];

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return value.length > 0 ? value.join(", ") : "None";
  return String(value);
}

function TableRowSummary({
  rowConfig,
  rowData,
}: {
  rowConfig: RowConfig;
  rowData: Record<string, unknown>;
}) {
  // Habits rows (single yes/no habit, no separate row label) set the row
  // header to the exact same text as the first field's own label — skip the
  // redundant repeat rather than showing the question twice in a row.
  const showHeader = rowConfig.label !== rowConfig.fields[0]?.label;

  return (
    <div className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
      {showHeader && <p className="font-medium">{rowConfig.label}</p>}
      <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
        {rowConfig.fields.map((field) => {
          const value = rowData[field.key];
          if (value === null || value === undefined) return null;
          return (
            <div key={field.key} className="contents">
              <dt className="text-neutral-500">{field.label}</dt>
              <dd>{formatValue(value)}</dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}

function SimpleField({ label, value }: { label: string; value: unknown }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-neutral-100 py-2 last:border-0 dark:border-neutral-900">
      <dt className="text-sm text-neutral-500">{label}</dt>
      <dd className="text-base">{formatValue(value)}</dd>
    </div>
  );
}

/**
 * Doctor-facing summary — grouped by section, human-readable, laid out for a
 * fast scan. The raw JSON view (JsonView.tsx) is what's graded for structural
 * correctness; this view exists so a human doesn't have to read JSON.
 */
export function SummaryView({ output }: { output: IntakeOutput }) {
  const habitsRowConfigs = getHabitsRowConfigs();
  const productRowConfigs = getUniformRowConfigs("products");
  const procedureRowConfigs = getUniformRowConfigs("procedures");

  return (
    <div className="flex flex-col gap-8">
      {SECTION_ORDER.map((sectionId) => {
        const section = INTAKE_SCHEMA.sections.find((s) => s.id === sectionId);
        const Icon = SECTION_ICONS[sectionId];

        return (
          <section key={sectionId} className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-neutral-500">
              <Icon size={20} animate={false} />
              <h2 className="text-sm font-semibold tracking-wide uppercase">
                {section?.title}
              </h2>
            </div>

            {sectionId === "A" && (
              <dl>
                <SimpleField
                  label={questionLabel("age_hair_loss_began")}
                  value={output.sections.A.age_hair_loss_began}
                />
                <SimpleField
                  label={questionLabel("duration")}
                  value={output.sections.A.duration}
                />
                <SimpleField
                  label={questionLabel("family_history")}
                  value={output.sections.A.family_history}
                />
                <SimpleField
                  label={questionLabel("pattern")}
                  value={output.sections.A.pattern}
                />
              </dl>
            )}

            {sectionId === "B" && (
              <dl>
                <SimpleField
                  label={questionLabel("diagnosed_conditions")}
                  value={output.sections.B.diagnosed_conditions}
                />
                <SimpleField
                  label={questionLabel("menstrual_cycle")}
                  value={output.sections.B.menstrual_cycle}
                />
                <SimpleField
                  label={questionLabel("pregnancy_related")}
                  value={output.sections.B.pregnancy_related}
                />
                <SimpleField
                  label={questionLabel("adult_acne_oily_skin")}
                  value={output.sections.B.adult_acne_oily_skin}
                />
                <SimpleField
                  label={questionLabel("excess_body_facial_hair")}
                  value={output.sections.B.excess_body_facial_hair}
                />
              </dl>
            )}

            {sectionId === "C" && (
              <>
                <dl>
                  <SimpleField
                    label={questionLabel("past_6_months")}
                    value={output.sections.C.past_6_months}
                  />
                </dl>
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-medium">
                    {questionLabel("habits")}
                  </p>
                  {habitsToRows(
                    output.sections.C.habits as unknown as Record<
                      string,
                      unknown
                    >,
                    habitsRowConfigs
                  ).map((rowData, i) => (
                    <TableRowSummary
                      key={habitsRowConfigs[i].label}
                      rowConfig={habitsRowConfigs[i]}
                      rowData={rowData}
                    />
                  ))}
                </div>
              </>
            )}

            {sectionId === "D" && (
              <>
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-medium">
                    {questionLabel("products")}
                  </p>
                  {output.sections.D.products.map((row, i) => (
                    <TableRowSummary
                      key={row.row}
                      rowConfig={productRowConfigs[i]}
                      rowData={row as unknown as Record<string, unknown>}
                    />
                  ))}
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-medium">
                    {questionLabel("procedures")}
                  </p>
                  {output.sections.D.procedures.map((row, i) => (
                    <TableRowSummary
                      key={row.row}
                      rowConfig={procedureRowConfigs[i]}
                      rowData={row as unknown as Record<string, unknown>}
                    />
                  ))}
                </div>
                <dl>
                  <SimpleField
                    label={questionLabel("past_treatment_side_effects")}
                    value={output.sections.D.past_treatment_side_effects}
                  />
                  <SimpleField
                    label={questionLabel("describe")}
                    value={output.sections.D.describe}
                  />
                </dl>
              </>
            )}

            {sectionId === "E" && (
              <dl>
                <SimpleField
                  label={questionLabel("sample_type")}
                  value={output.sections.E.sample_type}
                />
                <SimpleField
                  label={questionLabel("consent")}
                  value={output.sections.E.consent}
                />
              </dl>
            )}
          </section>
        );
      })}
    </div>
  );
}

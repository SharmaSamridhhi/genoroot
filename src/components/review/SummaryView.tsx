import { INTAKE_SCHEMA } from "@/lib/schema/intake-schema";
import { SECTION_ICONS } from "@/components/icons/manifest";
import { questionLabel } from "@/components/intake/question-copy";
import { stripEmphasis } from "@/components/intake/renderEmphasis";
import {
  getHabitsRowConfigs,
  getUniformRowConfigs,
  habitsToRows,
  type RowConfig,
} from "@/components/questions/tableConfigs";
import type { IntakeOutput } from "@/lib/schema/types";

// This view's labels are small <dt> text, not headlines — the *phrase*
// emphasis markers (GR-019) are for QuestionRenderer's big headlines only,
// so this strips them back to plain text rather than rendering JSX emphasis.
function label(key: string): string {
  return stripEmphasis(questionLabel(key));
}

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
    <div className="border-line rounded-lg border p-3">
      {showHeader && (
        <p className="text-ink text-base font-semibold">{rowConfig.label}</p>
      )}
      <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
        {rowConfig.fields.map((field) => {
          const value = rowData[field.key];
          if (value === null || value === undefined) return null;
          return (
            <div key={field.key} className="contents">
              <dt className="text-ink-soft">{field.label}</dt>
              <dd className="text-ink">{formatValue(value)}</dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}

function SimpleField({ label, value }: { label: string; value: unknown }) {
  return (
    <div className="border-line/60 flex flex-col gap-0.5 border-b py-2 last:border-0">
      <dt className="text-ink-soft text-sm">{label}</dt>
      <dd className="text-ink text-base">{formatValue(value)}</dd>
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
            <div className="text-moss-deep flex items-center gap-2">
              <Icon size={20} animate={false} />
              <h2 className="font-mono text-sm font-medium tracking-wide uppercase">
                {section?.title}
              </h2>
            </div>

            {sectionId === "A" && (
              <dl>
                <SimpleField
                  label={label("age_hair_loss_began")}
                  value={output.sections.A.age_hair_loss_began}
                />
                <SimpleField
                  label={label("duration")}
                  value={output.sections.A.duration}
                />
                <SimpleField
                  label={label("family_history")}
                  value={output.sections.A.family_history}
                />
                <SimpleField
                  label={label("pattern")}
                  value={output.sections.A.pattern}
                />
              </dl>
            )}

            {sectionId === "B" && (
              <dl>
                <SimpleField
                  label={label("diagnosed_conditions")}
                  value={output.sections.B.diagnosed_conditions}
                />
                <SimpleField
                  label={label("menstrual_cycle")}
                  value={output.sections.B.menstrual_cycle}
                />
                <SimpleField
                  label={label("pregnancy_related")}
                  value={output.sections.B.pregnancy_related}
                />
                <SimpleField
                  label={label("adult_acne_oily_skin")}
                  value={output.sections.B.adult_acne_oily_skin}
                />
                <SimpleField
                  label={label("excess_body_facial_hair")}
                  value={output.sections.B.excess_body_facial_hair}
                />
              </dl>
            )}

            {sectionId === "C" && (
              <>
                <dl>
                  <SimpleField
                    label={label("past_6_months")}
                    value={output.sections.C.past_6_months}
                  />
                </dl>
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-medium">{label("habits")}</p>
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
                  <p className="text-sm font-medium">{label("products")}</p>
                  {output.sections.D.products.map((row, i) => (
                    <TableRowSummary
                      key={row.row}
                      rowConfig={productRowConfigs[i]}
                      rowData={row as unknown as Record<string, unknown>}
                    />
                  ))}
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-medium">{label("procedures")}</p>
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
                    label={label("past_treatment_side_effects")}
                    value={output.sections.D.past_treatment_side_effects}
                  />
                  <SimpleField
                    label={label("describe")}
                    value={output.sections.D.describe}
                  />
                </dl>
              </>
            )}

            {sectionId === "E" && (
              <dl>
                <SimpleField
                  label={label("sample_type")}
                  value={output.sections.E.sample_type}
                />
                <SimpleField
                  label={label("consent")}
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

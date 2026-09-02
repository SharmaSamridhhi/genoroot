// Patient-facing question text, drawn from the brief's prose descriptions — kept
// separate from lib/schema (which is the pure data contract: keys/types/options,
// no copy) since this is presentation, not the graded structure.
// The optional `*phrase*` marker names the one phrase per question worth the
// mixed-type emphasis treatment (GR-019) — parsed by renderEmphasis(). Kept
// to at most one per label; not every label needs one.
export const QUESTION_LABELS: Record<string, string> = {
  age_hair_loss_began: "At what age did your hair loss *begin*?",
  duration: "How long have you been noticing *hair loss*?",
  family_history: "Does anyone in your *family* have hair loss?",
  pattern: "What *pattern* does your hair loss follow?",
  diagnosed_conditions: "Have you been *diagnosed* with any of these?",
  menstrual_cycle: "How would you describe your *menstrual cycle*?",
  pregnancy_related: "Are you currently *pregnant* or postpartum?",
  adult_acne_oily_skin: "Do you have *acne* or oily skin as an adult?",
  excess_body_facial_hair: "Do you have *excess* body or facial hair growth?",
  past_6_months: "In the past *6 months*, has any of this applied to you?",
  habits: "Tell us about your everyday *hair care* habits",
  products: "Which of these have you *used* on your hair?",
  procedures: "Have you had any *in-clinic* procedures?",
  past_treatment_side_effects:
    "Did any past treatment cause *side effects* or not help?",
  describe: "Tell us *what happened*",
  sample_type: "Which *sample* would you prefer to give?",
  consent: "Do you consent to sample collection and *genetic analysis*?",
};

export function questionLabel(key: string): string {
  return QUESTION_LABELS[key] ?? key;
}

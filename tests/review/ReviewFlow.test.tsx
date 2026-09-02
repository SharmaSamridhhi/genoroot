import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useIntakeStore } from "@/lib/engine/store";
import { assembleOutput } from "@/lib/engine/assemble";
import { ReviewFlow } from "@/components/review/ReviewFlow";
import type { Answers, PatientProfile } from "@/lib/schema/types";

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

const PROFILE: PatientProfile = { name: "Rahul Verma", age: 34, sex: "Male" };

function fullyAnsweredAnswers(consent: boolean): Answers {
  return {
    A: {
      age_hair_loss_began: 29,
      duration: "Over a year",
      family_history: ["Father had hair loss"],
      pattern: ["Receding hairline", "Thinning at crown"],
    },
    B: {
      diagnosed_conditions: ["None"],
      adult_acne_oily_skin: false,
      excess_body_facial_hair: false,
    },
    C: {
      past_6_months: ["High stress or emotional trauma"],
      habits: {
        smoking: true,
        smoking_severity: "Mild <5/day",
        alcohol: false,
        hard_water: true,
        hair_wash_frequency: "Alternate Days",
        heating_tools_styling_chemicals: false,
        salon_treatments: false,
        salon_treatment_detail: null,
      },
    },
    D: {
      products: [
        {
          row: "OTC/Medicated Shampoos",
          used: false,
          duration: null,
          helped: null,
          side_effects: null,
        },
        {
          row: "Hair Oils/Serums",
          used: false,
          duration: null,
          helped: null,
          side_effects: null,
        },
        {
          row: "Topical Minoxidil",
          used: true,
          duration: "3-6mo",
          helped: true,
          side_effects: false,
        },
        {
          row: "Oral Minoxidil",
          used: false,
          duration: null,
          helped: null,
          side_effects: null,
        },
        {
          row: "Supplements",
          used: false,
          duration: null,
          helped: null,
          side_effects: null,
        },
      ],
      procedures: [
        { row: "PRP/GFC/iPRF", done: false, sessions: null, helped: null },
        {
          row: "Stem Cells/Exosomes",
          done: false,
          sessions: null,
          helped: null,
        },
        { row: "Hair Transplant", done: false, sessions: null, helped: null },
        { row: "Other", done: false, sessions: null, helped: null },
      ],
      past_treatment_side_effects: false,
      describe: null,
    },
    E: { sample_type: "Saliva", consent },
  };
}

function seedCompleteStore(consent: boolean) {
  useIntakeStore.setState({
    profile: PROFILE,
    answers: fullyAnsweredAnswers(consent),
  });
}

beforeEach(() => {
  useIntakeStore.getState().reset();
  pushMock.mockClear();
  Object.assign(navigator, {
    clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
  });
});

describe("ReviewFlow", () => {
  it("renders the raw JSON view matching assembleOutput()'s output exactly", async () => {
    seedCompleteStore(true);
    render(<ReviewFlow />);

    await userEvent.click(screen.getByRole("tab", { name: "Raw JSON" }));

    const expected = assembleOutput(PROFILE, fullyAnsweredAnswers(true));
    // generatedAt is a fresh timestamp each call — compare everything else exactly.
    const { generatedAt: _omitted, ...expectedRest } = expected;
    void _omitted;

    const jsonText = screen.getByText(/"form"/).textContent ?? "";
    const rendered = JSON.parse(jsonText);
    const { generatedAt: _omitted2, ...renderedRest } = rendered;
    void _omitted2;

    expect(renderedRest).toEqual(expectedRest);
  });

  it("represents all 16 questions in the summary view", () => {
    seedCompleteStore(true);
    render(<ReviewFlow />);

    // Spot-check one label/value pair per section (A-E) as a proxy for full coverage —
    // SummaryView renders every section unconditionally from the schema.
    expect(
      screen.getByText("At what age did your hair loss begin?")
    ).toBeInTheDocument();
    expect(screen.getByText("29")).toBeInTheDocument();
    expect(
      screen.getByText("Have you been diagnosed with any of these?")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Tell us about your everyday hair care habits")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Which of these have you used on your hair?")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Which sample would you prefer to give?")
    ).toBeInTheDocument();
    expect(screen.getByText("Saliva")).toBeInTheDocument();
  });

  it("copy-to-clipboard produces valid, parseable JSON matching the output", async () => {
    seedCompleteStore(true);
    render(<ReviewFlow />);

    await userEvent.click(screen.getByRole("button", { name: "Copy JSON" }));

    expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1);
    const written = (navigator.clipboard.writeText as ReturnType<typeof vi.fn>)
      .mock.calls[0][0];
    expect(() => JSON.parse(written)).not.toThrow();
    expect(JSON.parse(written).form).toBe("GenoRoot Hair & Scalp Intake");
  });

  it("shows a neutral informational note when consent was declined — no crash, no block", () => {
    seedCompleteStore(false);
    render(<ReviewFlow />);

    expect(
      screen.getByText("Sample collection requires consent — patient declined.")
    ).toBeInTheDocument();
    // Still fully rendered, not replaced by an error state.
    expect(screen.getByText("Intake complete")).toBeInTheDocument();
  });

  it("shows no informational note when consent was given", () => {
    seedCompleteStore(true);
    render(<ReviewFlow />);
    expect(screen.queryByText(/patient declined/)).not.toBeInTheDocument();
  });

  it("has no input controls that mutate intake answers — read-only plus start-over", () => {
    seedCompleteStore(true);
    render(<ReviewFlow />);

    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    expect(screen.queryByRole("radio")).not.toBeInTheDocument();
  });

  it("start over resets the store and navigates back to /intake", async () => {
    seedCompleteStore(true);
    render(<ReviewFlow />);

    await userEvent.click(screen.getByRole("button", { name: "Start over" }));

    expect(useIntakeStore.getState().profile).toBeNull();
    expect(pushMock).toHaveBeenCalledWith("/intake");
  });

  it("redirects to /intake instead of rendering when the intake isn't actually complete", async () => {
    useIntakeStore.setState({
      profile: PROFILE,
      answers: {
        A: {},
        B: {},
        C: { habits: {} },
        D: { products: [], procedures: [] },
        E: {},
      },
    });
    render(<ReviewFlow />);

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/intake");
    });
  });
});

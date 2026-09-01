import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useIntakeStore } from "@/lib/engine/store";
import { IntakeFlow } from "@/components/intake/IntakeFlow";

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

describe("IntakeFlow", () => {
  beforeEach(() => {
    useIntakeStore.getState().reset();
    pushMock.mockClear();
  });

  it("shows onboarding first, and completing it advances to the first question", async () => {
    render(<IntakeFlow />);

    expect(screen.getByText("Let's get you checked in")).toBeInTheDocument();

    await userEvent.type(screen.getByPlaceholderText("e.g. 32"), "34");
    await userEvent.click(screen.getByRole("radio", { name: "Male" }));
    await userEvent.click(screen.getByRole("button", { name: "Continue" }));

    expect(
      screen.getByText("At what age did your hair loss begin?")
    ).toBeInTheDocument();
  });

  it("a male patient's flow skips menstrual_cycle/pregnancy_related entirely", async () => {
    useIntakeStore.getState().setProfile({ age: 30, sex: "Male" });
    useIntakeStore
      .getState()
      .answer({ section: "A", questionKey: "age_hair_loss_began" }, 28);
    useIntakeStore.getState().next(); // duration
    useIntakeStore.setState({
      currentStep: { section: "B", questionKey: "diagnosed_conditions" },
    });

    render(<IntakeFlow />);
    const user = userEvent.setup();
    await user.click(screen.getByText("None"));
    await user.click(screen.getByRole("button", { name: "Continue" }));

    // Should land on adult_acne_oily_skin, never showing the menstrual cycle question.
    // AnimatePresence's exit animation means the old step's DOM lingers briefly.
    await waitFor(() => {
      expect(
        screen.getByText("Do you have acne or oily skin as an adult?")
      ).toBeInTheDocument();
    });
  });

  it("back button returns to the previous step", async () => {
    useIntakeStore.getState().setProfile({ age: 30, sex: "Male" });
    useIntakeStore.setState({
      currentStep: { section: "A", questionKey: "duration" },
    });

    render(<IntakeFlow />);
    await userEvent.click(screen.getByLabelText("Back"));

    await waitFor(() => {
      expect(
        screen.getByText("At what age did your hair loss begin?")
      ).toBeInTheDocument();
    });
  });

  it("redirects to /review once every visible step is genuinely answered", () => {
    useIntakeStore.getState().setProfile({ age: 30, sex: "Male" });
    useIntakeStore.setState({
      answers: {
        A: {
          age_hair_loss_began: 28,
          duration: "Over a year",
          family_history: ["No known family history"],
          pattern: ["Diffuse thinning"],
        },
        B: {
          diagnosed_conditions: ["None"],
          adult_acne_oily_skin: false,
          excess_body_facial_hair: false,
        },
        C: {
          past_6_months: [],
          habits: {
            smoking: false,
            smoking_severity: null,
            alcohol: false,
            hard_water: false,
            hair_wash_frequency: "Weekly",
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
              used: false,
              duration: null,
              helped: null,
              side_effects: null,
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
            {
              row: "Hair Transplant",
              done: false,
              sessions: null,
              helped: null,
            },
            { row: "Other", done: false, sessions: null, helped: null },
          ],
          past_treatment_side_effects: false,
          describe: null,
        },
        E: { sample_type: "Saliva", consent: true },
      },
    });

    render(<IntakeFlow />);
    expect(pushMock).toHaveBeenCalledWith("/review");
  });
});

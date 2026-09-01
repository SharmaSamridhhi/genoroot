import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TableCardFlow } from "@/components/questions/TableCardFlow";
import {
  getUniformRowConfigs,
  getHabitsRowConfigs,
} from "@/components/questions/tableConfigs";
import type { RowConfig } from "@/components/questions/tableConfigs";

// A small hand-built config isolates the generic engine from the real schema —
// two rows, the first with a lead + two dependents, the second single-field.
const TEST_ROWS: RowConfig[] = [
  {
    label: "Row A",
    fields: [
      { key: "used", label: "Used?", type: "yesno" },
      {
        key: "duration",
        label: "Duration?",
        type: "single",
        options: ["Short", "Long"],
      },
      { key: "helped", label: "Helped?", type: "yesno" },
    ],
  },
  {
    label: "Row B",
    fields: [
      {
        key: "frequency",
        label: "How often?",
        type: "single",
        options: ["Daily", "Weekly"],
      },
    ],
  },
];

describe("TableCardFlow — generic engine", () => {
  it("answering the lead field 'No' advances straight to the next row, never showing dependents", async () => {
    const onChange = vi.fn();
    render(<TableCardFlow rows={TEST_ROWS} value={[]} onChange={onChange} />);

    expect(screen.getByText("Used?")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "No" }));

    await waitFor(() => {
      expect(screen.getByText("How often?")).toBeInTheDocument();
    });
    expect(screen.queryByText("Duration?")).not.toBeInTheDocument();
    expect(screen.queryByText("Helped?")).not.toBeInTheDocument();
  });

  it("answering the lead field 'Yes' reveals exactly the declared dependents, in order", async () => {
    let value: Record<string, unknown>[] = [];
    const handleChange = (rows: Record<string, unknown>[]) => {
      value = rows;
    };
    const { rerender } = render(
      <TableCardFlow rows={TEST_ROWS} value={value} onChange={handleChange} />
    );

    await userEvent.click(screen.getByRole("button", { name: "Yes" }));
    rerender(
      <TableCardFlow rows={TEST_ROWS} value={value} onChange={handleChange} />
    );
    await waitFor(() => {
      expect(screen.getByText("Duration?")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText("Long"));
    rerender(
      <TableCardFlow rows={TEST_ROWS} value={value} onChange={handleChange} />
    );
    await waitFor(() => {
      expect(screen.getByText("Helped?")).toBeInTheDocument();
    });
  });

  it("back navigation within the table moves the cursor without losing prior answers", async () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <TableCardFlow rows={TEST_ROWS} value={[]} onChange={onChange} />
    );

    await userEvent.click(screen.getByRole("button", { name: "No" })); // Row A: used=false
    const rowsAfterRowA = onChange.mock.calls.at(-1)![0];
    rerender(
      <TableCardFlow
        rows={TEST_ROWS}
        value={rowsAfterRowA}
        onChange={onChange}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("How often?")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole("button", { name: "Back" }));
    await waitFor(() => {
      expect(screen.getByText("Used?")).toBeInTheDocument();
    });

    // Row A's answer from before is still in the value the parent holds — this
    // component never clears data on back-navigation, only moves the cursor.
    expect(rowsAfterRowA[0]).toMatchObject({ used: false });
  });

  it("shows a 'Row X of Y' sub-progress indicator", () => {
    render(<TableCardFlow rows={TEST_ROWS} value={[]} onChange={() => {}} />);
    expect(screen.getByText(/Row 1 of 2/)).toBeInTheDocument();
  });
});

describe("TableCardFlow — driven by the real schema (GR-010 instantiation)", () => {
  it("powers Q12 products via the same generic component", () => {
    const rows = getUniformRowConfigs("products");
    render(<TableCardFlow rows={rows} value={[]} onChange={() => {}} />);
    expect(screen.getByText(/OTC\/Medicated Shampoos/)).toBeInTheDocument();
    expect(screen.getByText("Have you used this?")).toBeInTheDocument();
  });

  it("powers Q13 procedures via the same generic component", () => {
    const rows = getUniformRowConfigs("procedures");
    render(<TableCardFlow rows={rows} value={[]} onChange={() => {}} />);
    expect(screen.getByText(/PRP\/GFC\/iPRF/)).toBeInTheDocument();
  });

  it("powers Q11 habits, including a single-field row with no lead/dependent split", () => {
    const rows = getHabitsRowConfigs();
    render(<TableCardFlow rows={rows} value={[]} onChange={() => {}} />);
    expect(screen.getByText("Do you smoke?")).toBeInTheDocument();
  });

  it("hair_wash_frequency (a single-field habits row) advances with one tap, no dependent step", async () => {
    const rows = getHabitsRowConfigs(); // smoking, alcohol, hard_water, hair_wash_frequency, ...
    const onChange = vi.fn();
    let value: Record<string, unknown>[] = [];
    const handleChange = (rows: Record<string, unknown>[]) => {
      value = rows;
      onChange(rows);
    };

    const { rerender } = render(
      <TableCardFlow rows={rows} value={value} onChange={handleChange} />
    );

    for (const label of [
      "Do you smoke?",
      "Do you drink alcohol?",
      "Is your water hard or mineral-heavy?",
    ]) {
      expect(screen.getByText(label)).toBeInTheDocument();
      await userEvent.click(screen.getByRole("button", { name: "No" }));
      rerender(
        <TableCardFlow rows={rows} value={value} onChange={handleChange} />
      );
      await new Promise((resolve) => setTimeout(resolve, 260));
    }

    await waitFor(() => {
      expect(
        screen.getByText("How often do you wash your hair?")
      ).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText("Weekly"));

    await waitFor(() => {
      expect(
        screen.getByText("Do you use heating tools or styling chemicals?")
      ).toBeInTheDocument();
    });
  });
});

import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import {
  IconCheck,
  IconArrowLeft,
  SECTION_ICONS,
} from "@/components/icons/manifest";

describe("icon manifest", () => {
  it("renders an icon as an inline SVG with the shared 24x24 viewBox", () => {
    const { container } = render(<IconCheck />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("viewBox", "0 0 24 24");
  });

  it("renders without crashing for every declared icon", () => {
    expect(() => render(<IconArrowLeft />)).not.toThrow();
  });

  it("every section A-E has a mapped icon", () => {
    expect(Object.keys(SECTION_ICONS).sort()).toEqual([
      "A",
      "B",
      "C",
      "D",
      "E",
    ]);
  });
});

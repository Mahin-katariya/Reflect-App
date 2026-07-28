import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Heatmap from "./Heatmap";
import type { HeatCell } from "./Heatmap";

// Sequential day-cells starting Jan 1 2026 with the given per-day counts.
function cells(counts: number[]): HeatCell[] {
  return counts.map((count, i) => ({
    date: `2026-01-${String(i + 1).padStart(2, "0")}`,
    count,
    level: 0,
  }));
}

describe("Heatmap", () => {
  it("renders one block per week for the whole calendar year (Jan 1 → Dec 31)", () => {
    // 2026 has 365 days → ceil(365 / 7) = 53 week-blocks, regardless of data.
    render(<Heatmap cells={[]} today="2026-07-28" />);
    expect(screen.getAllByTestId("heat-cell")).toHaveLength(53);
  });

  it("colors a block by its week's total (widened weekly buckets)", () => {
    // Jan 1–7 total 7 → level 2; a later, data-less week stays level 0.
    render(<Heatmap cells={cells([1, 1, 1, 1, 1, 1, 1])} today="2026-07-28" />);
    const blocks = screen.getAllByTestId("heat-cell");
    expect(blocks[0].getAttribute("data-level")).toBe("2");
    expect(blocks[20].getAttribute("data-level")).toBe("0");
  });

  it("ignores counts from other years", () => {
    const withPriorYear: HeatCell[] = [{ date: "2025-12-31", count: 9, level: 0 }];
    render(<Heatmap cells={withPriorYear} today="2026-07-28" />);
    // Still exactly one year of blocks; the 2025 count is not folded in.
    expect(screen.getAllByTestId("heat-cell")).toHaveLength(53);
    expect(screen.getAllByTestId("heat-cell")[0].getAttribute("data-level")).toBe("0");
  });

  it("is exposed as an image for assistive tech", () => {
    render(<Heatmap cells={[]} today="2026-07-28" />);
    expect(screen.getByRole("img", { name: /activity heatmap/i })).toBeInTheDocument();
  });
});

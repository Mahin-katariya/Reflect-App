import { describe, it, expect } from "vitest";
import {
  bucketLevel,
  localDateInTz,
  computeStreak,
  computeActivity,
} from "./activity.js";

describe("bucketLevel", () => {
  it("maps counts to the 5-level scale (0 / 1-2 / 3-5 / 6-9 / 10+)", () => {
    expect(bucketLevel(0)).toBe(0);
    expect(bucketLevel(1)).toBe(1);
    expect(bucketLevel(2)).toBe(1);
    expect(bucketLevel(3)).toBe(2);
    expect(bucketLevel(5)).toBe(2);
    expect(bucketLevel(6)).toBe(3);
    expect(bucketLevel(9)).toBe(3);
    expect(bucketLevel(10)).toBe(4);
    expect(bucketLevel(50)).toBe(4);
  });
});

describe("localDateInTz", () => {
  it("attributes a late-UTC instant to the correct local day", () => {
    // 2026-01-10T23:30Z is still Jan 10 in UTC, but Jan 11 in Tokyo (+9).
    const inst = new Date("2026-01-10T23:30:00Z");
    expect(localDateInTz(inst, "UTC")).toBe("2026-01-10");
    expect(localDateInTz(inst, "Asia/Tokyo")).toBe("2026-01-11");
  });

  it("attributes an early-UTC instant to the previous local day west of UTC", () => {
    // 2026-01-10T02:00Z is Jan 10 UTC, but Jan 9 in Los Angeles (-8).
    const inst = new Date("2026-01-10T02:00:00Z");
    expect(localDateInTz(inst, "America/Los_Angeles")).toBe("2026-01-09");
  });
});

describe("computeStreak", () => {
  const counts = (days: string[]) => {
    const m = new Map<string, number>();
    for (const d of days) m.set(d, (m.get(d) ?? 0) + 1);
    return m;
  };

  it("counts consecutive days ending today", () => {
    const m = counts(["2026-07-25", "2026-07-26", "2026-07-27"]);
    expect(computeStreak(m, "2026-07-27")).toBe(3);
  });

  it("still counts through yesterday when today has no log yet", () => {
    const m = counts(["2026-07-25", "2026-07-26"]);
    expect(computeStreak(m, "2026-07-27")).toBe(2);
  });

  it("is 0 when the streak is broken (gap before today and yesterday)", () => {
    const m = counts(["2026-07-20", "2026-07-21"]);
    expect(computeStreak(m, "2026-07-27")).toBe(0);
  });

  it("stops at the first gap", () => {
    const m = counts(["2026-07-24", "2026-07-26", "2026-07-27"]); // 25th missing
    expect(computeStreak(m, "2026-07-27")).toBe(2);
  });
});

describe("computeActivity", () => {
  it("buckets multiple same-day logs and reflects it in the heatmap", () => {
    const tz = "UTC";
    const now = new Date("2026-07-27T12:00:00Z");
    const instants = [
      new Date("2026-07-27T01:00:00Z"),
      new Date("2026-07-27T02:00:00Z"),
      new Date("2026-07-27T03:00:00Z"), // 3 logs today -> level 2
    ];
    const { today, streak, heatmap } = computeActivity(instants, tz, now);
    expect(today).toBe("2026-07-27");
    expect(streak).toBe(1);
    const cell = heatmap.find((c) => c.date === "2026-07-27");
    expect(cell).toEqual({ date: "2026-07-27", count: 3, level: 2 });
    // clean rectangular grid: 53 full weeks, today included
    expect(heatmap.length).toBe(53 * 7);
    expect(heatmap.some((c) => c.date === "2026-07-27")).toBe(true);
  });

  it("respects the timezone at the day boundary", () => {
    // A 23:30Z log lands on the 11th in Tokyo; 'now' is noon on the 11th there.
    const now = new Date("2026-01-11T03:00:00Z"); // noon Jan 11 in Tokyo
    const instants = [new Date("2026-01-10T23:30:00Z")]; // Jan 11 in Tokyo
    const { today, streak } = computeActivity(instants, "Asia/Tokyo", now);
    expect(today).toBe("2026-01-11");
    expect(streak).toBe(1);
  });
});

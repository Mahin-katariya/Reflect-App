import { describe, it, expect } from "vitest";
import { buildPublicProfile } from "./publicProfile.js";
import type { RawProfile } from "./publicProfile.js";

function profile(overrides: Partial<RawProfile> = {}): RawProfile {
  return {
    id: "p1",
    username: "alice",
    timezone: "UTC",
    createdAt: new Date("2026-01-01T00:00:00Z"),
    topics: [],
    ...overrides,
  };
}

describe("buildPublicProfile", () => {
  it("dedupes resources across a topic's logs (first title wins)", () => {
    const now = new Date("2026-07-27T12:00:00Z");
    const p = profile({
      topics: [
        {
          id: "t1",
          title: "React",
          description: null,
          created_at: new Date("2026-07-01T00:00:00Z"),
          // logs arrive newest-first (as the endpoint orders them)
          logs: [
            {
              id: "l-new",
              title: "day 2",
              created_at: new Date("2026-07-25T00:00:00Z"),
              resources: [
                { id: "r2", url: "https://React.dev/learn/?utm=1", title: "Learn (later)" },
                { id: "r3", url: "https://react.dev/reference", title: "Reference" },
              ],
            },
            {
              id: "l-old",
              title: "day 1",
              created_at: new Date("2026-07-20T00:00:00Z"),
              resources: [{ id: "r1", url: "https://react.dev/learn", title: "Learn (first)" }],
            },
          ],
        },
      ],
    });

    const out = buildPublicProfile(p, now);
    const topic = out.topics[0]!;
    expect(topic.resources).toHaveLength(2);
    const learn = topic.resources.find((r) => r.url.includes("learn"))!;
    expect(learn.title).toBe("Learn (first)"); // oldest log's title wins
    // logs in the list carry only id + title
    expect(topic.logs[0]).toEqual({ id: "l-new", title: "day 2" });
  });

  it("aggregates streak/heatmap across all topics", () => {
    const now = new Date("2026-07-27T12:00:00Z");
    const p = profile({
      topics: [
        {
          id: "t1",
          title: "A",
          description: null,
          created_at: new Date("2026-07-01T00:00:00Z"),
          logs: [
            { id: "a1", title: "x", created_at: new Date("2026-07-26T10:00:00Z"), resources: [] },
          ],
        },
        {
          id: "t2",
          title: "B",
          description: null,
          created_at: new Date("2026-07-02T00:00:00Z"),
          logs: [
            { id: "b1", title: "y", created_at: new Date("2026-07-27T10:00:00Z"), resources: [] },
          ],
        },
      ],
    });

    const out = buildPublicProfile(p, now);
    // logged on the 26th (topic A) and 27th (topic B) -> combined streak of 2
    expect(out.streak).toBe(2);
    expect(out.today).toBe("2026-07-27");
  });
});

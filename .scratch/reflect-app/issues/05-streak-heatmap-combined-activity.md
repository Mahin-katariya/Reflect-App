# 05 — Streak + heatmap: account-level combined activity view

**What to build:** The public profile page shows one combined streak count and GitHub-style
heatmap for the whole Profile, aggregating Logs across all of its Topics, with timezone-aware day
boundaries and color intensity driven by daily log volume.

**Blocked by:** 03

**Status:** ready-for-agent

- [ ] The public profile page shows one combined streak count and heatmap for the whole Profile,
      aggregating Logs across all of its Topics.
- [ ] A calendar day counts toward the streak if the Profile has ≥1 Log (any Topic) that day,
      computed using the Profile's stored timezone — not raw server UTC and not a raw
      client-supplied date.
- [ ] The streak is the count of consecutive such days.
- [ ] The heatmap's per-day cell color reflects that day's Log count via the documented 5-level
      intensity scale (0 / 1–2 / 3–5 / 6–9 / 10+).
- [ ] Backend HTTP tests cover streak calculation (including a broken-streak case and a timezone
      edge case) and heatmap bucketing. Frontend tests cover heatmap rendering from mocked
      day-count data.

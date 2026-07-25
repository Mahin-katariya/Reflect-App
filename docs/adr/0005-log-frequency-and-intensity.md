# ADR 0005: Unlimited Logs per Topic per day; heatmap color = daily log-count intensity

## Status
Accepted

## Context
Problem.md says "a **daily** entry" (singular), suggesting one Log per Topic per calendar day, with
same-day return trips treated as an edit to that day's existing Log. This was the initial
recommendation.

The owner overrode this: multiple Logs per Topic per day should be allowed, with the heatmap
reflecting *volume* via color intensity — the same visual language GitHub uses (darker cell =
more activity that day).

## Decision
**No cap on Logs per Topic per day.** The heatmap's cell **color intensity** is driven by the count
of Logs on that day (across all Topics, per [ADR 0003](./0003-streak-scope.md)), bucketed into a
GitHub-style scale (e.g. none/light/medium/dark/darkest).

The **streak** count remains a separate, binary calculation: a day counts toward the streak if it
has ≥1 Log, regardless of how many. Intensity is a visual layer on top of streak data, not a
replacement for it.

## Consequences
- No "which of today's N logs counts" ambiguity — none needed, since streak is presence-based and
  intensity is volume-based; both derive from the same underlying Log rows via different
  aggregations.
- Slightly more work than a capped-at-one model (needs a count-per-day aggregate, then a bucketing
  function to map counts to color), but bounded and well-understood (same shape as GitHub's own
  contribution graph).

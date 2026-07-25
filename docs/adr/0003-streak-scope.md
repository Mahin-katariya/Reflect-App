# ADR 0003: Streak/heatmap are account-level, combined across Topics

## Status
Accepted

## Context
Once an account could hold multiple Topics ([ADR 0002](./0002-topics-per-account.md)), it became
ambiguous whether the streak/heatmap should be computed per-Topic (e.g. a "System Design" streak
separate from a "Rust" streak) or as one combined view for the whole account.

Per-topic streaks would match Problem.md's "against their goal" (singular) framing, but the owner
explicitly wants a single combined heatmap "just like GitHub's," where any activity that day —
regardless of which repo/topic — fills in that day's cell.

## Decision
The **heatmap and streak are account-level**, aggregated across all Topics. A day's cell is filled
if the account logged *anything*, in *any* Topic, that day. There is no separate per-topic
streak/heatmap in this build.

## Consequences
- Simpler to compute: one query across all Logs for the account, grouped by day — no per-topic
  branching.
- A user who logs consistently in one Topic and neglects another still shows a healthy combined
  streak — accepted as intentional, matching the GitHub reference model.
- Per-topic streak views are a possible future feature, not part of this build.

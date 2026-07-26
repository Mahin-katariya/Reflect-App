# ADR 0002: One public link per account, multiple Topics per account

## Status
Accepted

## Context
Problem.md's core loop is described singularly ("a user enters what they're learning... shows a
streak"), suggesting one goal per account. But the owner described a richer model: a Topic has
`title`, `description`, aggregated `resources`, and a collection of `Log`s — with the clear intent
to track more than one subject (e.g. "System Design" and "Rust") under a single identity.

The alternative — a separate slug/link per topic — was considered but rejected: it multiplies the
surface area (multiple public pages, multiple links to manage/share) without anything in the
requirements asking for it, and doesn't fit a 2-day budget.

## Decision
Each account has exactly **one public link** (`/profile/<slug>`), but that link's page can contain
**multiple Topics**. Each Topic independently holds its own Logs and aggregated Resources.

## Consequences
- The public page needs a topic list/switcher UI, not just one view — real but bounded added scope.
- Slug generation is per-account, not per-topic (see [ADR 0007](./0007-slug-scheme.md)).
- Streak/heatmap had to be resolved separately as account-level vs per-topic — see
  [ADR 0003](./0003-streak-scope.md).

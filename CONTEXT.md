# Reflect App — Context

Source problem statement: [`Problem.md`](./Problem.md) — "Learn-in-Public Streak Tracker."

This file is the living glossary + decision index for the project, built via a `/grill-with-docs`
session. Each decision below links to a full ADR under [`docs/adr/`](./docs/adr/) with its
reasoning and trade-offs.

## Domain glossary

- **Profile** — an account's public-facing identity. Holds `username` (used to build the public
  slug), linked 1:1 to a Supabase Auth user (which owns email/password/session). Created as part
  of registration.
- **Topic** — a subject being learned (e.g. "System Design"). Owned by a Profile. Has `title`,
  `description`, an aggregated/deduplicated `resources` list, and a collection of `Log`s. A Profile
  can own multiple Topics.
- **Log** — a dated entry under a Topic. Has `title`, `notes`, and a `resources` list. Multiple
  Logs per Topic per day are allowed (no cap). Always stamped with the current moment — no
  backdating.
- **Resource** — `{ url, title }`. Attached to a Log; rolled up to its parent Topic's resource
  list, deduplicated by normalized URL (lowercase scheme+host+path, no trailing slash/query
  string).
- **Streak** — count of consecutive calendar days (in the Profile's stored timezone) with ≥1 Log
  in *any* Topic. Binary per day (has a log / doesn't) — independent of volume.
- **Heatmap** — account-level calendar visualization (GitHub-style), combined across all Topics.
  Cell color intensity reflects Log-count volume that day; distinct from the streak's binary
  day-check.
- **Slug** — the public URL identifier, `/profile/<slug>`, derived from the Profile's `username`.

## Decision index

| # | Decision | ADR |
|---|----------|-----|
| 1 | Auth: Supabase Auth (email+password) for creators; public view unauthenticated via slug | [0001](./docs/adr/0001-auth-model.md) |
| 2 | One public link per account, multiple Topics per account | [0002](./docs/adr/0002-topics-per-account.md) |
| 3 | Streak/heatmap are account-level, combined across Topics | [0003](./docs/adr/0003-streak-scope.md) |
| 4 | Registration doubles as first-Topic creation | [0004](./docs/adr/0004-topic-creation-flow.md) |
| 5 | Unlimited Logs/Topic/day; heatmap color = daily log-count intensity | [0005](./docs/adr/0005-log-frequency-and-intensity.md) |
| 6 | Resource shape `{ url, title }`, dedup by normalized URL | [0006](./docs/adr/0006-resource-shape-and-dedup.md) |
| 7 | Slug = slugified `username` (separate field from Supabase Auth email) | [0007](./docs/adr/0007-slug-scheme.md) |
| 8 | Log detail view is a modal with no dedicated URL (MVP); deep link is a stretch goal | [0008](./docs/adr/0008-log-detail-view.md) |
| 9 | Datastore: Postgres via Supabase, Prisma ORM in Express for all product tables | [0009](./docs/adr/0009-datastore-and-orm.md) |
| 10 | Frontend: Vite + React + TypeScript + React Router (SPA) | [0010](./docs/adr/0010-frontend-stack.md) |
| 11 | Deployment: Vercel (frontend) + Railway (backend) + Supabase (DB + Auth) | [0011](./docs/adr/0011-deployment-targets.md) |
| 12 | Streak day-boundary uses Profile's stored timezone; no backdating | [0012](./docs/adr/0012-streak-day-boundary.md) |

## Learning approach for this build

Solo 2-day build. User knows Node/Express; learning TypeScript and React by building. Documentation
lookups are delegated on-demand via the `/research` skill per phase (no dedicated `/teach` track —
learning is folded into the build to fit the timeline). Guidance during implementation should stay
algorithmic/step-based rather than code-first, except where a concrete snippet is necessary to
explain a specific syntax or API.

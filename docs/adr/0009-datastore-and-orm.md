# ADR 0009: Postgres via Supabase, Prisma ORM in Express for all product tables

## Status
Accepted

## Context
Problem.md requires "a real datastore... SQL or NoSQL." The domain model (`Profile → Topic → Log`,
with `Resource` aggregating up from Logs to their Topic) is clearly relational — foreign keys and
joins by nature. Forcing it into a NoSQL document shape would mean hand-rolling aggregation/dedup
logic that SQL provides natively (`GROUP BY DATE(created_at)` for the heatmap, a join + `DISTINCT`
for topic-level resources).

A further question was whether to use Supabase's own client SDK (`@supabase/supabase-js`, backed
by PostgREST) instead of an ORM. That was rejected: PostgREST's query-builder syntax gets awkward
for the aggregation queries this project needs (streak/heatmap grouping, resource dedup), and using
it from the frontend directly would remove the need for a real backend/API layer, which Problem.md
requires and which the owner wants to build/learn.

## Decision
- **PostgreSQL**, hosted on **Supabase** — used purely as a Postgres connection string, not its
  client SDK/PostgREST layer (Supabase *Auth* is used, per [ADR 0001](./0001-auth-model.md), but
  that's a separate concern from the DB access pattern).
- **Prisma** as the ORM, used from the Express backend for all product tables (`Profile`, `Topic`,
  `Log`, `Resource`). Prisma generates TypeScript types directly from the schema, giving type-checked
  queries for free while learning TypeScript.

## Consequences
- Streak/heatmap and resource-dedup queries are expressed as Prisma queries (or raw SQL via
  `$queryRaw` where needed) rather than PostgREST filters.
- `schema.prisma` doubles as living documentation of the data model.
- Supabase remains swappable for any other Postgres host without touching application code, since
  it's accessed only via a standard connection string.

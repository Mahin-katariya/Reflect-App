# Reflect — Learn-in-Public Streak Tracker

A small full-stack app for logging what you learn, in public. You register, create
Topics, and add dated Log entries (each with notes and resource links). Your public
profile shows a GitHub-style activity heatmap, a combined streak, and a deduplicated
resource list per topic.

**Live app:** https://reflect-lyart.vercel.app &nbsp;·&nbsp; see
[Deployment](#deployment) and [Smoke pass status](#smoke-pass-status) below.

---

## Stack

| Layer      | Choice                                             | Why (ADR) |
|------------|----------------------------------------------------|-----------|
| Frontend   | React 19 + Vite + Tailwind v4, React Router        | [0010](docs/adr/0010-frontend-stack.md) |
| Backend    | Node + Express 5 (TypeScript, ESM)                 | [0014](docs/adr/0014-api-contract-conventions.md) |
| Auth       | Supabase Auth (JWT verified server-side with jose) | [0001](docs/adr/0001-auth-model.md) |
| Data       | PostgreSQL (Supabase) via Prisma 7                 | [0009](docs/adr/0009-datastore-and-orm.md) |
| Hosting    | Vercel (web) + Railway (api) + Supabase (db)       | [0011](docs/adr/0011-deployment-targets.md) |
| Validation | Zod 4                                               | — |

This is a pnpm monorepo:

```
apps/
  api/   Express API, Prisma schema, streak/dedup logic + tests
  web/   React SPA
docs/adr/ Architecture Decision Records
```

## Local setup

Prerequisites: Node 20+, pnpm, and a Postgres database (Supabase project).

```bash
pnpm install
```

### API (`apps/api`)

Create `apps/api/.env`:

```
DATABASE_URL=postgresql://...        # Supabase connection string (session pooler)
SUPABASE_JWT_SECRET=...              # for verifying auth tokens
FRONTEND_URI=http://localhost:5173
PORT=3000
```

Then:

```bash
cd apps/api
pnpm exec prisma migrate deploy   # apply migrations
pnpm exec prisma generate         # generate the client into src/generated/prisma
pnpm dev                          # http://localhost:3000
```

### Web (`apps/web`)

Create `apps/web/.env`:

```
VITE_API_URL=http://localhost:3000
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
```

Then:

```bash
cd apps/web
pnpm dev                          # http://localhost:5173
```

## Tests

```bash
pnpm --dir apps/api test          # dedup, streak, heatmap, response-shaping (vitest)
pnpm --dir apps/web test          # heatmap + resource-list rendering (vitest + Testing Library)
```

Typecheck: `pnpm --dir apps/api exec tsc --noEmit` and `pnpm --dir apps/web exec tsc -b`.

## Key design decisions

Non-trivial choices are recorded as ADRs in [`docs/adr/`](docs/adr/). The ones that
shaped the trickier logic:

- **Streak & heatmap are account-level, combined across topics**
  ([0003](docs/adr/0003-streak-scope.md)). Any log in any topic fills that day's cell,
  exactly like GitHub's contribution graph.
- **Day boundary uses the Profile's stored timezone**
  ([0012](docs/adr/0012-streak-day-boundary.md)). "What day is it" is computed by
  converting the current instant into the timezone captured at registration — never raw
  server UTC, never a client-supplied date (which would be spoofable). No backdating:
  every log is stamped with the current moment.
- **Resource dedup by normalized URL** ([0006](docs/adr/0006-resource-shape-and-dedup.md)).
  A topic's resource list collapses links that share a normalized URL
  (lowercase scheme+host+path, trailing slash and query string stripped); the
  earliest-entered title wins.
- **Log timestamps are immutable** — editing a log never changes `created_at`, so streak
  history can't be rewritten by an edit. See `PATCH /logs/:logId`.
- **API contract**: every response is `{ ok: true, data }` or
  `{ ok: false, error: { code, message } }` ([0014](docs/adr/0014-api-contract-conventions.md)).

The dedup and streak/heatmap logic is isolated as pure functions
(`apps/api/src/lib/resources.ts`, `apps/api/src/lib/activity.ts`) and unit-tested
directly, including timezone-boundary and broken-streak cases.

## API surface

| Method | Route                     | Auth | Purpose |
|--------|---------------------------|------|---------|
| POST   | `/register`               | —    | Create profile (username, timezone) |
| POST   | `/topics`                 | ✅   | Create a topic |
| PATCH  | `/topics/:topicId`        | ✅   | Edit a topic (description) |
| POST   | `/topics/:topicId/logs`   | ✅   | Add a log (with resources) |
| PATCH  | `/logs/:logId`            | ✅   | Edit a log (partial; timestamp immutable) |
| GET    | `/logs/:logId`            | —    | Read one log (public, for the modal) |
| GET    | `/me`                     | ✅   | Owner's profile + topics + logs |
| GET    | `/profile/:slug`          | —    | Public profile: deduped resources + streak + heatmap |

## Deployment

Per [ADR 0011](docs/adr/0011-deployment-targets.md): web on Vercel, api on Railway, db on
Supabase. Set the same env vars as local on each host (Railway uses the Supabase **session
pooler** connection string for `DATABASE_URL`; the direct `db.<ref>.supabase.co` host is
not reachable from Railway).

### Smoke pass status

> **⚠️ Not yet run against the deployed app.** The Railway `DATABASE_URL` still points at
> the old direct Supabase host, which no longer resolves, so the deployed API is down. The
> deployed smoke pass below is blocked until that env var is updated to the session-pooler
> string. Locally, the full flow passes.

End-to-end smoke checklist (run against the deployed URL, not localhost):

1. Register a new account → redirected to the dashboard.
2. Add a topic.
3. Add a log with notes and a resource link.
4. Edit the log inline (title / notes / links) → changes persist after reload.
5. Open the public profile (`/profile/<username>`):
   - the streak count and heatmap render;
   - clicking a log title opens the read-only modal with notes + resources;
   - the topic's deduplicated resource list renders.

> Recording the Loom walkthrough is a manual step, outside this checklist.

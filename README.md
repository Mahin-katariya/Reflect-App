# Reflect — Learn-in-Public Streak Tracker

A small full-stack app for logging what you learn, in public. You register, create
Topics, and add dated Log entries (each with notes and resource links). Your public
profile shows a GitHub-style activity heatmap, a combined streak, and a deduplicated
resource list per topic.

**Live app:** https://reflect-lyart.vercel.app &nbsp;·&nbsp; see
[Deployment](#deployment) below.

---

## Stack

| Layer      | Choice                                             | 
|------------|----------------------------------------------------|
| Frontend   | React 19 + Vite + Tailwind v4, React Router        | 
| Backend    | Node + Express 5 (TypeScript, ESM)                 | 
| Auth       | Supabase Auth (JWT verified server-side with jose) | 
| Data       | PostgreSQL (Supabase) via Prisma 7                 | 
| Hosting    | Vercel (web) + Railway (api) + Supabase (db)       | 
| Validation | Zod 4                                              |

This is a pnpm monorepo:

```
apps/
  api/   Express API, Prisma schema, streak/dedup logic + tests
  web/   React SPA
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

Typecheck: `pnpm --dir apps/api exec tsc --noEmit` and `pnpm --dir apps/web exec tsc -b`.


## Key design decisions

Non-trivial choices - The ones that
shaped the trickier logic:

- **Streak & heatmap are account-level, combined across topics**
  Any log in any topic fills that day's cell,
  exactly like GitHub's contribution graph.
- **Day boundary uses the Profile's stored timezone**
  "What day is it" is computed by
  converting the current instant into the timezone captured at registration — never raw
  server UTC, never a client-supplied date (which would be spoofable). No backdating:
  every log is stamped with the current moment.
- **Resource dedup by normalized URL** 
  A topic's resource list collapses links that share a normalized URL
  (lowercase scheme+host+path, trailing slash and query string stripped); the
  earliest-entered title wins.
- **Log timestamps are immutable** — editing a log never changes `created_at`, so streak
  history can't be rewritten by an edit. See `PATCH /logs/:logId`.
- **API contract**: every response is `{ ok: true, data }` or
  `{ ok: false, error: { code, message } }` 

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

web on Vercel, api on Railway, db on
Supabase. Set the same env vars as local on each host (Railway uses the Supabase **session
pooler** connection string for `DATABASE_URL`; the direct `db.<ref>.supabase.co` host is
not reachable from Railway).

# ADR 0014: API contract conventions — hand-duplicated Zod schemas per app, standardized response envelope, typed error codes (no shared package)

## Status
Accepted

## Context
Registration, Topic, and Log endpoints need validated request shapes and a consistent
response/error shape across the Express API and the Vite/React frontend — two separate deployed
processes (ADR 0010, 0011). A shared `packages/shared` workspace was considered, letting Zod
schemas act as a single source of truth for both runtime validation (backend) and compile-time
types (frontend).

Two things changed the calculus:
- Prisma-generated types — and Prisma-schema-driven Zod generators such as
  `prisma-zod-generator`/`zod-prisma-types` — only exist inside `apps/api`. Prisma Client is a
  backend-only dependency, so nothing generated from `schema.prisma` is reachable from the
  frontend without a shared package anyway. These generators also mirror Prisma's own relational
  input shape (nested `create`/`connect` syntax), not necessarily the flatter wire format the API
  actually wants to expose (e.g. `CreateLogInput`'s `resources: {url, title}[]`) — so hand-written
  schemas would still be needed for at least some endpoints regardless of tooling.
- The actual number of DTOs in this project is small (Register, CreateTopic, CreateLog,
  UpdateLog, plus the response envelope and error-code list). Setting up an npm workspace monorepo
  (root workspace config, path resolution, and getting both Vercel and Railway to correctly build
  a package that depends on a local workspace package) is real, non-trivial setup time against a
  2-day deadline, for a drift risk that's low here: one developer runs the whole stack together
  every few minutes during this build, so a forgotten update to a duplicated schema surfaces
  immediately as a broken request, not a silent long-lived bug.

## Decision
No shared package, no monorepo, no Prisma-to-Zod generator. Instead:
- **Zod schemas are hand-written independently in each app.** `apps/api` uses them for request
  validation (`schema.parse(req.body)`); `apps/web` keeps its own copy for client-side form
  validation and to type its API call functions. Duplication is accepted as the cheaper trade-off
  given the small schema count and low drift risk.
- Related schemas are still derived from each other **within** an app using Zod's own
  `.partial()`/`.omit()`/`.pick()` (e.g. `UpdateLogInput = CreateLogInput.partial()`) — no
  hand-duplicated field lists, even without a shared package.
- A standard **response envelope** — `{ ok: true, data: T }` on success,
  `{ ok: false, error: { code: ErrorCode, message: string } }` on failure — and a single
  `ErrorCode` `as const` object with its union type derived via `keyof typeof`, are each defined
  once per app (the backend defines and emits them; the frontend keeps a matching copy to type
  what it expects back).

## Consequences
- No workspace/build-tooling setup cost before ticket 01 can start.
- A schema change on one side isn't caught by the compiler until both sides are run together —
  acceptable here since that happens continuously during solo development.
- If this project's scope grows well beyond the 2-day build (multiple contributors, longer-lived
  iteration), a shared package becomes worth revisiting — this is recorded as a deliberate
  near-term trade-off, not a permanent architectural stance.

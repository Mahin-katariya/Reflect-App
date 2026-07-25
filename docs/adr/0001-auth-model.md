# ADR 0001: Auth model — Supabase Auth for creators, no auth for viewers

## Status
Accepted

## Context
Problem.md requires "no login/email required to view" a public log, but the owner must be able
to log daily entries against their goal — something has to distinguish the owner (write access)
from any visitor (read-only), without accounts for viewers.

Two shapes were considered:
1. A bearer-secret model (public slug + private "manage" URL containing an owner token,
   possession of the URL = write access, no accounts at all).
2. Real registration/login for the creator side only, with the public view remaining fully
   unauthenticated.

Option 1 was explored first (including a localStorage-token variant, then a URL-embedded-token
variant), but rejected: it has no recovery path if the secret is lost, and doesn't match Problem.md's
actual wording, which only exempts *viewing* from auth, not the whole app.

Once (2) was chosen, a further question arose: hand-roll password hashing/session/JWT logic in
Express, or use an existing auth provider? Hand-rolling auth is exactly the kind of code that's
easy to get subtly wrong (hashing cost factors, session fixation, JWT expiry/refresh) and doesn't
showcase anything specific to this project, under a 2-day deadline.

## Decision
Use **Supabase Auth** (email + password) for the creator/owner identity and session. The frontend
authenticates directly against Supabase Auth; Supabase issues a JWT. The Express API verifies that
JWT via middleware on protected routes (create Topic, add Log) — this is the only auth code
written by hand, and it's verification, not credential handling.

Public log viewing (`/profile/<slug>`) requires no auth at all, per the spec.

Supabase Auth's identity is **email-based**, not username-based, so a separate `Profile` table
(via Prisma) stores a `username` field per account, linked to the Supabase Auth user's ID — see
[ADR 0007](./0007-slug-scheme.md) for why this is needed for the public slug.

## Consequences
- Password hashing, session/JWT issuance, and their edge cases are outsourced to Supabase — no
  code to write, review, or get wrong.
- All actual product logic (Topics, Logs, Resources, streak/heatmap computation, resource dedup)
  still lives entirely in the hand-written Express + Prisma API — the "backend/API layer"
  requirement isn't hollowed out, only credential/session mechanics are.
- Requires a small `Profile` table separate from Supabase's own `auth.users`, to hold `username`.
- Ties the project to Supabase for both DB hosting and Auth — acceptable since Supabase was
  already the chosen Postgres host (see [ADR 0009](./0009-datastore-and-orm.md)).

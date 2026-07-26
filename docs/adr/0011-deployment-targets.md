# ADR 0011: Vercel (frontend) + Railway (backend) + Supabase (DB + Auth)

## Status
Accepted

## Context
Problem.md requires the app be "deployed live... with a working URL," naming Vercel/Railway as
example options. The architecture splits into a static Vite frontend and a persistent Express API
process, which have different hosting needs.

## Decision
- **Frontend (Vite/React)** → **Vercel**. Connecting a GitHub repo for a static Vite build is
  close to zero-config.
- **Backend (Express/Prisma)** → **Railway**. Needs a long-running Node process (not a serverless
  function), and Railway handles that plus environment variables (`DATABASE_URL`, Supabase keys)
  with minimal setup. Render is an equally valid substitute.
- **Database + Auth** → **Supabase** (already decided — [ADR 0009](./0009-datastore-and-orm.md),
  [ADR 0001](./0001-auth-model.md)).

## Consequences
- Three separate free-tier services, each individually simple to wire up, versus a single combined
  host that would need more configuration to satisfy both the static frontend and long-running
  backend correctly.
- CORS must be configured on the Express API to accept requests from the Vercel-hosted frontend
  origin.

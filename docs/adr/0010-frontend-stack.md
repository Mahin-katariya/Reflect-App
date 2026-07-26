# ADR 0010: Vite + React + TypeScript + React Router (SPA)

## Status
Accepted

## Context
The project already has a separate Express API layer ([ADR 0009](./0009-datastore-and-orm.md)),
required by Problem.md and central to the owner's learning goals. Next.js's core value proposition
is merging frontend and backend into one framework (server components, API routes, SSR) — adopting
it here would mean learning a second server-side model that isn't needed, since Express already
serves that role.

Create React App was considered and rejected as unmaintained / no longer the React team's
recommended starting point.

## Decision
**Vite + React + TypeScript** as a plain client-side SPA, with **React Router** for the small set
of client-side routes needed (register/first-topic, dashboard, public `/profile/<slug>` view). The
SPA talks to the Express API over HTTP for all data.

## Consequences
- No SSR/hydration concepts to learn alongside React and TypeScript — a flatter learning curve
  under the 2-day window.
- Deployment is a static build (see [ADR 0011](./0011-deployment-targets.md)), which is simpler to
  host than a Next.js app requiring a Node runtime for SSR.

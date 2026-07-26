# 01 — Registration creates a Profile, then a first Topic via /topics, live at a public slug

**What to build:** A user registers (email, password, username) creating only their account; the
frontend then routes them straight into creating their first Topic (title + description) via the
same `POST /topics` endpoint that every later Topic also uses (ADR 0013 — one Topic-creation code
path, not one bundled into registration). The resulting public profile page at `/profile/<slug>`
renders that Topic with no login prompt. This ticket also stands up the full deployment pipeline
(Vercel + Railway + Supabase) so every later ticket deploys by just pushing, and establishes the
API contract conventions (ADR 0014) — Zod-validated request schemas, the response envelope, and
the typed error-code union — that every later endpoint follows.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] A user can register with email, password, and username; this creates a Supabase Auth user
      and a Profile (`username`, `timezone` captured from the browser) only — no Topic is created
      by this call.
- [ ] Duplicate usernames are rejected with a clear error before any records are created.
- [ ] `POST /topics` (auth required) creates a Topic (title, description) for the authenticated
      Profile — this is the only Topic-creation endpoint, used here for the first Topic.
- [ ] Immediately after registering, the frontend routes the user straight into the
      Topic-creation form (not an empty dashboard) so the onboarding feels like one continuous
      flow even though it's two API calls.
- [ ] `GET /profile/:slug` (public, no auth) returns the Profile's Topic(s) with title/description
      and empty logs/resources.
- [ ] The public profile page at `/profile/<slug>` renders the Topic from the API with no login
      prompt.
- [ ] The frontend is deployed on Vercel, the Express API on Railway, and Postgres/Auth on
      Supabase; the deployed URL is reachable and functional end-to-end (not just locally).
- [ ] CORS allows the deployed frontend origin to call the deployed API.
- [ ] `RegisterInput` and `CreateTopicInput` are hand-written Zod schemas (one per app, per
      ADR 0014) used for request validation on the backend and form/API-client typing on the
      frontend; no shared package is introduced.
- [ ] Every endpoint response uses the standard envelope (`{ ok: true, data }` /
      `{ ok: false, error: { code, message } }`), and error codes are drawn from a single
      `as const` `ErrorCode` object per app (e.g. `USERNAME_TAKEN`, `VALIDATION_ERROR`) rather than
      ad hoc string literals.
- [ ] Backend HTTP tests cover the register endpoint (including a validation-error case asserting
      the envelope/error-code shape), the `POST /topics` endpoint (including auth-gating), and the
      public GET endpoint, against a real test Postgres schema.

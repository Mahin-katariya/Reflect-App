---
title: Learn-in-Public Streak Tracker — Spec
labels: [ready-for-agent]
status: open
tracker: local
---

# Learn-in-Public Streak Tracker — Spec

Source: [`Problem.md`](../../Problem.md). Decisions below are already recorded in
[`CONTEXT.md`](../../CONTEXT.md) and [`docs/adr/`](../../docs/adr/) — this spec synthesizes them
into a buildable plan, it does not re-derive them.

## Problem Statement

Someone learning a new skill wants a simple, public way to commit to daily progress and let others
see that progress — without forcing viewers to sign up, and without the creator needing to
maintain the page by hand. The creator needs a place to declare what they're learning (possibly
more than one thing), log entries as they go, and see, at a glance, how consistent they've been.

## Solution

A creator registers (Supabase Auth, email + password + username). Registration creates only the
account — immediately afterward, the frontend routes the creator straight into creating their
first **Topic** (what they're learning) via the same Topic-creation endpoint used for every
subsequent Topic, so there's exactly one Topic-creation code path (ADR 0013) even though the
onboarding experience still feels like one continuous flow. This gives them exactly one public
link, `/profile/<slug>` (slug derived from the `username` set at registration), showing:

- every Topic they've created,
- an account-level, GitHub-style combined **streak** and **heatmap** across all Topics,
- per Topic, its accumulated and deduplicated **Resources**, and a list of **Log** titles.

Clicking a Log title opens a centered modal with that Log's notes and resources. Owners can add
further Topics later from a dashboard, and can log unlimited entries per Topic per day — the streak
only cares whether a day had ≥1 log (across any Topic); the heatmap's color intensity reflects how
many. No login is required to view any public profile. No backdating is possible — every Log is
stamped with the current moment in the creator's stored timezone.

## User Stories

1. As a visitor with no account, I want to view a public profile at `/profile/<slug>` with no
   login prompt, so that I can see someone's learning progress without friction.
2. As a new creator, I want to register with an email, password, and username in one flow, so that
   I don't need a separate step just to get an account.
3. As a new creator, I want to be taken straight into creating my first Topic right after
   registering, so that I land in the product's core action instead of an empty dashboard — even
   though under the hood this is a separate API call from registration itself.
4. As a creator, I want my public slug generated automatically from my username, so that I don't
   have to think up and validate a separate custom URL.
5. As a creator, I want to be told at signup that my username becomes my public URL, so that I can
   choose it deliberately.
6. As a creator, I want to add additional Topics after registration, so that I can track more than
   one thing I'm learning (e.g. "System Design" and "Rust") under the same profile.
7. As a creator, I want to log a daily entry (title, notes, resources) against a specific Topic, so
   that I can record what I did that day.
8. As a creator, I want to be able to log more than once per Topic in a single day, so that I can
   add follow-up notes without waiting for tomorrow.
9. As a creator, I want to edit an existing Log's title, notes, or resources after creating it, so
    that I can fix a mistake or add detail — without changing when the streak/heatmap records it
    as having happened.
10. As a creator, I want each Log I attach a resource link to, to roll up into that Topic's overall
    resource list, so that visitors see one consolidated reading list per Topic.
11. As a visitor, I want duplicate resource links (same URL, different casing/trailing
    slash/query string) to appear only once in a Topic's resource list, so that the list stays
    clean.
12. As a visitor, I want to see only a Topic's title and its Log titles on the public profile
    page, not full content, so that I can scan progress quickly.
13. As a visitor, I want to click a Log title and see its full notes and resources in a centered
    modal, so that I can read the detail without leaving the page.
14. As a creator, I want my account-level streak to count a day as active if I logged
    *anything*, in *any* Topic, that day, so that my overall consistency is represented fairly
    across everything I'm tracking.
15. As a visitor, I want the heatmap's cell color to reflect how much was logged that day (like
    GitHub's contribution graph), so that I can distinguish a light day from a heavy one.
16. As a creator, I want "today" to be computed using my own timezone rather than server UTC, so
    that a late-evening log isn't misattributed to the wrong day and doesn't wrongly break my
    streak.
17. As a creator, I want it to be impossible to backdate a Log — including via edits — so that my
    streak/heatmap data stays honest and can't be retroactively gamed.
18. As a creator, I want only I (authenticated) to be able to create or edit Topics and Logs on my
    profile, while anyone can view it, so that my data can't be tampered with by others.
19. As a creator, I want to log in from any device (not just the one I registered on) and still be
    able to add entries, so that I'm not locked to a single browser/machine.
20. As an evaluator of this project, I want a README explaining the non-trivial decisions made, so
    that I can understand the reasoning behind the build.
21. As an evaluator, I want a working, publicly deployed URL, so that I can use the app without
    running it locally.

## Implementation Decisions

**Modules**
- **Auth**: Supabase Auth handles email/password + session/JWT issuance. Express exposes a
  middleware that verifies the incoming Supabase JWT on protected routes; no credential or session
  logic is hand-written (ADR 0001).
- **Profile**: holds `username` (unique, slug source) and a `timezone` (captured at registration
  via `Intl.DateTimeFormat().resolvedOptions().timeZone`), linked 1:1 to a Supabase Auth user ID.
- **Topic**: owned by a Profile; `title`, `description`; has many Logs; exposes a derived,
  deduplicated `resources` view aggregated from its Logs.
- **Log**: belongs to a Topic; `title`, `notes`, a list of Resources (`{ url, title }`); `createdAt`
  always server-assigned to "now" — never client-supplied, never editable to a past date.
- **Streak/Heatmap**: a read-side computation over all of a Profile's Logs (via their Topics),
  grouped by calendar day in the Profile's stored timezone. Streak = count of consecutive days with
  ≥1 Log. Heatmap = per-day Log count, bucketed into intensity levels.

**Schema shape** (relational, via Prisma on Postgres — ADR 0009): `Profile 1—N Topic 1—N Log`,
with `Resource` modeled as rows belonging to a `Log` (not a standalone deduplicated table) —
dedup happens at read-time when building a Topic's aggregated resource view, keyed on normalized
URL (lowercase scheme+host+path, no trailing slash/query string — ADR 0006).

**API contract conventions** (ADR 0014): every endpoint validates its request body with a
hand-written Zod schema (`RegisterInput`, `CreateTopicInput`, `CreateLogInput`,
`UpdateLogInput = CreateLogInput.partial()`, …) and responds with a standard envelope —
`{ ok: true, data: T }` on success, `{ ok: false, error: { code: ErrorCode, message: string } }` on
failure. `ErrorCode` is a single `as const` object per app (e.g. `USERNAME_TAKEN`, `UNAUTHORIZED`,
`FORBIDDEN`, `TOPIC_NOT_FOUND`, `LOG_NOT_FOUND`, `VALIDATION_ERROR`) with its union type derived
via `keyof typeof`. These schemas and the envelope/error-code definitions are hand-duplicated
between `apps/api` and `apps/web` (no shared package — ADR 0014), and should be established as
part of ticket 01 so every later endpoint follows the same pattern from the start.

**API contract** (all under the Express API, JSON in/out):
- `POST /register` — email, password, username, timezone → creates a Supabase Auth user + Profile
  only. Never accepts or creates Topic data (ADR 0013).
- `POST /topics` (auth required) — title, description → creates a Topic for the authenticated
  Profile. This is the **only** Topic-creation path — used for the first Topic (immediately after
  registration, via a frontend redirect) and every Topic after it.
- `POST /topics/:topicId/logs` (auth required) — title, notes, resources[] → creates a Log; no
  date field accepted from the client.
- `PATCH /logs/:logId` (auth required, owning Profile only) — title, notes, resources[] → updates
  an existing Log. The Log's original timestamp is immutable — this endpoint never accepts or
  modifies a date field.
- `GET /profile/:slug` (public) — returns the Profile's Topics (each with title, description,
  deduplicated resources, and Log titles+ids+timestamps) plus the account-level streak count and
  heatmap data (day → count).
- `GET /logs/:logId` (public) — returns a single Log's full detail (title, notes, resources) for
  the modal view.

**Heatmap intensity buckets**: a default 5-level scale (0 logs = none, 1–2 = light, 3–5 = medium,
6–9 = dark, 10+ = darkest) is a reasonable starting point, not previously fixed in the ADRs —
tune-able later without any schema or architecture change.

**Frontend routes** (Vite + React + TypeScript + React Router — ADR 0010): `/register`, `/login`,
`/dashboard` (add-Topic action, per-Topic log-entry form), `/profile/:slug` (public view). The Log
detail view is a client-side modal with no dedicated route/URL for this build (ADR 0008); no
deep-linking to an individual Log.

**Deployment** (ADR 0011): Vercel (frontend build) + Railway (Express API) + Supabase (Postgres +
Auth). Express must accept CORS from the deployed Vercel origin.

## Testing Decisions

Tests exercise **external behavior only**, through the two seams agreed for this project:

- **Backend seam**: real HTTP requests against the Express app, backed by a real test Postgres
  schema (no in-memory/mock datastore, per the assignment's own requirement) — covers
  registration+first-topic creation, auth-gating on protected routes, unlimited same-day Log
  creation, editing a Log's title/notes/resources while its original timestamp stays unchanged
  (including rejecting any attempt to modify it via the edit endpoint), rejection of any
  client-supplied backdate on create, the streak/heatmap aggregate response (including timezone
  handling and intensity bucketing), and the resource-dedup view (same URL, different
  casing/trailing slash/query string, collapses to one entry).
- **Frontend seam**: rendered UI driven by simulated user interaction (React Testing Library +
  `user-event`), with the network mocked at the HTTP boundary (MSW) rather than mocking individual
  functions/hooks — covers the registration form, the dashboard's add-Topic flow, the log-entry
  form (including submitting more than once in a day), the public profile page rendering
  Topics/resources/Log titles from a mocked API response, clicking a Log title to open the modal
  with the right content, and the heatmap rendering correct color buckets from mocked day-count
  data.

No prior art exists yet in this repo (greenfield) — the first tests written for the first ticket
under `/implement` establish the pattern (supertest-style HTTP assertions for the backend, RTL+MSW
for the frontend) that every subsequent ticket's tests should follow.

## Out of Scope

- Deep-linkable Log modal (ADR 0008's Option B) — documented as a deliberate post-submission
  refactor, not part of this build.
- Editing Topics, or deleting Topics/Logs/Resources — Logs are the one exception (editable, per
  the Implementation Decisions' `PATCH /logs/:logId`); Topics and Resources-as-standalone entities
  remain create-only, and nothing in this build supports deletion of any kind.
- Per-Topic streak/heatmap views (ADR 0003) — account-level only.
- Resource `type` classification (ADR 0006).
- Password reset, email verification, or social login flows beyond Supabase Auth's defaults.
- Custom/manual slug editing after registration.
- Notifications, reminders, or email digests.
- Native mobile app or PWA-specific behavior beyond a responsive web layout.

## Further Notes

- Solo, 2-day build. The developer knows Node/Express already and is learning TypeScript and React
  by building this project — guidance during `/implement` should stay phased and algorithmic in
  style, with code snippets only where necessary to explain a specific syntax or API, per the
  developer's stated preference. Unfamiliar-concept lookups are delegated on demand via `/research`
  rather than a dedicated `/teach` track, to fit the timeline.
- If Supabase Auth's default email-confirmation requirement gets in the way of fast local testing,
  it can be disabled in the Supabase project's Auth settings — a config toggle, not an
  architectural change.

# ADR 0013: Registration and Topic creation are separate API calls, even for the first Topic

## Status
Accepted — supersedes [ADR 0004](./0004-topic-creation-flow.md)

## Context
ADR 0004 decided registration would bundle first-Topic creation into one combined flow, on the
reasoning that the user's own described entry point is a single moment ("lands on the app and
enters what they're learning"). On review, this conflated a **UX sequencing** decision (what
screen the user sees right after signing up) with an **API contract** decision (what one endpoint
is responsible for). Folding Topic creation into `POST /register` meant that endpoint had two
responsibilities and two failure modes bundled together, and meant the "create a Topic" logic
existed in two places (once inline in registration, once for topic #2+) unless carefully shared.

## Decision
`POST /register` creates only the account (Supabase Auth user + `Profile` — email, password,
username, timezone). It never accepts or creates Topic data.

**Every** Topic — including the first — is created via `POST /topics` (auth required), the same
endpoint used for topic #2 and beyond. There is exactly one Topic-creation code path.

The onboarding **UX intent** from ADR 0004 is preserved at the frontend level, not the API level:
immediately after a successful registration, the frontend routes the user straight into the
"create a Topic" form (which calls `POST /topics`) rather than to an empty dashboard. From the
user's perspective the experience is unchanged; underneath, it's two sequential API calls
orchestrated by the frontend instead of one combined endpoint.

## Consequences
- One Topic-creation code path (schema validation, authorization, persistence) instead of two —
  removes the risk of the inline-registration path and the dashboard path drifting apart.
- `POST /register`'s only failure modes are account-creation failures (duplicate username, weak
  password, etc.) — Topic-validation errors can no longer surface confusingly from the
  registration step.
- Ticket sequencing shifts slightly: the tracer-bullet ticket that first proves out
  registration + a rendered public profile now also stands up `POST /topics` (since it needs a
  Topic to render), rather than deferring `POST /topics` to the "add more topics" ticket. The
  "add more topics" ticket becomes purely dashboard/login UI reusing an endpoint that already
  exists.

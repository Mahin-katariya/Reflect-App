# ADR 0004: Registration doubles as first-Topic creation

## Status
Superseded by [ADR 0013](./0013-registration-topic-endpoint-split.md) — registration was later
split from Topic creation at the API level, though the onboarding UX intent described below (land
straight into creating a Topic, not an empty dashboard) is preserved by the frontend flow.

## Status (original)
Accepted

## Context
With multiple Topics per account now possible ([ADR 0002](./0002-topics-per-account.md)), it
needed deciding when Topics get created: as part of registration, or always via a separate
"add topic" action (even the first one).

Problem.md's described entry point is literal: "a user lands on the app and enters what they're
learning" — i.e., registration and declaring your first topic are the same moment from the user's
perspective. Splitting them into two separate steps would add a screen not required by the spec,
and would diverge from the common SaaS pattern of onboarding straight into the product's core
action rather than to an empty dashboard.

## Decision
**Registration is combined with first-Topic creation** — signing up means entering account
credentials and your first topic (title/description) in one flow. Any *additional* topics are
created later via a separate "add topic" action from a dashboard, reusing the same form.

## Consequences
- One fewer screen to build for the critical first-run path.
- The "add topic" form built for topic #2+ can be the same component used inline in the
  registration flow for topic #1 — no duplicated UI logic.

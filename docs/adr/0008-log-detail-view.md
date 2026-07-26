# ADR 0008: Log detail view is a modal with no dedicated URL (MVP)

## Status
Accepted — with a documented follow-up

## Context
The public page shows a Topic title plus a list of Log titles only; clicking a Log title should
open its full detail (title, notes, resources) in a large centered modal, Notion-style.

Two implementations were considered:
- **(A) Modal-only**: a piece of client-side React state controls which Log is "open"; the URL
  never changes.
- **(B) Modal with its own URL** (e.g. `/profile/<slug>/log/<id>`), true Notion pattern —
  background-location + overlay route, so the URL updates, back-button closes it, refresh keeps it
  open, and the specific Log becomes directly shareable.

(B) is more polished and lets individual Logs be linked directly, but requires an intermediate
React Router pattern (background/overlay routes) — a real concept to learn on top of everything
else, in a 2-day window, for a piece of UI that Problem.md doesn't actually require (only the whole
public log needs to be shareable, not individual entries).

## Decision
Ship **(A) modal-only** for the MVP submission. **(B)** is documented here as a deliberate
post-submission refactor target, not attempted now.

## Consequences
- Refreshing the page while a Log's modal is open loses that state (falls back to the topic view)
  — accepted as low-stakes for this build.
- Individual Logs aren't directly linkable in the submitted version.
- Revisiting this later means introducing a background-location routing pattern without needing to
  touch the modal's actual content rendering — the refactor is additive, not a rewrite.

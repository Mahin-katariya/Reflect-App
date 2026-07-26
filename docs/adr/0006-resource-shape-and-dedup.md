# ADR 0006: Resource shape `{ url, title }`, dedup by normalized URL

## Status
Accepted

## Context
Logs can carry Resources, which roll up to their parent Topic's resource list and must be
deduplicated when displayed there. Two things needed pinning down: the shape of a Resource, and
the equality rule used for dedup.

A `type` field (article/video/other) was considered but dropped to save time — it adds a form
field and classification logic with no requirement calling for it.

## Decision
- **Shape**: `{ url, title }`. `url` is required; `title` is either user-entered when adding the
  resource to a Log, or falls back to the raw URL if not provided.
- **Dedup key**: the **normalized URL** — lowercase scheme+host+path, trailing slash and query
  string stripped. Two Logs citing the same URL (even with different titles, or minor URL
  formatting differences) collapse to one Resource at the Topic level; whichever title was
  entered first wins for display.

## Consequences
- Dedup logic is a pure string-normalization function, easy to unit test in isolation.
- Titles aren't independently deduplicated — two different URLs with the same title both appear
  (correct: they're different resources).
- No resource "type" field in this build; a plain link list only.

# 04 — Deduplicated Topic-level resource list

**What to build:** Each Topic's public page shows a deduplicated list of all resources cited
across its Logs, collapsed by normalized URL — not just visible one Log at a time inside a modal.

**Blocked by:** 03

**Status:** ready-for-agent

- [ ] Each Topic's resource list is derived by aggregating resources across all of its Logs.
- [ ] Two resources with the same normalized URL (case-insensitive scheme+host+path, ignoring
      trailing slash and query string) collapse into a single entry in the Topic's resource list.
- [ ] The public profile page displays this deduplicated list per Topic (separate from what's
      shown inside an individual Log's modal).
- [ ] Backend HTTP tests cover the dedup logic directly (same URL varying by case/trailing
      slash/query string → one entry; genuinely different URLs → separate entries). Frontend
      tests cover the resource list rendering.

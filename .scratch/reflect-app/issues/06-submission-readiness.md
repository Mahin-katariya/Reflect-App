# 06 — Submission readiness

**What to build:** README documenting setup and decisions, plus a final end-to-end smoke pass
against the deployed app, so the project is ready to submit.

**Blocked by:** 02, 04, 05

**Status:** ready-for-agent

- [ ] README documents the project's setup, the ADR-backed non-trivial decisions (referencing
      `docs/adr/`), and includes the live deployed URL.
- [ ] A full end-to-end smoke pass is run against the deployed app (not localhost): register, add
      a topic, log an entry, edit a log, view the public profile, confirm streak/heatmap and
      resource dedup render correctly.
- [ ] Note: recording the Loom walkthrough is a manual step for the developer, outside what this
      ticket automates.

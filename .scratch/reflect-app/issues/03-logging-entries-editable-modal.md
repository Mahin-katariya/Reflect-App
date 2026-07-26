# 03 — Logging entries: Logs against a Topic, shown publicly, editable, opened via modal

**What to build:** An authenticated owner adds Logs (title, notes, resources) to a Topic —
unlimited per day, server-stamped "now" in the Profile's timezone, no backdating — and can edit an
existing Log's title/notes/resources without ever changing its original timestamp. The public page
lists Log titles per Topic; clicking one opens a centered modal with the full content.

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] `POST /topics/:topicId/logs` (auth required, owning Profile only) creates a Log with
      title/notes/resources; `createdAt` is always server-assigned to "now," never accepted from
      the client.
- [ ] Multiple Logs can be created for the same Topic on the same calendar day, with no cap.
- [ ] `PATCH /logs/:logId` (auth required, owning Profile only) updates title/notes/resources on an
      existing Log; the Log's original timestamp is unchanged and cannot be modified by this or
      any other request.
- [ ] The public profile page lists Log titles under each Topic.
- [ ] Clicking a Log title opens a centered modal showing that Log's full notes and resources,
      fetched via `GET /logs/:logId` (public).
- [ ] Backend HTTP tests cover Log creation (including same-day multiplicity and backdate
      rejection) and the edit endpoint (including asserting the timestamp is unchanged after
      edit). Frontend tests cover the log-entry form, the edit flow, and opening/closing the modal.

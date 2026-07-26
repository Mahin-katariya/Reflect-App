# 02 — Login + dashboard: add additional Topics

**What to build:** A returning creator logs in and adds another Topic from a dashboard. Since
`POST /topics` and its auth-gating already exist from ticket 01, this ticket is purely the login
flow and dashboard UI — listing existing Topics and reusing the existing Topic-creation form/logic
for topic #2 and beyond. The public profile page reflects all of a Profile's Topics, not just the
first.

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] A registered user can log in via Supabase Auth and reach an authenticated dashboard.
- [ ] The dashboard lists the logged-in Profile's existing Topics.
- [ ] The dashboard's "add topic" form calls the same `POST /topics` endpoint and reuses the same
      component built in ticket 01, rather than a second implementation.
- [ ] The public profile page shows all Topics for that Profile, not just the first.
- [ ] Backend HTTP tests cover multi-topic listing for a Profile (auth-gating on `POST /topics`
      is already covered by ticket 01); frontend tests cover the login flow and the add-Topic
      form.

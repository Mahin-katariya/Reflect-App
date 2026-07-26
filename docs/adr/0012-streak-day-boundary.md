# ADR 0012: Streak day-boundary uses Profile's stored timezone; no backdating

## Status
Accepted

## Context
Problem.md flags edge cases as something the assignment cares about, and streak logic is where they
bite hardest. Two related issues needed resolving:

- **Timezone**: computing "today" from raw server UTC could misattribute a late-evening log to the
  wrong calendar day from the user's own perspective, silently breaking their streak. Trusting a
  raw client-supplied date instead is gameable — a user could submit any date to fabricate a streak.
- **Backdating**: whether a user should be able to create a Log dated in the past, to fill in a day
  they forgot.

## Decision
- Capture the Profile's **timezone** once, at registration (via the browser's
  `Intl.DateTimeFormat().resolvedOptions().timeZone`), and store it on the `Profile` row.
- The **server** computes "what day is it" for streak/heatmap purposes using the current instant
  converted into *that stored timezone* — never raw client-supplied dates, never raw server UTC.
- **No backdating.** Every Log is stamped with the current moment only. There is no UI or API path
  to create a Log for a past day.

## Consequences
- Respects the user's real local day boundary without letting them spoof the date field.
- Matches how GitHub's own contribution graph behaves — missed days are simply missed, not
  retroactively fillable — which keeps streak data honest and removes an entire feature (a
  date-picker plus past-day validation) from the build.
- If a user changes timezones (e.g. travels) mid-use, day boundaries shift accordingly from that
  point on; no historical Log data is retroactively recalculated.

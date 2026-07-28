// Account-level streak + heatmap — ADR 0003 (combined across topics) and
// ADR 0012 (day boundary uses the Profile's stored timezone, never raw UTC or
// a client-supplied date).

export type HeatmapCell = { date: string; count: number; level: number };
export type Activity = { today: string; streak: number; heatmap: HeatmapCell[] };

/** 5-level intensity scale from ticket 05: 0 / 1–2 / 3–5 / 6–9 / 10+. */
export function bucketLevel(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count <= 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 9) return 3;
  return 4;
}

/** The calendar date (YYYY-MM-DD) of `instant` as seen in `timeZone`. */
export function localDateInTz(instant: Date, timeZone: string): string {
  // en-CA formats as YYYY-MM-DD; the timeZone option does the UTC→local shift.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(instant);
}

/** Add `delta` calendar days to a YYYY-MM-DD string (pure UTC date math). */
export function shiftDay(dateStr: string, delta: number): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

/** Weekday of a YYYY-MM-DD string, 0 = Sunday … 6 = Saturday. */
export function weekday(dateStr: string): number {
  return new Date(`${dateStr}T00:00:00Z`).getUTCDay();
}

/**
 * Consecutive days (ending today, or yesterday if today has no logs yet) that
 * each have ≥1 log. Today with no logs does NOT break a streak until the day
 * ends — mirrors GitHub. Returns 0 if neither today nor yesterday has a log.
 */
export function computeStreak(counts: Map<string, number>, today: string): number {
  let cursor: string;
  if ((counts.get(today) ?? 0) > 0) {
    cursor = today;
  } else {
    const yesterday = shiftDay(today, -1);
    if ((counts.get(yesterday) ?? 0) > 0) cursor = yesterday;
    else return 0;
  }

  let streak = 0;
  while ((counts.get(cursor) ?? 0) > 0) {
    streak++;
    cursor = shiftDay(cursor, -1);
  }
  return streak;
}

/**
 * Build the combined activity view from every log instant on the account.
 * `weeks` columns of the heatmap, aligned so the first cell is a Sunday and the
 * last cell is today (in the profile's timezone).
 */
export function computeActivity(
  logInstants: Date[],
  timeZone: string,
  now: Date,
  weeks = 53,
): Activity {
  const counts = new Map<string, number>();
  for (const inst of logInstants) {
    const day = localDateInTz(inst, timeZone);
    counts.set(day, (counts.get(day) ?? 0) + 1);
  }

  const today = localDateInTz(now, timeZone);
  const streak = computeStreak(counts, today);

  // A clean rectangular grid of `weeks` full columns (Sun→Sat), ending on the
  // current week's Saturday. Days after today simply have count 0 (rendered
  // empty), matching how GitHub shows the current partial week.
  const end = shiftDay(today, 6 - weekday(today)); // Saturday of this week
  const start = shiftDay(end, -(weeks * 7 - 1)); // Sunday, `weeks` back
  const heatmap: HeatmapCell[] = [];
  for (let cursor = start; cursor <= end; cursor = shiftDay(cursor, 1)) {
    const count = counts.get(cursor) ?? 0;
    heatmap.push({ date: cursor, count, level: bucketLevel(count) });
  }

  return { today, streak, heatmap };
}

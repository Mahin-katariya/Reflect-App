import { useState } from "react";

export type HeatCell = { date: string; count: number; level: number };

// Level → emerald token utility (see index.css @theme / DESIGN.md §1). 0 = faint.
const HEAT_CLASS = ["bg-heat-0", "bg-heat-1", "bg-heat-2", "bg-heat-3", "bg-heat-4"];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function part(dateStr: string) {
  const [, m, d] = dateStr.split("-").map(Number);
  return { m, d };
}

// A week's date span, e.g. "Jan 1 – 7" (same month) or "Jan 29 – Feb 4".
function weekRange(week: { date: string }[]): string {
  const a = part(week[0].date);
  const b = part(week[week.length - 1].date);
  const end = a.m === b.m ? `${b.d}` : `${MONTHS[b.m - 1]} ${b.d}`;
  return `${MONTHS[a.m - 1]} ${a.d} – ${end}`;
}

// Weekly intensity: totals run higher than a single day, so widen the buckets.
function weekLevel(total: number): number {
  if (total <= 0) return 0;
  if (total <= 3) return 1;
  if (total <= 7) return 2;
  if (total <= 14) return 3;
  return 4;
}

type Day = { date: string; count: number };
type Hover = { wi: number; left: number; top: number; text: string };

/**
 * Activity heatmap for the public page. `cells` is the API's flat daily array
 * ({date,count,level}), which only spans back ~53 weeks. We build the FULL
 * calendar year of `today` (Jan 1 → Dec 31) on the client, folding the API's
 * counts in by date and leaving days with no data (past-empty or future) at 0,
 * then collapse each 7-day span into ONE block colored by the week's total.
 * Hovering a block shows that week's date range and total logs.
 */
export default function Heatmap({ cells, today }: { cells: HeatCell[]; today: string }) {
  const year = Number(today.slice(0, 4));
  const counts = new Map(cells.map((c) => [c.date, c.count]));

  const days: Day[] = [];
  const cursor = new Date(Date.UTC(year, 0, 1));
  while (cursor.getUTCFullYear() === year) {
    const date = cursor.toISOString().slice(0, 10);
    days.push({ date, count: counts.get(date) ?? 0 });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  const weeks: Day[][] = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));

  const [hover, setHover] = useState<Hover | null>(null);

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-[3px]" role="img" aria-label="Activity heatmap">
        {weeks.map((week, wi) => {
          const total = week.reduce((s, c) => s + c.count, 0);
          const level = weekLevel(total);
          const text = `${weekRange(week)} · ${total} log${total === 1 ? "" : "s"}`;
          return (
            <div
              key={wi}
              data-testid="heat-cell"
              data-level={level}
              onMouseEnter={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                setHover({ wi, left: r.left + r.width / 2, top: r.top - 8, text });
              }}
              onMouseLeave={() => setHover(null)}
              className={`h-[13px] w-[13px] rounded-[3px] transition-shadow ${HEAT_CLASS[level]} ${
                hover?.wi === wi ? "shadow-[0_0_0_1.5px_var(--color-ink)]" : ""
              }`}
            />
          );
        })}
      </div>

      {hover && (
        <div
          className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg bg-ink px-2.5 py-1.5 text-[12px] text-canvas shadow-[0_6px_20px_rgba(15,15,18,0.22)]"
          style={{ left: hover.left, top: hover.top }}
        >
          {hover.text}
        </div>
      )}
    </div>
  );
}

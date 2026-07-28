// First `n` words of `text`, with an ellipsis when it was longer. Used to cap
// topic descriptions on the public page.
export function truncateWords(text: string, n: number): string {
  const words = text.trim().split(/\s+/);
  if (words.length <= n) return text;
  return words.slice(0, n).join(" ") + "…";
}

// "2026-07-24T…" → "Jul 24". Empty string for anything unparseable.
export function shortDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// Deduped union of every resource across a set of logs, keyed by URL — powers the
// read-only topic-level "Resources" list (a computed view, no extra API call).
export function dedupeResourcesByUrl<T extends { url: string }>(lists: T[][]): T[] {
  const seen = new Map<string, T>();
  for (const list of lists) {
    for (const r of list) if (!seen.has(r.url)) seen.set(r.url, r);
  }
  return [...seen.values()];
}

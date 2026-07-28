// Resource URL normalization + dedup — ADR 0006.
// Dedup key: lowercase scheme + host + path, with trailing slash and query/hash stripped.

export type ResourceLike = { url: string; title: string };

/**
 * Normalize a URL to its dedup key: lowercase scheme+host+path, no trailing
 * slash, no query string, no hash. Falls back to a trimmed/lowercased string
 * for anything that isn't a parseable absolute URL.
 */
export function normalizeUrl(raw: string): string {
  const trimmed = raw.trim();
  try {
    const u = new URL(trimmed);
    const scheme = u.protocol.toLowerCase();        // e.g. "https:"
    const host = u.host.toLowerCase();              // host[:port]
    let path = u.pathname.toLowerCase();            // ADR: path compared case-insensitively
    if (path.length > 1 && path.endsWith("/")) {
      path = path.slice(0, -1);                     // strip a single trailing slash
    }
    return `${scheme}//${host}${path}`;             // query + hash dropped
  } catch {
    return trimmed.toLowerCase().replace(/\/+$/, "");
  }
}

/**
 * Collapse resources that share a normalized URL into one entry. The FIRST
 * occurrence wins for display (ADR 0006: "whichever title was entered first").
 * Pass resources ordered oldest-first so the earliest title is kept.
 */
export function dedupeResources<T extends ResourceLike>(resources: T[]): T[] {
  const seen = new Map<string, T>();
  for (const r of resources) {
    const key = normalizeUrl(r.url);
    if (!seen.has(key)) seen.set(key, r);
  }
  return [...seen.values()];
}

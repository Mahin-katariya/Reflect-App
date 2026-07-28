import { useEffect, useState } from "react";
import { shortDate } from "../lib/format";

type Log = { id: string; title: string };
type Topic = { id: string; title: string; description: string | null; logs: Log[] };
type FullLog = {
  id: string;
  title: string;
  notes: string;
  created_at: string;
  resources: { id: string; url: string; title: string }[];
};

/**
 * Drilldown modal for a public topic. Opens on the topic's log list; clicking a
 * log swaps to that log's detail (fetched on demand via the public
 * GET /logs/:id — the only network call, identical to the old LogModal). A Back
 * button returns to the list; the close button (and backdrop / Escape) dismiss.
 */
export default function TopicModal({ topic, onClose }: { topic: Topic; onClose: () => void }) {
  const [openLogId, setOpenLogId] = useState<string | null>(null);
  const [log, setLog] = useState<FullLog | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  // Fetch the full log when one is opened.
  useEffect(() => {
    if (!openLogId) return;
    let active = true;
    setLoading(true);
    setError(false);
    setLog(null);

    (async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/logs/${openLogId}`);
        const data = await res.json();
        if (!active) return;
        if (!data.ok) { setError(true); return; }
        setLog(data.data);
      } catch {
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => { active = false; };
  }, [openLogId]);

  // Escape: from detail → back to the list; from the list → close.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      if (openLogId) setOpenLogId(null);
      else onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openLogId, onClose]);

  return (
    <div
      className="animate-fade fixed inset-0 z-50 flex items-center justify-center bg-ink/25 p-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="animate-pop flex max-h-[82vh] w-full max-w-[600px] flex-col overflow-y-auto rounded-[10px] border border-line bg-surface p-4 pb-7 shadow-[0_16px_48px_rgba(15,15,18,0.14)]"
      >
        {/* top bar: Back (detail only) + Close */}
        <div className="flex min-h-[26px] items-center justify-between">
          {openLogId ? (
            <button
              type="button"
              onClick={() => setOpenLogId(null)}
              className="-ml-1 inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[13px] text-muted transition-colors hover:bg-ink/5 hover:text-ink"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M8.5 3.5L5 7l3.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back
            </button>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg px-1.5 text-[15px] leading-none text-faint transition-colors hover:text-ink"
          >
            ✕
          </button>
        </div>

        {!openLogId ? (
          <div key="list" className="animate-pop mt-1">
            <h2 className="font-serif text-[20px] font-medium tracking-[-0.3px] text-ink">{topic.title}</h2>
            {topic.description && (
              <p className="mt-2.5 text-[14px] leading-[1.6] text-muted">{topic.description}</p>
            )}
            <div className="mt-5 mb-1.5 text-[11px] font-semibold uppercase tracking-[0.09em] text-faint">Logs</div>
            {topic.logs.length === 0 ? (
              <p className="py-4 text-[14px] text-faint">No logs yet.</p>
            ) : (
              <ul>
                {topic.logs.map((l) => (
                  <li key={l.id} className="border-t border-line first:border-t-0">
                    <button
                      type="button"
                      onClick={() => setOpenLogId(l.id)}
                      className="w-full rounded-lg px-2 py-3 text-left font-serif text-[15px] font-medium tracking-[-0.2px] text-ink transition-colors hover:bg-ink/[0.02]"
                    >
                      {l.title}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <div key="detail" className="animate-pop mt-1">
            {loading && <p className="py-6 text-[14px] text-faint">Loading…</p>}
            {error && <p className="py-6 text-[14px] text-danger">Could not load this log.</p>}
            {log && (
              <>
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="font-serif text-[20px] font-medium tracking-[-0.3px] text-ink">{log.title}</h2>
                  <span className="shrink-0 text-[13px] tabular-nums text-faint">{shortDate(log.created_at)}</span>
                </div>
                {log.notes && (
                  <p className="mt-3 whitespace-pre-wrap text-[15px] leading-[1.6] text-muted">{log.notes}</p>
                )}
                {log.resources.length > 0 && (
                  <div className="mt-5">
                    <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.09em] text-faint">Resources</div>
                    <div className="flex flex-col gap-0.5">
                      {log.resources.map((r) => (
                        <a
                          key={r.id}
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex w-fit items-center gap-1.5 py-1 text-[13px] text-muted transition-colors hover:text-ink"
                        >
                          {r.title}
                          <span className="text-[11px] text-faint">↗</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

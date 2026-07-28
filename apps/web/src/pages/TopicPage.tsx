import { useEffect, useState } from "react";
import { Link, useOutletContext, useParams } from "react-router";
import { useAuth } from "../context/AuthContext";
import { shortDate, dedupeResourcesByUrl } from "../lib/format";
import type { DashboardContext } from "./Dashboard";
import LogAccordion from "../components/LogAccordion";
import ResourceLink from "../components/ResourceLink";

export default function TopicPage() {
  const { profile, reload } = useOutletContext<DashboardContext>();
  const { session } = useAuth();
  const { topicId } = useParams();
  const topic = profile.topics.find((t) => t.id === topicId);

  const [adding, setAdding] = useState(false);
  const [logTitle, setLogTitle] = useState("");
  const [logNotes, setLogNotes] = useState("");
  const [logUrl, setLogUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Inline-editable description (draft seeded from the topic, re-seeded when the
  // route switches to a different topic). Saved on blur via PATCH /topics/:id.
  const [description, setDescription] = useState(topic?.description ?? "");
  useEffect(() => { setDescription(topic?.description ?? ""); }, [topic?.id]);

  async function saveDescription() {
    const next = description.trim();
    if (next === (topic?.description ?? "")) return; // unchanged — skip
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/topics/${topic!.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ description: next }),
      });
      const data = await res.json();
      if (data.ok) await reload();
      else setDescription(topic?.description ?? ""); // revert on failure
    } catch {
      setDescription(topic?.description ?? "");
    }
  }

  if (!topic) {
    return (
      <div className="grid min-h-[100dvh] place-items-center px-6 text-center">
        <div>
          <p className="font-serif text-[22px] text-ink">Topic not found</p>
          <Link to="/dashboard" className="mt-2 inline-block text-[14px] text-muted hover:text-ink">Back to Learnings</Link>
        </div>
      </div>
    );
  }

  const logs = [...topic.logs].sort((a, b) => b.created_at.localeCompare(a.created_at));
  const allLinks = dedupeResourcesByUrl(topic.logs.map((l) => l.resources));

  async function handleAddLog(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/topics/${topic!.id}/logs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          title: logTitle,
          notes: logNotes,
          resources: logUrl.trim() ? [{ url: logUrl.trim() }] : [],
        }),
      });
      const data = await res.json();
      if (!data.ok) { setError(data.error.message); return; }
      setLogTitle(""); setLogNotes(""); setLogUrl(""); setAdding(false);
      await reload();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="sticky top-0 z-[3] flex items-center justify-between px-7 py-3 backdrop-blur-[6px]" style={{ background: "color-mix(in srgb, var(--color-canvas) 88%, transparent)" }}>
        <div className="text-[13px] text-faint">Learnings / <span className="font-medium text-muted">{topic.title}</span></div>
        <Link to={`/profile/${profile.username}`} className="rounded-lg px-2.5 py-1.5 text-[13px] text-muted transition-colors hover:bg-ink/[0.045] hover:text-ink">
          View public profile
        </Link>
      </div>

      <div className="animate-pop mx-auto max-w-[700px] px-7 pb-40 pt-10">
        <h1 className="font-serif text-[42px] font-medium leading-[1.08] tracking-[-0.8px] text-ink text-balance">{topic.title}</h1>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={saveDescription}
          onKeyDown={(e) => { if (e.key === "Escape") e.currentTarget.blur(); }}
          placeholder="Add a description…"
          rows={1}
          maxLength={450}
          aria-label="Topic description"
          className="field-sizing-content -mx-1 mt-3.5 w-full max-w-[62ch] resize-none rounded bg-transparent px-1 text-[17px] leading-[1.6] text-muted outline-none placeholder:text-faint focus:shadow-[0_0_0_3px_rgba(15,15,18,0.08)]"
        />

        <div className="mt-4 flex items-center gap-3.5 text-[13px] tabular-nums text-faint">
          <span>{topic.logs.length} {topic.logs.length === 1 ? "log" : "logs"}</span>
          <span className="h-[3px] w-[3px] rounded-full bg-faint" />
          <span>{allLinks.length} {allLinks.length === 1 ? "link" : "links"}</span>
          <span className="h-[3px] w-[3px] rounded-full bg-faint" />
          <span>Started {shortDate(logs.length ? logs[logs.length - 1].created_at : topic.created_at)}</span>
        </div>

        {allLinks.length > 0 && (
          <div className="mt-8 border-t border-line pt-5">
            <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.09em] text-faint">Resources</div>
            <div className="flex flex-col items-start gap-1.5">
              {allLinks.map((r) => <ResourceLink key={r.id} resource={r} />)}
            </div>
          </div>
        )}

        <div className="mt-10">
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.09em] text-faint">Logs</div>

          {/* add-log — dashed box, pinned above the newest log */}
          <div className="mb-2.5 rounded-[10px] border border-dashed border-line-strong">
            {adding ? (
              <form onSubmit={handleAddLog} className="flex flex-col gap-2 p-3.5">
                {error && <p className="text-[13px] text-danger">{error}</p>}
                <input
                  autoFocus
                  type="text"
                  placeholder="What did you learn?"
                  value={logTitle}
                  onChange={(e) => setLogTitle(e.target.value)}
                  required
                  className="w-full bg-transparent text-[15px] font-medium text-ink outline-none placeholder:text-faint"
                />
                <textarea
                  placeholder="Notes (optional)"
                  value={logNotes}
                  onChange={(e) => setLogNotes(e.target.value)}
                  rows={2}
                  className="field-sizing-content w-full resize-none bg-transparent text-[14px] text-muted outline-none placeholder:text-faint"
                />
                <input
                  type="url"
                  placeholder="Add a link (optional)"
                  value={logUrl}
                  onChange={(e) => setLogUrl(e.target.value)}
                  className="mt-2 w-full bg-transparent text-[14px] text-ink outline-none placeholder:text-faint"
                />
                <div className="flex items-center gap-2 pt-0.5">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-[8px] bg-ink px-3.5 py-1.5 text-[13px] text-canvas transition-[background,transform] hover:bg-ink-hover active:scale-[0.99] disabled:opacity-50"
                  >
                    {submitting ? "Adding…" : "Add log"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setAdding(false); setError(""); }}
                    className="rounded-[8px] px-3 py-1.5 text-[13px] text-muted transition-colors hover:bg-ink/5 hover:text-ink"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setAdding(true)}
                className="flex w-full items-center gap-2 rounded-[10px] px-3.5 py-2.5 text-left text-[14px] text-faint transition-colors hover:bg-ink/[0.02] hover:text-muted"
              >
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true"><path d="M6.5 2.5V10.5M2.5 6.5H10.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>
                New log
              </button>
            )}
          </div>

          {logs.length === 0 ? (
            <p className="border-t border-line py-6 text-[14px] text-faint">No logs yet. Add your first one above.</p>
          ) : (
            logs.map((log) => <LogAccordion key={log.id} log={log} onSaved={reload} />)
          )}
        </div>
      </div>
    </>
  );
}

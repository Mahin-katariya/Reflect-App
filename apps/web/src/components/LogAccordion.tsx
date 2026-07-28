import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { shortDate } from "../lib/format";
import type { Log } from "../lib/types";
import ResourceLink from "./ResourceLink";
import LinkEditModal from "./LinkEditModal";

type LogAccordionProps = {
  log: Log;
  onSaved: () => void;   // parent's reload — refetch after a successful PATCH
};

export default function LogAccordion({ log, onSaved }: LogAccordionProps) {
  const { session } = useAuth();

  const [open, setOpen] = useState(false);
  // Drafts: seeded ONCE from saved values, then edited locally (same as the old LogItem).
  const [title, setTitle] = useState(log.title);
  const [notes, setNotes] = useState(log.notes);
  const [newUrl, setNewUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Log["resources"][number] | null>(null);

  // Low-level PATCH: send only the given fields; omitted fields are left untouched
  // server-side (schema is .optional() with no defaults — never send a full object).
  async function patchLog(body: object): Promise<boolean> {
    setSaving(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/logs/${log.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      return data.ok === true;
    } catch {
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function saveField(patch: { title?: string; notes?: string }) {
    const nextTitle = patch.title;
    const nextNotes = patch.notes;
    // Nothing changed — don't PATCH.
    if (nextTitle !== undefined && nextTitle === log.title) return;
    if (nextNotes !== undefined && nextNotes === log.notes) return;
    // Title can't be blank — revert the draft and bail.
    if (nextTitle !== undefined && nextTitle.trim() === "") { setTitle(log.title); return; }

    const ok = await patchLog(patch);
    if (ok) onSaved();
    else { setTitle(log.title); setNotes(log.notes); }
  }

  // Resources are edited by sending the WHOLE desired list, built from the current
  // prop (data-down) — the server replaces the set.
  const asInput = (r: Log["resources"][number]) => ({ url: r.url, title: r.title });

  async function addResource(e: React.FormEvent) {
    e.preventDefault();
    if (!newUrl.trim()) return;
    const next = [...log.resources.map(asInput), { url: newUrl.trim() }];
    const ok = await patchLog({ resources: next });
    if (ok) { setNewUrl(""); onSaved(); }
  }

  async function removeResource(id: string) {
    const next = log.resources.filter((r) => r.id !== id).map(asInput);
    const ok = await patchLog({ resources: next });
    if (ok) { setEditing(null); onSaved(); }
  }

  async function saveResourceEdit(id: string, patch: { url: string; title: string }) {
    const next = log.resources.map((r) => (r.id === id ? { url: patch.url, title: patch.title } : asInput(r)));
    const ok = await patchLog({ resources: next });
    if (ok) { setEditing(null); onSaved(); }
  }

  const when = shortDate(log.created_at);

  return (
    <div className={`border-t border-line py-0.5 last-of-type:border-b ${open ? "log-open" : ""}`}>
      {/* header — click toggles; the title input stops propagation so editing doesn't toggle */}
      <div
        className="flex cursor-pointer items-center gap-2.5 rounded-lg px-1 py-3.5 transition-colors hover:bg-ink/[0.02]"
        onClick={() => setOpen((o) => !o)}
      >
        <svg
          width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true"
          className={`shrink-0 text-faint transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${open ? "rotate-90" : ""}`}
        >
          <path d="M4 2.5L7.5 5.5L4 8.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className={`flex shrink-0 ${open ? "text-ink" : "text-faint"}`}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><circle cx="6" cy="6" r="3" fill="currentColor" /></svg>
        </span>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => saveField({ title })}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
          disabled={saving}
          aria-label="Log title"
          className="-mx-1 min-w-0 flex-1 rounded bg-transparent px-1 text-[15px] font-medium text-ink outline-none focus:shadow-[0_0_0_3px_rgba(15,15,18,0.08)] disabled:opacity-60"
        />
        <span className="shrink-0 text-[13px] tabular-nums text-faint">{when}</span>
      </div>

      {/* body — grid-rows accordion (transform/height only), respects reduced motion */}
      <div className={`grid transition-[grid-template-rows] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className={`overflow-hidden pl-[34px] pr-1 transition-opacity duration-200 ease-out motion-reduce:transition-none ${open ? "pb-4 opacity-100" : "opacity-0"}`}>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={() => saveField({ notes })}
            placeholder="Add notes…"
            rows={1}
            disabled={saving}
            aria-label="Log notes"
            className="field-sizing-content mt-1.5 -mx-1 w-full resize-none rounded bg-transparent px-1 py-1 text-[15px] text-muted outline-none placeholder:text-faint focus:shadow-[0_0_0_3px_rgba(15,15,18,0.08)] disabled:opacity-60"
          />

          {log.resources.length > 0 && (
            <div className="mt-4 flex flex-col items-start gap-1.5">
              {log.resources.map((r) => (
                <ResourceLink key={r.id} resource={r} editable onEdit={() => setEditing(r)} />
              ))}
            </div>
          )}

          <form onSubmit={addResource} className={log.resources.length ? "mt-2" : "mt-4"}>
            <input
              type="url"
              placeholder="Add a link…"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              disabled={saving}
              className="-mx-1 w-full rounded bg-transparent px-1 py-1 text-[14px] text-ink outline-none placeholder:text-faint focus:shadow-[0_0_0_3px_rgba(15,15,18,0.08)] disabled:opacity-60"
            />
          </form>
        </div>
      </div>

      {editing && (
        <LinkEditModal
          resource={editing}
          saving={saving}
          onSave={(next) => saveResourceEdit(editing.id, next)}
          onRemove={() => removeResource(editing.id)}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

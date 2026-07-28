import { useEffect, useState } from "react";
import type { Resource } from "../lib/types";

type LinkEditModalProps = {
  resource: Resource;
  saving?: boolean;
  onSave: (next: { url: string; title: string }) => void;
  onRemove: () => void;
  onClose: () => void;
};

const inputCls =
  "w-full rounded-[7px] border border-line bg-surface px-2.5 py-2 text-[13px] text-ink outline-none transition focus:border-ink focus:shadow-[0_0_0_3px_rgba(15,15,18,0.08)]";

export default function LinkEditModal({ resource, saving, onSave, onRemove, onClose }: LinkEditModalProps) {
  const [url, setUrl] = useState(resource.url);
  const [title, setTitle] = useState(resource.title);

  // Esc closes; lock body scroll while open.
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [onClose]);

  function save() {
    if (!url.trim()) return;      // URL is required by the server
    onSave({ url: url.trim(), title: title.trim() });
  }

  return (
    <div
      className="animate-fade fixed inset-0 z-[1000] flex items-center justify-center bg-[rgba(15,15,18,0.28)] backdrop-blur-[2px]"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Edit link"
        className="animate-pop w-[320px] rounded-[14px] border border-line bg-surface p-4 shadow-[0_20px_50px_rgba(15,15,18,0.22)]"
      >
        <div className="mb-3 text-[14px] font-semibold text-ink">Edit link</div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11.5px] font-medium text-muted" htmlFor="link-url">Page or URL</label>
          <input
            id="link-url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") save(); }}
            spellCheck={false}
            className={inputCls}
          />
          <label className="mt-1 text-[11.5px] font-medium text-muted" htmlFor="link-title">Link title</label>
          <input
            id="link-title"
            value={title}
            autoFocus
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") save(); }}
            spellCheck={false}
            className={inputCls}
          />
        </div>

        <div className="mt-3.5 flex items-center justify-between border-t border-line pt-3">
          <button
            type="button"
            onClick={onRemove}
            disabled={saving}
            className="flex items-center gap-2 rounded-md px-1.5 py-1.5 text-[13px] text-muted transition-colors hover:bg-danger-bg hover:text-danger disabled:opacity-50"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M2.5 4h9M5 4V3a1 1 0 011-1h2a1 1 0 011 1v1M3.6 4l.4 7a1 1 0 001 1h4a1 1 0 001-1l.4-7" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Remove link
          </button>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="rounded-[8px] bg-ink px-4 py-1.5 text-[13px] text-canvas transition-[background,transform] hover:bg-ink-hover active:scale-[0.99] disabled:opacity-50"
          >
            {saving ? "Saving…" : "Done"}
          </button>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import type { Resource } from "../lib/types";

type ResourceLinkProps = {
  resource: Resource;
  editable?: boolean;   // show the pencil (per-log links); false for the read-only aggregate
  onEdit?: () => void;
};

function LinkGlyph() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <path d="M5 8L8 5M4.5 6.2L3.4 7.3a2 2 0 102.8 2.8l1.1-1.1M8.5 6.8l1.1-1.1a2 2 0 10-2.8-2.8L5.7 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export default function ResourceLink({ resource, editable = false, onEdit }: ResourceLinkProps) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try { await navigator.clipboard?.writeText(resource.url); } catch { /* clipboard blocked */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 1100);
  }

  return (
    <span className="group inline-flex items-center gap-1.5">
      <a
        href={resource.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-[14px] text-muted transition-colors hover:text-ink [&:hover_.t]:underline [&:hover_.t]:underline-offset-2"
      >
        <span className="flex shrink-0 text-faint"><LinkGlyph /></span>
        <span className="t">{resource.title || resource.url}</span>
      </a>

      <span className="inline-flex gap-px opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 motion-reduce:transition-none">
        <button
          type="button"
          onClick={copy}
          aria-label="Copy link"
          className={`flex rounded-md p-1 transition-colors hover:bg-ink/5 ${copied ? "text-ink" : "text-faint hover:text-ink"}`}
        >
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <rect x="4.5" y="4.5" width="7" height="7" rx="1.4" stroke="currentColor" strokeWidth="1.2" />
            <path d="M9.5 4.5V3.4A1.4 1.4 0 008.1 2H3.4A1.4 1.4 0 002 3.4V8.1A1.4 1.4 0 003.4 9.5H4.5" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        </button>
        {editable && (
          <button
            type="button"
            onClick={onEdit}
            aria-label="Edit link"
            className="flex rounded-md p-1 text-faint transition-colors hover:bg-ink/5 hover:text-ink"
          >
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M9.4 2.8l1.8 1.8M2.7 11l-.4 1.4 1.4-.4 7.1-7.1a1.1 1.1 0 000-1.6l-.2-.2a1.1 1.1 0 00-1.6 0z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </span>
    </span>
  );
}

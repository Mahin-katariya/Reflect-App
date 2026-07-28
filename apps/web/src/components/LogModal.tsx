import { useEffect, useState } from "react";

type Resource = { id: string; url: string; title: string };
type Log = { id: string; title: string; notes: string; created_at: string; resources: Resource[] };

type LogModalProps = {
  logId: string;
  onClose: () => void;
};

export default function LogModal({ logId, onClose }: LogModalProps) {
  const [log, setLog] = useState<Log | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Fetch the full log (notes + resources) on open, via the public endpoint.
  useEffect(() => {
    let active = true;   // guard against setting state after unmount / logId change
    setLoading(true);
    setError(false);

    async function load() {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/logs/${logId}`);
        const data = await res.json();
        if (!active) return;
        if (!data.ok) { setError(true); return; }
        setLog(data.data);
      } catch {
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => { active = false; };
  }, [logId]);

  // Close on Escape.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    // Backdrop: clicking it closes the modal.
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      {/* Stop clicks inside the panel from bubbling up to the backdrop. */}
      <div
        role="dialog"
        aria-modal="true"
        className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[80vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {loading && <p className="text-gray-500">Loading…</p>}
        {error && <p className="text-red-600">Could not load this log.</p>}

        {log && (
          <>
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-lg font-semibold">{log.title}</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="text-gray-400 hover:text-gray-700 text-xl leading-none"
              >
                ×
              </button>
            </div>

            {log.notes && (
              <p className="mt-3 text-gray-700 whitespace-pre-wrap">{log.notes}</p>
            )}

            {log.resources.length > 0 && (
              <ul className="mt-4 space-y-1 text-sm">
                {log.resources.map((r) => (
                  <li key={r.id}>
                    <a href={r.url} target="_blank" className="text-blue-600 hover:underline">
                      {r.title}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  );
}

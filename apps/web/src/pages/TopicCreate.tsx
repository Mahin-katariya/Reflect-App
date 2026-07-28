import { useState } from "react";
import { Link, useNavigate, useOutletContext } from "react-router";
import { useAuth } from "../context/AuthContext";
import type { DashboardContext } from "./Dashboard";

// Topic title + description are set here, at creation. There is no PATCH /topics
// endpoint, so they are display-only afterwards — capture both up front.
export default function TopicCreate() {
  const { reload } = useOutletContext<DashboardContext>();
  const { session } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/topics`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ title, description }),
      });
      const data = await res.json();
      if (!data.ok) { setError(data.error.message); return; }
      await reload();
      navigate(data.data?.id ? `/dashboard/${data.data.id}` : "/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="animate-pop mx-auto max-w-[560px] px-7 pb-40 pt-16">
      <div className="mb-6 text-[13px] text-faint">Learnings / <span className="font-medium text-muted">New topic</span></div>
      <h1 className="font-serif text-[34px] font-medium tracking-[-0.6px] text-ink">New topic</h1>
      <p className="mt-2 text-[15px] text-muted">Name the thing you're learning. You can add logs to it right after.</p>

      {error && (
        <p className="mt-6 rounded-[10px] border border-danger-border bg-danger-bg px-3 py-2 text-[13px] text-danger">{error}</p>
      )}

      <form onSubmit={handleSubmit} className="mt-8">
        <div className="mb-3.5">
          <label className="mb-1.5 block text-[13px] text-muted" htmlFor="topic-title">Title</label>
          <input
            id="topic-title"
            autoFocus
            type="text"
            placeholder="e.g. Distributed Systems"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full rounded-[10px] border border-line bg-surface px-3.5 py-3 text-[15px] text-ink outline-none transition placeholder:text-faint focus:border-ink focus:shadow-[0_0_0_3px_rgba(15,15,18,0.08)]"
          />
        </div>
        <div className="mb-5">
          <label className="mb-1.5 block text-[13px] text-muted" htmlFor="topic-desc">Description <span className="text-faint">(optional)</span></label>
          <textarea
            id="topic-desc"
            placeholder="What are you exploring, and why?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="field-sizing-content w-full resize-none rounded-[10px] border border-line bg-surface px-3.5 py-3 text-[15px] text-ink outline-none transition placeholder:text-faint focus:border-ink focus:shadow-[0_0_0_3px_rgba(15,15,18,0.08)]"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-[10px] bg-ink px-4 py-2.5 text-[14px] text-canvas transition-[background,transform] hover:bg-ink-hover active:scale-[0.99] disabled:opacity-50"
          >
            {submitting ? "Creating…" : "Create topic"}
          </button>
          <Link to="/dashboard" className="rounded-[10px] px-3 py-2.5 text-[14px] text-muted transition-colors hover:bg-ink/5 hover:text-ink">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

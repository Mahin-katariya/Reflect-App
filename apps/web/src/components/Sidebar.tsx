import { NavLink, useNavigate } from "react-router";
import { supabase } from "../lib/supabase";
import type { Topic } from "../lib/types";

type SidebarProps = {
  topics: Topic[];
  username: string;
};

function TopicGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="2.5" y="2" width="9" height="10" rx="1.4" stroke="currentColor" strokeWidth="1.2" />
      <path d="M4.5 5H9.5M4.5 7.5H9.5M4.5 10H7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export default function Sidebar({ topics, username }: SidebarProps) {
  const navigate = useNavigate();

  return (
    <aside className="sticky top-0 flex h-[100dvh] w-[232px] shrink-0 flex-col gap-0.5 self-start border-r border-line bg-sidebar p-2.5">
      <div className="flex items-center justify-between px-2 pb-2.5 pt-1">
        <span className="text-[13px] font-medium text-muted">Learnings</span>
        <button
          type="button"
          onClick={() => navigate("/dashboard/new")}
          aria-label="New topic"
          className="grid h-6 w-6 place-items-center rounded-md text-faint transition-colors hover:bg-ink/5 hover:text-muted"
        >
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
            <path d="M7.5 2.5V12.5M2.5 7.5H12.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <nav className="flex flex-col gap-0.5 overflow-y-auto">
        {topics.length === 0 ? (
          <p className="px-2 py-1.5 text-[13px] text-faint">No topics yet.</p>
        ) : (
          topics.map((t) => (
            <NavLink
              key={t.id}
              to={`/dashboard/${t.id}`}
              className={({ isActive }) =>
                [
                  "flex items-center gap-2.5 rounded-[7px] px-2 py-1.5 text-[14px] transition-colors",
                  isActive
                    ? "bg-ink/[0.07] font-medium text-ink [&_.g]:text-ink"
                    : "text-muted hover:bg-ink/[0.045] hover:text-ink",
                ].join(" ")
              }
            >
              <span className="g flex shrink-0 text-faint">
                <TopicGlyph />
              </span>
              <span className="truncate">{t.title}</span>
            </NavLink>
          ))
        )}
      </nav>

      <div className="mt-auto flex items-center justify-between gap-2 border-t border-line px-2 pb-0.5 pt-2.5">
        <span className="truncate text-[13px] font-medium text-muted transition-colors hover:text-ink cursor-default">@{username}</span>
        <button
          type="button"
          onClick={() => supabase.auth.signOut()}
          className="shrink-0 rounded-[7px] px-2.5 py-1.5 text-[13px] text-muted transition-colors hover:bg-ink/5 hover:text-ink cursor-pointer"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}

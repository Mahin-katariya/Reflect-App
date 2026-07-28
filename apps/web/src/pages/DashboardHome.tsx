import { Link, useNavigate, useOutletContext } from "react-router";
import type { DashboardContext } from "./Dashboard";
import BrandMark from "../components/BrandMark";

export default function DashboardHome() {
  const { profile } = useOutletContext<DashboardContext>();
  const navigate = useNavigate();
  const hasTopics = profile.topics.length > 0;

  return (
    <div className="grid min-h-[100dvh] place-items-center px-6 text-center">
      <div className="animate-pop max-w-[380px]">
        <span className="inline-flex text-faint"><BrandMark /></span>
        <h1 className="mt-4 font-serif text-[28px] font-medium tracking-[-0.4px] text-ink text-balance">
          {hasTopics ? "Pick up where you left off" : "Start your first learning"}
        </h1>
        <p className="mt-2 text-[15px] text-muted">
          {hasTopics
            ? "Choose a topic from the sidebar, or start a new one."
            : "A topic is one thing you're learning. Add logs to it as you go."}
        </p>
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => navigate("/dashboard/new")}
            className="rounded-[10px] bg-ink px-4 py-2.5 text-[14px] text-canvas transition-[background,transform] hover:bg-ink-hover active:scale-[0.99]"
          >
            New topic
          </button>
          {hasTopics && (
            <Link
              to={`/dashboard/${profile.topics[0].id}`}
              className="rounded-[10px] border border-line-strong px-4 py-2.5 text-[14px] text-ink transition-colors hover:border-faint hover:bg-surface"
            >
              Open {profile.topics[0].title}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useParams } from "react-router";
import BrandMark from "../components/BrandMark";
import Heatmap from "../components/Heatmap";
import type { HeatCell } from "../components/Heatmap";
import TopicModal from "../components/TopicModal";
import { truncateWords } from "../lib/format";

type Log = { id: string; title: string };
type Topic = {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  logs: Log[];
  resources: { url: string; title: string }[]; // kept in the payload; shown per-log in the modal
};
type Profile = {
  id: string;
  username: string;
  timezone: string;
  createdAt: string;
  streak: number;
  today: string;
  heatmap: HeatCell[];
  topics: Topic[];
};

function joinedLabel(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function PublicProfile() {
  const { slug } = useParams();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [openTopic, setOpenTopic] = useState<Topic | null>(null);
  const [joined, setJoined] = useState("");

  useEffect(() => {
    if (!slug) return;
    let active = true;

    (async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/profile/${slug}`);
        const data = await res.json();
        if (!active) return;
        if (!data.ok) { setNotFound(true); return; }
        setProfile(data.data);
      } catch {
        if (active) setNotFound(true);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => { active = false; };
  }, [slug]);

  // "Joined" = the date of the very first log of the very first (oldest) topic.
  // Topics + logs come newest-first, so the oldest is the last element. The
  // public payload omits per-log timestamps, so fetch that one log's created_at
  // (public GET /logs/:id). Falls back to the account's createdAt.
  useEffect(() => {
    if (!profile) return;
    const oldestTopic = profile.topics[profile.topics.length - 1];
    const firstLog = oldestTopic?.logs[oldestTopic.logs.length - 1];
    if (!firstLog) { setJoined(joinedLabel(profile.createdAt)); return; }

    let active = true;
    (async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/logs/${firstLog.id}`);
        const data = await res.json();
        if (!active) return;
        setJoined(joinedLabel(data.ok ? data.data.created_at : profile.createdAt));
      } catch {
        if (active) setJoined(joinedLabel(profile.createdAt));
      }
    })();

    return () => { active = false; };
  }, [profile]);

  if (loading) {
    return <div className="grid min-h-[100dvh] place-items-center text-[14px] text-muted">Loading…</div>;
  }

  if (notFound || !profile) {
    return (
      <div className="grid min-h-[100dvh] place-items-center px-6 text-center">
        <div>
          <p className="font-serif text-[22px] text-ink">Profile not found</p>
          <p className="mt-2 text-[14px] text-muted">
            No profile exists for <code>/{slug}</code>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] px-6 py-20 sm:px-8">
      <div className="animate-pop mx-auto max-w-[720px]">
        {/* header: identity left half, activity heatmap right half (equal height) */}
        <header className="grid grid-cols-1 items-start gap-8 sm:grid-cols-2">
          <div>
            <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-ink text-canvas">
              <BrandMark className="h-[22px] w-[22px]" />
            </div>
            <h1 className="mt-[18px] text-[20px] font-medium tracking-[-0.2px] text-ink">@{profile.username}</h1>
            {joined && <p className="mt-2.5 text-[12px] text-faint">Joined {joined}</p>}
          </div>
          {profile.heatmap.length > 0 && (
            <div className="min-w-0">
              <Heatmap cells={profile.heatmap} today={profile.today} />
            </div>
          )}
        </header>

        {/* topics — click a row to drill into the topic's logs */}
        <ul className="mt-11">
          {profile.topics.length === 0 ? (
            <li className="text-[14px] text-faint">No topics yet.</li>
          ) : (
            profile.topics.map((t) => (
              <li key={t.id} className="border-t border-line first:border-t-0">
                <button type="button" onClick={() => setOpenTopic(t)} className="group block w-full py-6 text-left">
                  <span className="block font-serif text-[17px] font-medium tracking-[-0.2px] text-ink underline decoration-line-strong decoration-1 underline-offset-4 transition-colors group-hover:text-ink-hover group-hover:decoration-ink">
                    {t.title}
                  </span>
                  {t.description && (
                    <span className="mt-1.5 block max-w-[48ch] text-[14px] leading-[1.55] text-muted">
                      {truncateWords(t.description, 14)}
                    </span>
                  )}
                </button>
              </li>
            ))
          )}
        </ul>
      </div>

      {openTopic && <TopicModal topic={openTopic} onClose={() => setOpenTopic(null)} />}
    </div>
  );
}

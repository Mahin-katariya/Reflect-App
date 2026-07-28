import { useCallback, useEffect, useState } from "react";
import { Outlet } from "react-router";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import type { Profile } from "../lib/types";

// Shared with child routes via <Outlet context>. TopicPage / TopicCreate read this.
export type DashboardContext = { profile: Profile; reload: () => Promise<void> };

export default function Dashboard() {
  const { session } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/me`, {
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });
    const data = await res.json();
    if (!data.ok) { setError(data.error.message); return; }
    setProfile(data.data);
    setLoading(false);
  }, [session]);

  useEffect(() => { if (session) reload(); }, [session, reload]);

  if (loading) return <div className="grid min-h-[100dvh] place-items-center text-[15px] text-muted">Loading…</div>;
  if (error) return <div className="grid min-h-[100dvh] place-items-center text-[15px] text-danger">{error}</div>;
  if (!profile) return null;

  return (
    <div className="flex min-h-[100dvh] bg-canvas">
      <Sidebar topics={profile.topics} username={profile.username} />
      <main className="min-w-0 flex-1">
        <Outlet context={{ profile, reload } satisfies DashboardContext} />
      </main>
    </div>
  );
}

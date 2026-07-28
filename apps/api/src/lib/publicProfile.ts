// Pure shaper for GET /profile/:slug — takes the raw Prisma row + current
// instant and produces the public response: per-topic deduped resource lists
// (ADR 0006) plus the account-level streak/heatmap (ADR 0003/0012).
// Kept pure (no DB, no I/O) so the dedup + activity assembly is unit-testable.

import { dedupeResources } from "./resources.js";
import { computeActivity } from "./activity.js";

type RawResource = { id: string; url: string; title: string };
type RawLog = { id: string; title: string; created_at: Date; resources: RawResource[] };
type RawTopic = {
  id: string;
  title: string;
  description: string | null;
  created_at: Date;
  logs: RawLog[];
};
export type RawProfile = {
  id: string;
  username: string;
  timezone: string;
  createdAt: Date;
  topics: RawTopic[];
};

export function buildPublicProfile(profile: RawProfile, now: Date) {
  const topics = profile.topics.map((t) => {
    // Oldest log first so the earliest-entered title wins in dedup (ADR 0006).
    const resourcesOldestFirst = [...t.logs]
      .sort((a, b) => a.created_at.getTime() - b.created_at.getTime())
      .flatMap((l) => l.resources.map((r) => ({ url: r.url, title: r.title })));

    return {
      id: t.id,
      title: t.title,
      description: t.description,
      created_at: t.created_at,
      logs: t.logs.map((l) => ({ id: l.id, title: l.title })), // list needs only these
      resources: dedupeResources(resourcesOldestFirst), // deduped topic-level list
    };
  });

  const allLogInstants = profile.topics.flatMap((t) => t.logs.map((l) => l.created_at));
  const { today, streak, heatmap } = computeActivity(allLogInstants, profile.timezone, now);

  return {
    id: profile.id,
    username: profile.username,
    timezone: profile.timezone,
    createdAt: profile.createdAt,
    today,
    streak,
    heatmap,
    topics,
  };
}

// Shapes returned by GET /me (the authed dashboard). Field names mirror the API
// envelope's `data` exactly — do not rename; the UI reads these directly.
export type Resource = { id: string; url: string; title: string };

export type Log = {
  id: string;
  title: string;
  notes: string;
  created_at: string;
  resources: Resource[];
};

export type Topic = {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  logs: Log[];
};

export type Profile = {
  id: string;
  username: string;
  timezone: string;
  createdAt: string;
  topics: Topic[];
};

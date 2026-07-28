export type ResourceItem = { url: string; title: string };

/**
 * The topic-level deduplicated resource list — every link cited across the
 * topic's logs, collapsed by normalized URL on the server (ADR 0006). Separate
 * from the per-log resources shown inside a log's modal.
 */
export default function TopicResourceList({ resources }: { resources: ResourceItem[] }) {
  if (resources.length === 0) return null;

  return (
    <div className="mt-3 pt-3 border-t">
      <h3 className="text-xs font-medium uppercase tracking-wide text-gray-400">Resources</h3>
      <ul className="mt-1 space-y-0.5 text-sm">
        {resources.map((r) => (
          <li key={r.url}>
            <a href={r.url} target="_blank" className="text-blue-600 hover:underline">
              {r.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

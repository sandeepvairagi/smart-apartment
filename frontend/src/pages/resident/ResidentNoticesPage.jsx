import { useEffect, useState } from 'react';
import { getPublishedNotices } from '../../services/noticeService';
import Spinner from '../../components/Spinner';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';

function ResidentNoticesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [priority, setPriority] = useState('');
  const [search, setSearch] = useState('');

  const load = async (params = {}) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await getPublishedNotices({ limit: 50, ...params });
      setItems(data.data.items);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load notices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onFilter = (e) => {
    e.preventDefault();
    const params = {};
    if (priority) params.priority = priority;
    if (search.trim()) params.search = search.trim();
    load(params);
  };

  return (
    <section className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Notices</h1>
        <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
          Published announcements from building management.
        </p>
      </div>

      <form
        onSubmit={onFilter}
        className="flex flex-wrap items-end gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4"
      >
        <label className="block text-sm font-medium">
          Priority
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="mt-1 block rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2"
          >
            <option value="">All</option>
            <option value="high">High</option>
            <option value="normal">Normal</option>
            <option value="low">Low</option>
          </select>
        </label>
        <label className="block min-w-[200px] flex-1 text-sm font-medium">
          Search
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notices..."
            className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2"
          />
        </label>
        <button
          type="submit"
          className="rounded-md border border-[var(--color-border)] px-4 py-2 text-sm font-medium"
        >
          Filter
        </button>
      </form>

      {loading ? (
        <Spinner />
      ) : error ? (
        <p className="text-[var(--color-danger)]">{error}</p>
      ) : items.length === 0 ? (
        <EmptyState
          title="No notices"
          description="When the admin publishes a notice, it will appear here."
        />
      ) : (
        <ul className="space-y-4">
          {items.map((n) => (
            <li
              key={n._id}
              className={`rounded-xl border bg-[var(--color-surface-elevated)] p-5 ${
                n.priority === 'high'
                  ? 'border-red-300 dark:border-red-800'
                  : 'border-[var(--color-border)]'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h2 className="text-lg font-semibold">{n.title}</h2>
                <StatusBadge status={n.priority} />
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm text-[var(--color-ink-muted)]">
                {n.body}
              </p>
              <p className="mt-3 text-xs text-[var(--color-ink-muted)]">
                {n.createdBy?.name ? `By ${n.createdBy.name} · ` : ''}
                {new Date(n.publishedAt || n.createdAt).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default ResidentNoticesPage;

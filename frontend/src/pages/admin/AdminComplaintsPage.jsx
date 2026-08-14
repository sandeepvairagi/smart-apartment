import { useEffect, useState } from 'react';
import {
  getAllComplaints,
  getComplaintStats,
  updateComplaint,
  resolveComplaint,
} from '../../services/complaintService';
import Spinner from '../../components/Spinner';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';

function AdminComplaintsPage() {
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [resolveId, setResolveId] = useState(null);
  const [resolution, setResolution] = useState('');

  const load = async (params = {}) => {
    setLoading(true);
    setError('');
    try {
      const [listRes, statsRes] = await Promise.all([
        getAllComplaints(params),
        getComplaintStats(),
      ]);
      setItems(listRes.data.data.items);
      setStats(statsRes.data.data.stats);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load complaints');
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
    if (status) params.status = status;
    if (category) params.category = category;
    if (search.trim()) params.search = search.trim();
    load(params);
  };

  const onUpdateStatus = async (id, nextStatus) => {
    if (nextStatus === 'resolved') {
      setResolveId(id);
      return;
    }
    setMessage('');
    setError('');
    try {
      await updateComplaint(id, { status: nextStatus });
      setMessage(`Complaint marked ${nextStatus}`);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    }
  };

  const onResolve = async (e) => {
    e.preventDefault();
    if (!resolveId) return;
    setMessage('');
    setError('');
    try {
      await resolveComplaint(resolveId, { resolution });
      setMessage('Complaint resolved');
      setResolveId(null);
      setResolution('');
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Resolve failed');
    }
  };

  return (
    <section>
      <h1 className="font-display text-3xl font-bold">Complaints</h1>
      <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
        Review, update, and resolve resident issues.
      </p>

      {stats && (
        <div className="mt-6 grid gap-3 sm:grid-cols-5">
          {[
            { label: 'Total', value: stats.total },
            { label: 'Open', value: stats.open },
            { label: 'In progress', value: stats.inProgress },
            { label: 'Resolved', value: stats.resolved },
            { label: 'Closed', value: stats.closed },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4 text-center"
            >
              <p className="text-xs text-[var(--color-ink-muted)]">{s.label}</p>
              <p className="text-2xl font-semibold">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={onFilter} className="mt-6 flex flex-wrap gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search title..."
          className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-2 text-sm"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          <option value="open">Open</option>
          <option value="in-progress">In progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-2 text-sm"
        >
          <option value="">All categories</option>
          {['maintenance', 'noise', 'security', 'cleaning', 'parking', 'other'].map(
            (c) => (
              <option key={c} value={c}>
                {c}
              </option>
            )
          )}
        </select>
        <button
          type="submit"
          className="rounded-md border border-[var(--color-border)] px-4 py-2 text-sm"
        >
          Filter
        </button>
      </form>

      {message && <p className="mt-4 text-sm text-[var(--color-success)]">{message}</p>}
      {error && <p className="mt-4 text-sm text-[var(--color-danger)]">{error}</p>}

      {resolveId && (
        <form
          onSubmit={onResolve}
          className="mt-4 space-y-3 rounded-xl border border-[var(--color-accent)] bg-[var(--color-accent-soft)] p-4"
        >
          <p className="text-sm font-semibold">Resolve complaint — add notes</p>
          <textarea
            required
            rows={3}
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
            placeholder="Describe how the issue was resolved..."
            className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-2 text-sm"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white"
            >
              Confirm resolve
            </button>
            <button
              type="button"
              onClick={() => {
                setResolveId(null);
                setResolution('');
              }}
              className="rounded-md border border-[var(--color-border)] px-4 py-2 text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <Spinner />
      ) : items.length === 0 ? (
        <div className="mt-6">
          <EmptyState title="No complaints" />
        </div>
      ) : (
        <ul className="mt-6 space-y-4">
          {items.map((c) => (
            <li
              key={c._id}
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold">{c.title}</h3>
                  <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
                    {c.description}
                  </p>
                  <p className="mt-2 text-xs text-[var(--color-ink-muted)]">
                    {c.resident?.name}
                    {c.resident?.unitLabel ? ` · ${c.resident.unitLabel}` : ''} ·{' '}
                    <span className="capitalize">{c.category}</span> ·{' '}
                    {new Date(c.createdAt).toLocaleString()}
                  </p>
                  {c.resolution && (
                    <p className="mt-2 rounded-md bg-[var(--color-surface)] p-2 text-sm">
                      <span className="font-medium">Resolution:</span> {c.resolution}
                    </p>
                  )}
                </div>
                <StatusBadge status={c.status} />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {['open', 'in-progress', 'resolved', 'closed'].map((s) => (
                  <button
                    key={s}
                    type="button"
                    disabled={c.status === s}
                    onClick={() => onUpdateStatus(c._id, s)}
                    className="rounded-md border border-[var(--color-border)] px-3 py-1 text-xs font-medium capitalize disabled:opacity-40 hover:border-[var(--color-accent)]"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default AdminComplaintsPage;

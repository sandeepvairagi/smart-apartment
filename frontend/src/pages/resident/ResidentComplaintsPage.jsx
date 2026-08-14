import { useEffect, useState } from 'react';
import {
  getMyComplaints,
  raiseComplaint,
} from '../../services/complaintService';
import Spinner from '../../components/Spinner';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';

const categories = [
  'maintenance',
  'noise',
  'security',
  'cleaning',
  'parking',
  'other',
];

function ResidentComplaintsPage() {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'other',
  });

  const load = async (params = {}) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await getMyComplaints(params);
      setItems(data.data.items);
      setPagination(data.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await raiseComplaint(form);
      setForm({ title: '', description: '', category: 'other' });
      setSuccess('Complaint submitted.');
      await load(statusFilter ? { status: statusFilter } : {});
    } catch (err) {
      setError(err.response?.data?.message || 'Could not raise complaint');
    } finally {
      setSubmitting(false);
    }
  };

  const onFilter = (e) => {
    e.preventDefault();
    load(statusFilter ? { status: statusFilter } : {});
  };

  return (
    <section className="space-y-10">
      <div>
        <h1 className="font-display text-3xl font-bold">Complaints</h1>
        <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
          Raise an issue and track resolution from open to closed.
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="max-w-xl space-y-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6"
      >
        <h2 className="text-lg font-semibold">Raise complaint</h2>
        {success && (
          <p className="text-sm text-[var(--color-success)]">{success}</p>
        )}
        {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}

        <label className="block text-sm font-medium">
          Title
          <input
            name="title"
            required
            value={form.title}
            onChange={onChange}
            className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 outline-none focus:border-[var(--color-accent)]"
          />
        </label>

        <label className="block text-sm font-medium">
          Category
          <select
            name="category"
            value={form.category}
            onChange={onChange}
            className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 outline-none focus:border-[var(--color-accent)]"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-medium">
          Description
          <textarea
            name="description"
            required
            rows={4}
            value={form.description}
            onChange={onChange}
            className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 outline-none focus:border-[var(--color-accent)]"
          />
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-[var(--color-accent)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-accent-hover)] disabled:opacity-60"
        >
          {submitting ? 'Submitting...' : 'Submit complaint'}
        </button>
      </form>

      <div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Complaint history</h2>
          <form onSubmit={onFilter} className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-1.5 text-sm"
            >
              <option value="">All statuses</option>
              <option value="open">Open</option>
              <option value="in-progress">In progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
            <button
              type="submit"
              className="rounded-md border border-[var(--color-border)] px-3 py-1.5 text-sm"
            >
              Filter
            </button>
          </form>
        </div>

        {loading ? (
          <Spinner />
        ) : items.length === 0 ? (
          <EmptyState
            title="No complaints yet"
            description="Submitted complaints will show up in this list."
          />
        ) : (
          <>
            <ul className="space-y-3">
              {items.map((c) => (
                <li
                  key={c._id}
                  className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4"
                >
                  <button
                    type="button"
                    className="w-full text-left"
                    onClick={() =>
                      setExpandedId(expandedId === c._id ? null : c._id)
                    }
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-medium">{c.title}</p>
                        <p className="mt-1 text-sm text-[var(--color-ink-muted)] line-clamp-2">
                          {c.description}
                        </p>
                        <p className="mt-2 text-xs capitalize text-[var(--color-ink-muted)]">
                          {c.category} · {new Date(c.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <StatusBadge status={c.status} />
                    </div>
                  </button>
                  {expandedId === c._id && (
                    <div className="mt-3 border-t border-[var(--color-border)] pt-3 text-sm">
                      <p className="whitespace-pre-wrap">{c.description}</p>
                      {c.resolution && (
                        <div className="mt-3 rounded-md bg-[var(--color-accent-soft)] p-3">
                          <p className="text-xs font-semibold uppercase text-[var(--color-ink-muted)]">
                            Admin resolution
                          </p>
                          <p className="mt-1">{c.resolution}</p>
                          {c.resolvedAt && (
                            <p className="mt-1 text-xs text-[var(--color-ink-muted)]">
                              Resolved {new Date(c.resolvedAt).toLocaleString()}
                              {c.resolvedBy?.name ? ` by ${c.resolvedBy.name}` : ''}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
            {pagination && pagination.pages > 1 && (
              <p className="mt-4 text-xs text-[var(--color-ink-muted)]">
                Page {pagination.page} of {pagination.pages} · {pagination.total}{' '}
                total
              </p>
            )}
          </>
        )}
      </div>
    </section>
  );
}

export default ResidentComplaintsPage;

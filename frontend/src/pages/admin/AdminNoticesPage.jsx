import { useEffect, useState } from 'react';
import {
  getAllNotices,
  getNoticeStats,
  createNotice,
  updateNotice,
  publishNotice,
  deleteNotice,
} from '../../services/noticeService';
import Spinner from '../../components/Spinner';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';

function AdminNoticesPage() {
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [publishedFilter, setPublishedFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [search, setSearch] = useState('');
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    title: '',
    body: '',
    priority: 'normal',
    publish: true,
  });

  const load = async (params = {}) => {
    setLoading(true);
    setError('');
    try {
      const [listRes, statsRes] = await Promise.all([
        getAllNotices({ limit: 50, ...params }),
        getNoticeStats(),
      ]);
      setItems(listRes.data.data.items);
      setStats(statsRes.data.data.stats);
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
    if (publishedFilter) params.isPublished = publishedFilter;
    if (priorityFilter) params.priority = priorityFilter;
    if (search.trim()) params.search = search.trim();
    load(params);
  };

  const resetForm = () => {
    setForm({ title: '', body: '', priority: 'normal', publish: true });
    setEditId(null);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      if (editId) {
        await updateNotice(editId, {
          title: form.title,
          body: form.body,
          priority: form.priority,
        });
        setMessage('Notice updated');
      } else {
        await createNotice(form);
        setMessage(form.publish ? 'Notice published' : 'Notice saved as draft');
      }
      resetForm();
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    }
  };

  const onEdit = (notice) => {
    setEditId(notice._id);
    setForm({
      title: notice.title,
      body: notice.body,
      priority: notice.priority,
      publish: notice.isPublished,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onPublish = async (id) => {
    setMessage('');
    setError('');
    try {
      await publishNotice(id);
      setMessage('Notice published');
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Publish failed');
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm('Delete this notice?')) return;
    setMessage('');
    setError('');
    try {
      await deleteNotice(id);
      setMessage('Notice deleted');
      if (editId === id) resetForm();
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <section className="space-y-10">
      <div>
        <h1 className="font-display text-3xl font-bold">Notices</h1>
        <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
          Create, publish, and manage community announcements.
        </p>
      </div>

      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Total', value: stats.total },
            { label: 'Published', value: stats.published },
            { label: 'Drafts', value: stats.drafts },
            { label: 'High priority', value: stats.high },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4"
            >
              <p className="text-sm text-[var(--color-ink-muted)]">{label}</p>
              <p className="mt-1 text-2xl font-bold">{value}</p>
            </div>
          ))}
        </div>
      )}

      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">
            {editId ? 'Edit notice' : 'Create notice'}
          </h2>
          {editId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-sm font-medium text-[var(--color-ink-muted)] hover:underline"
            >
              Cancel edit
            </button>
          )}
        </div>
        <label className="block text-sm font-medium">
          Title
          <input
            required
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2"
          />
        </label>
        <label className="block text-sm font-medium">
          Body
          <textarea
            required
            rows={4}
            value={form.body}
            onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))}
            className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2"
          />
        </label>
        <div className="flex flex-wrap gap-4">
          <label className="block text-sm font-medium">
            Priority
            <select
              value={form.priority}
              onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))}
              className="mt-1 block rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2"
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
            </select>
          </label>
          {!editId && (
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={form.publish}
                onChange={(e) => setForm((p) => ({ ...p, publish: e.target.checked }))}
              />
              Publish immediately
            </label>
          )}
        </div>
        <button
          type="submit"
          className="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white"
        >
          {editId ? 'Update notice' : 'Save notice'}
        </button>
      </form>

      <form
        onSubmit={onFilter}
        className="flex flex-wrap items-end gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4"
      >
        <label className="block text-sm font-medium">
          Status
          <select
            value={publishedFilter}
            onChange={(e) => setPublishedFilter(e.target.value)}
            className="mt-1 block rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2"
          >
            <option value="">All</option>
            <option value="true">Published</option>
            <option value="false">Draft</option>
          </select>
        </label>
        <label className="block text-sm font-medium">
          Priority
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
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
            placeholder="Title or body..."
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

      {message && <p className="text-sm text-[var(--color-success)]">{message}</p>}
      {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}

      {loading ? (
        <Spinner />
      ) : items.length === 0 ? (
        <EmptyState title="No notices yet" />
      ) : (
        <ul className="space-y-4">
          {items.map((n) => (
            <li
              key={n._id}
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="text-lg font-semibold">{n.title}</h3>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-[var(--color-ink-muted)]">
                    {n.body}
                  </p>
                  <p className="mt-2 text-xs text-[var(--color-ink-muted)]">
                    {n.createdBy?.name ? `By ${n.createdBy.name} · ` : ''}
                    {n.isPublished && n.publishedAt
                      ? `Published ${new Date(n.publishedAt).toLocaleString()}`
                      : `Created ${new Date(n.createdAt).toLocaleString()}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <StatusBadge status={n.priority} />
                  <StatusBadge status={n.isPublished ? 'published' : 'draft'} />
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-3 text-sm">
                <button
                  type="button"
                  onClick={() => onEdit(n)}
                  className="font-medium text-[var(--color-accent)] hover:underline"
                >
                  Edit
                </button>
                {!n.isPublished && (
                  <button
                    type="button"
                    onClick={() => onPublish(n._id)}
                    className="font-medium text-[var(--color-accent)] hover:underline"
                  >
                    Publish
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onDelete(n._id)}
                  className="font-medium text-[var(--color-danger)] hover:underline"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default AdminNoticesPage;

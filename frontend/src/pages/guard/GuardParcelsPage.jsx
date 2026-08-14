import { useEffect, useState } from 'react';
import {
  addParcel,
  getAllParcels,
  getParcelStats,
  updateParcel,
  notifyParcel,
} from '../../services/parcelService';
import { getResidents } from '../../services/guardService';
import Spinner from '../../components/Spinner';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';

function GuardParcelsPage() {
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    residentId: '',
    courier: '',
    trackingId: '',
    description: 'Parcel',
  });

  const load = async (params = {}) => {
    setLoading(true);
    setError('');
    try {
      const [listRes, statsRes, resRes] = await Promise.all([
        getAllParcels(params),
        getParcelStats(),
        getResidents(),
      ]);
      setItems(listRes.data.data.items);
      setStats(statsRes.data.data.stats);
      setResidents(resRes.data.data.residents);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load parcels');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onAdd = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    setError('');
    try {
      await addParcel(form);
      setMessage('Parcel logged — resident notified');
      setForm({ residentId: '', courier: '', trackingId: '', description: 'Parcel' });
      load(statusFilter ? { status: statusFilter } : {});
    } catch (err) {
      setError(err.response?.data?.message || 'Could not add parcel');
    } finally {
      setSubmitting(false);
    }
  };

  const onFilter = (e) => {
    e.preventDefault();
    const params = {};
    if (statusFilter) params.status = statusFilter;
    if (search.trim()) params.search = search.trim();
    load(params);
  };

  const onNotify = async (id) => {
    try {
      await notifyParcel(id);
      setMessage('Resident notified for pickup');
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Notify failed');
    }
  };

  const onStatus = async (id, status) => {
    try {
      await updateParcel(id, { status });
      setMessage(`Parcel marked ${status}`);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    }
  };

  return (
    <section className="space-y-10">
      <div>
        <h1 className="font-display text-3xl font-bold">Parcels</h1>
        <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
          Log deliveries, notify residents, and mark pickup.
        </p>
      </div>

      {stats && (
        <div className="grid gap-3 sm:grid-cols-5">
          {[
            { label: 'Total', value: stats.total },
            { label: 'Received', value: stats.received },
            { label: 'Notified', value: stats.notified },
            { label: 'Delivered', value: stats.delivered },
            { label: 'Returned', value: stats.returned },
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

      <form
        onSubmit={onAdd}
        className="grid gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6 sm:grid-cols-2"
      >
        <h2 className="sm:col-span-2 text-lg font-semibold">Add parcel</h2>
        <label className="block text-sm font-medium sm:col-span-2">
          Resident
          <select
            required
            value={form.residentId}
            onChange={(e) => setForm((p) => ({ ...p, residentId: e.target.value }))}
            className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2"
          >
            <option value="">Select resident</option>
            {residents.map((r) => (
              <option key={r._id || r.id} value={r._id || r.id}>
                {r.name} {r.unitLabel ? `(${r.unitLabel})` : ''}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium">
          Courier Company
          <input
            value={form.courier}
            onChange={(e) => setForm((p) => ({ ...p, courier: e.target.value }))}
            placeholder="Amazon, Flipkart..."
            className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2"
          />
          <div className="mt-2 flex flex-wrap gap-1">
            {['Amazon', 'Flipkart', 'Swiggy', 'Myntra', 'Zomato', 'BlueDart', 'FedEx', 'DHL'].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setForm((p) => ({ ...p, courier: c }))}
                className={`rounded-full border border-[var(--color-border)] px-2 py-0.5 text-[11px] font-medium transition ${
                  form.courier === c
                    ? 'bg-[var(--color-accent)] text-white border-transparent'
                    : 'bg-[var(--color-surface)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </label>
        <label className="block text-sm font-medium">
          Tracking ID
          <input
            value={form.trackingId}
            onChange={(e) => setForm((p) => ({ ...p, trackingId: e.target.value }))}
            className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2"
          />
        </label>
        <label className="block text-sm font-medium sm:col-span-2">
          Description
          <input
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2"
          />
        </label>
        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {submitting ? 'Saving...' : 'Log parcel'}
          </button>
        </div>
      </form>

      {message && <p className="text-sm text-[var(--color-success)]">{message}</p>}
      {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}

      <form onSubmit={onFilter} className="flex flex-wrap gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search courier or tracking..."
          className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-2 text-sm"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          <option value="received">Received</option>
          <option value="notified">Notified</option>
          <option value="delivered">Delivered</option>
          <option value="returned">Returned</option>
        </select>
        <button type="submit" className="rounded-md border border-[var(--color-border)] px-4 py-2 text-sm">
          Filter
        </button>
      </form>

      {loading ? (
        <Spinner />
      ) : items.length === 0 ? (
        <EmptyState title="No parcels" description="Log a delivery above." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[var(--color-border)]">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[var(--color-surface-elevated)] text-[var(--color-ink-muted)]">
              <tr>
                <th className="px-4 py-3 font-medium">Resident</th>
                <th className="px-4 py-3 font-medium">Courier</th>
                <th className="px-4 py-3 font-medium">Tracking</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr
                  key={p._id}
                  className="border-t border-[var(--color-border)] bg-[var(--color-surface-elevated)]"
                >
                  <td className="px-4 py-3">
                    {p.resident?.name}
                    {p.resident?.unitLabel ? ` (${p.resident.unitLabel})` : ''}
                  </td>
                  <td className="px-4 py-3">{p.courier}</td>
                  <td className="px-4 py-3">{p.trackingId || '—'}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {p.status === 'received' && (
                        <button
                          type="button"
                          onClick={() => onNotify(p._id)}
                          className="text-xs font-medium text-[var(--color-accent)] hover:underline"
                        >
                          Notify
                        </button>
                      )}
                      {p.status !== 'delivered' && p.status !== 'returned' && (
                        <button
                          type="button"
                          onClick={() => onStatus(p._id, 'delivered')}
                          className="text-xs font-medium hover:underline"
                        >
                          Delivered
                        </button>
                      )}
                      {p.status !== 'returned' && p.status !== 'delivered' && (
                        <button
                          type="button"
                          onClick={() => onStatus(p._id, 'returned')}
                          className="text-xs text-[var(--color-danger)] hover:underline"
                        >
                          Return
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default GuardParcelsPage;

import { useEffect, useState } from 'react';
import {
  getAllParcels,
  getParcelStats,
  updateParcel,
} from '../../services/parcelService';
import Spinner from '../../components/Spinner';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';

function AdminParcelsPage() {
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const load = async (params = {}) => {
    setLoading(true);
    setError('');
    try {
      const [listRes, statsRes] = await Promise.all([
        getAllParcels(params),
        getParcelStats(),
      ]);
      setItems(listRes.data.data.items);
      setStats(statsRes.data.data.stats);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load parcel records');
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
    if (statusFilter) params.status = statusFilter;
    if (search.trim()) params.search = search.trim();
    load(params);
  };

  const onStatusChange = async (id, status) => {
    setMessage('');
    setError('');
    try {
      await updateParcel(id, { status });
      setMessage(`Parcel status updated to ${status}`);
      load(statusFilter || search ? { status: statusFilter, search: search.trim() } : {});
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    }
  };

  return (
    <section className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold">Couriers & Parcels</h1>
        <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
          Oversee all resident courier deliveries, gate arrivals, and pickup confirmations.
        </p>
      </div>

      {stats && (
        <div className="grid gap-3 sm:grid-cols-5">
          {[
            { label: 'Total', value: stats.total, color: 'border-[var(--color-border)]' },
            { label: 'Received', value: stats.received, color: 'border-yellow-500/30' },
            { label: 'Notified', value: stats.notified, color: 'border-blue-500/30' },
            { label: 'Delivered', value: stats.delivered, color: 'border-emerald-500/30' },
            { label: 'Returned', value: stats.returned, color: 'border-rose-500/30' },
          ].map((s) => (
            <div
              key={s.label}
              className={`rounded-xl border ${s.color} bg-[var(--color-surface-elevated)] p-4 text-center shadow-sm`}
            >
              <p className="text-xs text-[var(--color-ink-muted)] font-medium">{s.label}</p>
              <p className="text-2xl font-bold mt-1 text-[var(--color-ink)]">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {message && <p className="text-sm font-medium text-[var(--color-success)]">{message}</p>}
      {error && <p className="text-sm font-medium text-[var(--color-danger)]">{error}</p>}

      <form onSubmit={onFilter} className="flex flex-wrap items-center gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by resident name, unit, courier, tracking ID..."
          className="flex-1 min-w-[240px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3.5 py-2 text-sm focus:outline-none focus:border-[var(--color-accent)]"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3.5 py-2 text-sm"
        >
          <option value="">All Statuses</option>
          <option value="received">Received</option>
          <option value="notified">Notified for pickup</option>
          <option value="delivered">Delivered / Picked up</option>
          <option value="returned">Returned to courier</option>
        </select>
        <button
          type="submit"
          className="rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--color-accent-hover)] transition"
        >
          Filter
        </button>
      </form>

      {loading ? (
        <Spinner />
      ) : items.length === 0 ? (
        <EmptyState
          title="No courier records found"
          description="Deliveries logged by guards will appear here."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[var(--color-border)] shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[var(--color-surface-elevated)] text-[var(--color-ink-muted)]">
              <tr>
                <th className="px-4 py-3 font-semibold">Resident</th>
                <th className="px-4 py-3 font-semibold">Courier</th>
                <th className="px-4 py-3 font-semibold">Tracking ID</th>
                <th className="px-4 py-3 font-semibold">Logged By</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Date Received</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {items.map((p) => (
                <tr
                  key={p._id}
                  className="bg-[var(--color-surface-elevated)] hover:bg-[var(--color-surface)] transition"
                >
                  <td className="px-4 py-3 font-medium text-[var(--color-ink)]">
                    {p.resident?.name || 'Unknown'}
                    {p.resident?.unitLabel && (
                      <span className="ml-1 text-xs text-[var(--color-ink-muted)]">
                        ({p.resident.unitLabel})
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-semibold text-[var(--color-accent)]">
                    {p.courier}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {p.trackingId || '—'}
                  </td>
                  <td className="px-4 py-3 text-[var(--color-ink-muted)] text-xs">
                    {p.receivedBy?.name || 'Guard'}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--color-ink-muted)]">
                    {new Date(p.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <div className="flex gap-2">
                      {p.status !== 'delivered' && (
                        <button
                          type="button"
                          onClick={() => onStatusChange(p._id, 'delivered')}
                          className="font-semibold text-emerald-600 hover:underline"
                        >
                          Mark Delivered
                        </button>
                      )}
                      {p.status !== 'returned' && p.status !== 'delivered' && (
                        <button
                          type="button"
                          onClick={() => onStatusChange(p._id, 'returned')}
                          className="font-semibold text-rose-600 hover:underline"
                        >
                          Mark Returned
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

export default AdminParcelsPage;

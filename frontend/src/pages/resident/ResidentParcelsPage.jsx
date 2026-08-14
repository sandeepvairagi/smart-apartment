import { useEffect, useState } from 'react';
import { getMyParcels, collectParcel } from '../../services/parcelService';
import Spinner from '../../components/Spinner';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';

function ResidentParcelsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [collectingId, setCollectingId] = useState(null);

  const load = async (params = {}) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await getMyParcels(params);
      setItems(data.data.items);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load parcels');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onFilter = (e) => {
    e.preventDefault();
    load(statusFilter ? { status: statusFilter } : {});
  };

  const onCollect = async (id) => {
    setCollectingId(id);
    setMessage('');
    setError('');
    try {
      await collectParcel(id);
      setMessage('Collection confirmed! Thank you.');
      load(statusFilter ? { status: statusFilter } : {});
    } catch (err) {
      setError(err.response?.data?.message || 'Collection confirmation failed');
    } finally {
      setCollectingId(null);
    }
  };

  return (
    <section>
      <h1 className="font-display text-3xl font-bold">Couriers & Parcels</h1>
      <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
        Deliveries received at the gate — you will get notified when one arrives.
      </p>

      {message && <p className="mt-4 text-sm font-medium text-[var(--color-success)]">{message}</p>}
      {error && <p className="mt-4 text-sm font-medium text-[var(--color-danger)]">{error}</p>}

      <form onSubmit={onFilter} className="mt-6 flex gap-2">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          <option value="received">Received</option>
          <option value="notified">Ready for pickup</option>
          <option value="delivered">Delivered / Picked up</option>
          <option value="returned">Returned</option>
        </select>
        <button
          type="submit"
          className="rounded-md border border-[var(--color-border)] px-4 py-2 text-sm"
        >
          Filter
        </button>
      </form>

      {loading ? (
        <Spinner />
      ) : items.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="No parcels logged"
            description="When a guard logs a parcel for you, it will show up here."
          />
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-[var(--color-border)]">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[var(--color-surface-elevated)] text-[var(--color-ink-muted)]">
              <tr>
                <th className="px-4 py-3 font-medium">Courier Company</th>
                <th className="px-4 py-3 font-medium">Tracking ID</th>
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Received Date</th>
                <th className="px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr
                  key={p._id}
                  className="border-t border-[var(--color-border)] bg-[var(--color-surface-elevated)]"
                >
                  <td className="px-4 py-3 font-bold text-[var(--color-accent)]">{p.courier}</td>
                  <td className="px-4 py-3 font-mono text-xs">{p.trackingId || '—'}</td>
                  <td className="px-4 py-3">{p.description}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="px-4 py-3 text-[var(--color-ink-muted)] text-xs">
                    {new Date(p.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {(p.status === 'received' || p.status === 'notified') ? (
                      <button
                        type="button"
                        disabled={collectingId === p._id}
                        onClick={() => onCollect(p._id)}
                        className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition"
                      >
                        {collectingId === p._id ? 'Saving...' : 'Confirm Pickup'}
                      </button>
                    ) : p.status === 'delivered' ? (
                      <span className="text-[var(--color-success)] font-medium">✓ Picked Up</span>
                    ) : (
                      <span className="text-[var(--color-ink-muted)]">Closed</span>
                    )}
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

export default ResidentParcelsPage;

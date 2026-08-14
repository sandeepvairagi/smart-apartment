import { useEffect, useState } from 'react';
import {
  getVisitors,
  checkInVisitor,
  checkOutVisitor,
} from '../../services/guardService';
import { regenerateQrPass } from '../../services/qrService';
import QrPassCard from '../../components/QrPassCard';
import Spinner from '../../components/Spinner';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';

function GuardHistoryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [expandedQr, setExpandedQr] = useState(null);
  const [actionMsg, setActionMsg] = useState('');

  const load = async (params = {}) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await getVisitors(params);
      setItems(data.data.items);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load history');
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
    if (search.trim()) params.search = search.trim();
    if (status) params.status = status;
    load(params);
  };

  const handleCheckIn = async (id) => {
    try {
      await checkInVisitor(id);
      setActionMsg('Checked in');
      load();
    } catch (err) {
      setActionMsg(err.response?.data?.message || 'Check-in failed');
    }
  };

  const handleCheckOut = async (id) => {
    try {
      await checkOutVisitor(id);
      setActionMsg('Checked out');
      load();
    } catch (err) {
      setActionMsg(err.response?.data?.message || 'Check-out failed');
    }
  };

  const handleRegenerate = async (id) => {
    try {
      const { data } = await regenerateQrPass(id);
      setExpandedQr({ ...data.data.visitor, qrPayload: data.data.qrPayload });
      setActionMsg('QR regenerated');
      load();
    } catch (err) {
      setActionMsg(err.response?.data?.message || 'Could not regenerate QR');
    }
  };

  return (
    <section>
      <h1 className="font-display text-3xl font-bold">Visitor history</h1>
      <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
        Search, filter, and manage all gate entries.
      </p>

      <form onSubmit={onFilter} className="mt-6 flex flex-wrap gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name or phone..."
          className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="checked-in">Checked in</option>
          <option value="checked-out">Checked out</option>
        </select>
        <button
          type="submit"
          className="rounded-md border border-[var(--color-border)] px-4 py-2 text-sm font-medium hover:border-[var(--color-accent)]"
        >
          Filter
        </button>
      </form>

      {actionMsg && (
        <p className="mt-4 text-sm text-[var(--color-success)]">{actionMsg}</p>
      )}

      {loading ? (
        <Spinner />
      ) : error ? (
        <p className="mt-6 text-[var(--color-danger)]">{error}</p>
      ) : items.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="No visitors found"
            description="Register a visitor from Add Visitor to see them here."
          />
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-[var(--color-border)]">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[var(--color-surface-elevated)] text-[var(--color-ink-muted)]">
              <tr>
                <th className="px-4 py-3 font-medium">Visitor</th>
                <th className="px-4 py-3 font-medium">Resident</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Time</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((v) => (
                <tr
                  key={v._id}
                  className="border-t border-[var(--color-border)] bg-[var(--color-surface-elevated)]"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium">{v.name}</p>
                    <p className="text-xs text-[var(--color-ink-muted)]">{v.phone}</p>
                  </td>
                  <td className="px-4 py-3">
                    {v.resident?.name}
                    {v.resident?.unitLabel ? ` (${v.resident.unitLabel})` : ''}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={v.status} />
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--color-ink-muted)]">
                    {new Date(v.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {v.status === 'pending' && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleCheckIn(v._id)}
                            className="text-xs font-medium text-[var(--color-accent)] hover:underline"
                          >
                            Check in
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRegenerate(v._id)}
                            className="text-xs font-medium hover:underline"
                          >
                            QR
                          </button>
                        </>
                      )}
                      {v.status === 'checked-in' && (
                        <button
                          type="button"
                          onClick={() => handleCheckOut(v._id)}
                          className="text-xs font-medium hover:underline"
                        >
                          Check out
                        </button>
                      )}
                      {v.qrCode && (
                        <button
                          type="button"
                          onClick={() => setExpandedQr(v)}
                          className="text-xs font-medium hover:underline"
                        >
                          View QR
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

      {expandedQr?.qrCode && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setExpandedQr(null)}
          role="presentation"
        >
          <div
            className="max-w-sm rounded-xl bg-[var(--color-surface-elevated)] p-2"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
          >
            <QrPassCard
              visitor={expandedQr}
              qrCode={expandedQr.qrCode}
              qrPayload={expandedQr.qrPayload}
            />
            <button
              type="button"
              onClick={() => setExpandedQr(null)}
              className="mt-2 w-full py-2 text-sm text-[var(--color-accent)]"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

export default GuardHistoryPage;

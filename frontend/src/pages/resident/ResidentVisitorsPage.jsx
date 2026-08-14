import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyVisitors } from '../../services/residentService';
import { preRegisterGuest } from '../../services/visitorService';
import { getQrPass, regenerateQrPass } from '../../services/qrService';
import QrPassCard from '../../components/QrPassCard';
import Spinner from '../../components/Spinner';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';

function ResidentVisitorsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [createdQr, setCreatedQr] = useState(null);
  const [expandedQr, setExpandedQr] = useState(null);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    purpose: 'Personal visit',
    expectedDate: new Date().toISOString().slice(0, 10),
  });

  const load = async (q = '') => {
    setLoading(true);
    setError('');
    try {
      const { data } = await getMyVisitors(q ? { search: q } : undefined);
      setItems(data.data.items);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load visitors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onSearch = (e) => {
    e.preventDefault();
    load(search.trim());
  };

  const onPreRegister = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setMessage('');
    setCreatedQr(null);
    try {
      const { data } = await preRegisterGuest(form);
      setMessage('Guest pre-registered with QR pass');
      setCreatedQr(data.data);
      setForm({
        name: '',
        phone: '',
        purpose: 'Personal visit',
        expectedDate: new Date().toISOString().slice(0, 10),
      });
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Pre-registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  const onViewQr = async (visitorId) => {
    setError('');
    try {
      const { data } = await getQrPass(visitorId);
      setExpandedQr({
        visitor: data.data.visitor,
        qrCode: data.data.qrCode,
        qrPayload: data.data.qrPayload,
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load QR pass');
    }
  };

  const onRegenerateQr = async (visitorId) => {
    setError('');
    setMessage('');
    try {
      const { data } = await regenerateQrPass(visitorId);
      setExpandedQr({
        visitor: data.data.visitor,
        qrCode: data.data.visitor.qrCode,
        qrPayload: data.data.qrPayload,
      });
      setMessage('QR pass regenerated');
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not regenerate QR');
    }
  };

  return (
    <section>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">My visitors</h1>
          <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
            Guests registered by you, the guard, or via the public visitor portal.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--color-accent-hover)]"
        >
          {showForm ? 'Cancel' : 'Pre-register guest'}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={onPreRegister}
          className="mt-6 space-y-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6"
        >
          <h2 className="text-lg font-semibold">Pre-register expected guest</h2>
          <label className="block text-sm font-medium">
            Guest name
            <input
              required
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2"
            />
          </label>
          <label className="block text-sm font-medium">
            Guest phone
            <input
              required
              value={form.phone}
              onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
              className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2"
            />
          </label>
          <label className="block text-sm font-medium">
            Purpose
            <input
              value={form.purpose}
              onChange={(e) => setForm((p) => ({ ...p, purpose: e.target.value }))}
              className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2"
            />
          </label>
          <label className="block text-sm font-medium">
            Expected date
            <input
              type="date"
              value={form.expectedDate}
              onChange={(e) => setForm((p) => ({ ...p, expectedDate: e.target.value }))}
              className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2"
            />
          </label>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {submitting ? 'Creating QR...' : 'Generate QR pass'}
          </button>
        </form>
      )}

      {message && <p className="mt-4 text-sm text-[var(--color-success)]">{message}</p>}
      {error && <p className="mt-4 text-sm text-[var(--color-danger)]">{error}</p>}

      {createdQr?.visitor?.qrCode && (
        <div className="mt-4">
          <QrPassCard
            visitor={createdQr.visitor}
            qrCode={createdQr.visitor.qrCode}
            qrPayload={createdQr.qrPayload}
          />
        </div>
      )}

      <form onSubmit={onSearch} className="mt-6 flex gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name..."
          className="w-full max-w-xs rounded-md border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
        />
        <button
          type="submit"
          className="rounded-md border border-[var(--color-border)] px-4 py-2 text-sm font-medium hover:border-[var(--color-accent)]"
        >
          Search
        </button>
      </form>

      <p className="mt-4 text-xs text-[var(--color-ink-muted)]">
        Guests can also self-register at{' '}
        <Link to="/visitor/register" className="text-[var(--color-accent)] hover:underline">
          /visitor/register
        </Link>
      </p>

      {loading ? (
        <Spinner />
      ) : !error && items.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="No visitors yet"
            description="Pre-register a guest or ask them to use the visitor portal."
          />
        </div>
      ) : (
        !error && (
          <div className="mt-6 overflow-x-auto rounded-xl border border-[var(--color-border)]">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[var(--color-surface-elevated)] text-[var(--color-ink-muted)]">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Phone</th>
                  <th className="px-4 py-3 font-medium">Purpose</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">QR</th>
                </tr>
              </thead>
              <tbody>
                {items.map((v) => (
                  <tr
                    key={v._id}
                    className="border-t border-[var(--color-border)] bg-[var(--color-surface-elevated)]"
                  >
                    <td className="px-4 py-3 font-medium">{v.name}</td>
                    <td className="px-4 py-3">{v.phone}</td>
                    <td className="px-4 py-3">{v.purpose}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={v.status} />
                    </td>
                    <td className="px-4 py-3 text-[var(--color-ink-muted)]">
                      {new Date(v.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      {v.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => onViewQr(v._id)}
                            className="text-xs font-medium text-[var(--color-accent)] hover:underline"
                          >
                            View
                          </button>
                          <button
                            type="button"
                            onClick={() => onRegenerateQr(v._id)}
                            className="text-xs font-medium hover:underline"
                          >
                            Regenerate
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
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
              visitor={expandedQr.visitor}
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

export default ResidentVisitorsPage;

import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getVisitorStatus } from '../../services/visitorService';
import QrPassCard from '../../components/QrPassCard';
import Spinner from '../../components/Spinner';
import StatusBadge from '../../components/StatusBadge';

function VisitorStatusPage() {
  const [searchParams] = useSearchParams();
  const [visitId, setVisitId] = useState(searchParams.get('id') || '');
  const [phone, setPhone] = useState('');
  const [visitor, setVisitor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setVisitor(null);
    setLoading(true);
    try {
      const { data } = await getVisitorStatus(visitId.trim(), phone.trim());
      setVisitor(data.data.visitor);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not fetch status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-lg pt-6">
      <h1 className="font-display text-3xl font-bold">Visitor status</h1>
      <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
        Enter your visit ID and phone number to track entry status.
      </p>

      <form
        onSubmit={onSubmit}
        className="mt-8 space-y-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6"
      >
        <label className="block text-sm font-medium">
          Visit ID
          <input
            required
            value={visitId}
            onChange={(e) => setVisitId(e.target.value)}
            placeholder="From registration confirmation"
            className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 font-mono text-sm"
          />
        </label>
        <label className="block text-sm font-medium">
          Phone number
          <input
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-[var(--color-accent)] py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? 'Checking...' : 'Check status'}
        </button>
      </form>

      {loading && <Spinner />}
      {error && <p className="mt-4 text-sm text-[var(--color-danger)]">{error}</p>}

      {visitor && (
        <div className="mt-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="text-xl font-semibold">{visitor.name}</h2>
              <p className="text-sm text-[var(--color-ink-muted)]">
                Visiting {visitor.resident?.name}
                {visitor.resident?.unitLabel ? ` · ${visitor.resident.unitLabel}` : ''}
              </p>
            </div>
            <StatusBadge status={visitor.status} />
          </div>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-[var(--color-ink-muted)]">Purpose</dt>
              <dd>{visitor.purpose}</dd>
            </div>
            {visitor.checkInAt && (
              <div className="flex justify-between">
                <dt className="text-[var(--color-ink-muted)]">Checked in</dt>
                <dd>{new Date(visitor.checkInAt).toLocaleString()}</dd>
              </div>
            )}
            {visitor.checkOutAt && (
              <div className="flex justify-between">
                <dt className="text-[var(--color-ink-muted)]">Checked out</dt>
                <dd>{new Date(visitor.checkOutAt).toLocaleString()}</dd>
              </div>
            )}
          </dl>
          {visitor.qrCode && (
            <div className="mt-4">
              <QrPassCard
                visitor={visitor}
                qrCode={visitor.qrCode}
                compact
              />
            </div>
          )}
        </div>
      )}

      <p className="mt-6 text-center text-sm">
        <Link to="/visitor/history" className="text-[var(--color-accent)] hover:underline">
          View full visit history →
        </Link>
      </p>
    </section>
  );
}

export default VisitorStatusPage;

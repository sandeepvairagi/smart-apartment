import { useState } from 'react';
import { Link } from 'react-router-dom';
import { verifyQrPass } from '../../services/qrService';
import Spinner from '../../components/Spinner';
import StatusBadge from '../../components/StatusBadge';

function VisitorVerifyPage() {
  const [qrData, setQrData] = useState('');
  const [visitor, setVisitor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const onVerify = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setVisitor(null);
    setLoading(true);
    try {
      const { data } = await verifyQrPass({ qrData: qrData.trim() });
      setVisitor(data.data.visitor);
      setMessage(data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-lg pt-6">
      <h1 className="font-display text-3xl font-bold">Verify QR pass</h1>
      <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
        Paste the QR payload to confirm a visit pass is valid (read-only).
      </p>

      <form
        onSubmit={onVerify}
        className="mt-8 space-y-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6"
      >
        <label className="block text-sm font-medium">
          QR payload
          <textarea
            required
            rows={4}
            value={qrData}
            onChange={(e) => setQrData(e.target.value)}
            placeholder='{"visitorId":"...","qrToken":"..."}'
            className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 font-mono text-xs"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-[var(--color-accent)] py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? 'Verifying...' : 'Verify QR'}
        </button>
      </form>

      {loading && <Spinner />}
      {error && <p className="mt-4 text-sm text-[var(--color-danger)]">{error}</p>}
      {message && <p className="mt-4 text-sm text-[var(--color-success)]">{message}</p>}

      {visitor && (
        <div className="mt-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold">{visitor.name}</h2>
              <p className="text-sm text-[var(--color-ink-muted)]">
                → {visitor.resident?.name}
                {visitor.resident?.unitLabel ? ` (${visitor.resident.unitLabel})` : ''}
              </p>
            </div>
            <StatusBadge status={visitor.status} />
          </div>
          <p className="mt-2 text-sm">Purpose: {visitor.purpose}</p>
          {visitor.expired && (
            <p className="mt-2 text-sm text-[var(--color-danger)]">Pass expired for visit date</p>
          )}
          {visitor.canCheckIn && (
            <p className="mt-2 text-sm text-[var(--color-success)]">Ready for gate check-in</p>
          )}
        </div>
      )}

      <p className="mt-6 text-center text-sm text-[var(--color-ink-muted)]">
        Guards use the gate scanner for check-in/out.{' '}
        <Link to="/login" className="text-[var(--color-accent)] hover:underline">
          Guard login
        </Link>
      </p>
    </section>
  );
}

export default VisitorVerifyPage;

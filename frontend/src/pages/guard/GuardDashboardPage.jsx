import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getGuardDashboard } from '../../services/guardService';
import { getQrStats } from '../../services/qrService';
import Spinner from '../../components/Spinner';
import StatusBadge from '../../components/StatusBadge';

function GuardDashboardPage() {
  const [data, setData] = useState(null);
  const [qrStats, setQrStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [dashRes, qrRes] = await Promise.all([
          getGuardDashboard(),
          getQrStats(),
        ]);
        setData(dashRes.data.data);
        setQrStats(qrRes.data.data.stats);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <Spinner label="Loading gate dashboard..." />;
  if (error) return <p className="text-[var(--color-danger)]">{error}</p>;

  const cards = [
    { label: 'Today total', value: data.stats.todayTotal },
    { label: 'Currently inside', value: data.stats.checkedIn },
    { label: 'Pending entry', value: data.stats.pending },
    { label: 'Checked out today', value: data.stats.checkedOutToday },
  ];

  return (
    <section>
      <h1 className="font-display text-3xl font-bold">Gate dashboard</h1>
      <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
        Monitor visitor flow at the entrance.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-5"
          >
            <p className="text-sm text-[var(--color-ink-muted)]">{c.label}</p>
            <p className="mt-2 text-3xl font-semibold">{c.value}</p>
          </div>
        ))}
      </div>

      {qrStats && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Active QR passes', value: qrStats.pendingPasses },
            { label: 'Scanned today', value: qrStats.scannedToday },
            { label: 'Check-ins today', value: qrStats.checkedInToday },
            { label: 'Expired today', value: qrStats.expiredToday },
          ].map((c) => (
            <div
              key={c.label}
              className="rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4"
            >
              <p className="text-xs text-[var(--color-ink-muted)]">{c.label}</p>
              <p className="mt-1 text-2xl font-semibold">{c.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          to="/guard/add-visitor"
          className="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--color-accent-hover)]"
        >
          Add visitor
        </Link>
        <Link
          to="/guard/scan"
          className="rounded-md border border-[var(--color-border)] px-4 py-2 text-sm font-semibold hover:border-[var(--color-accent)]"
        >
          Scan QR
        </Link>
      </div>

      <div className="mt-10">
        <h2 className="mb-4 text-lg font-semibold">Today&apos;s recent visitors</h2>
        {data.recent?.length ? (
          <ul className="space-y-3">
            {data.recent.map((v) => (
              <li
                key={v._id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-4 py-3"
              >
                <div>
                  <p className="font-medium">{v.name}</p>
                  <p className="text-sm text-[var(--color-ink-muted)]">
                    Visiting {v.resident?.name}
                    {v.resident?.unitLabel ? ` · ${v.resident.unitLabel}` : ''}
                  </p>
                </div>
                <StatusBadge status={v.status} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-[var(--color-ink-muted)]">No visitors registered today.</p>
        )}
      </div>
    </section>
  );
}

export default GuardDashboardPage;

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminDashboard } from '../../services/adminService';
import Spinner from '../../components/Spinner';
import StatusBadge from '../../components/StatusBadge';

function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getAdminDashboard();
        setData(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <Spinner label="Loading admin dashboard..." />;
  if (error) return <p className="text-[var(--color-danger)]">{error}</p>;

  const cards = [
    { label: 'Residents', value: data.stats.residents, to: '/admin/users?role=resident' },
    { label: 'Guards', value: data.stats.guards, to: '/admin/users?role=guard' },
    { label: 'Apartments', value: data.stats.apartments, to: '/admin/apartments' },
    { label: 'Occupied units', value: data.stats.occupied, to: '/admin/apartments' },
    { label: 'Open complaints', value: data.stats.openComplaints, to: '/admin/complaints' },
    { label: 'Visitors today', value: data.stats.visitorsToday, to: '/admin/analytics' },
    { label: 'Published notices', value: data.stats.publishedNotices, to: '/admin/notices' },
    { label: 'Pending parcels', value: data.stats.pendingParcels, to: '/admin/dashboard' },
  ];

  return (
    <section>
      <h1 className="font-display text-3xl font-bold">Admin dashboard</h1>
      <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
        Overview of people, units, and building activity.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            to={c.to}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-5 transition hover:border-[var(--color-accent)]"
          >
            <p className="text-sm text-[var(--color-ink-muted)]">{c.label}</p>
            <p className="mt-2 text-3xl font-semibold">{c.value}</p>
          </Link>
        ))}
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="mb-4 text-lg font-semibold">Recent complaints</h2>
          {data.recentComplaints?.length ? (
            <ul className="space-y-3">
              {data.recentComplaints.map((c) => (
                <li
                  key={c._id}
                  className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-4 py-3"
                >
                  <div className="flex justify-between gap-2">
                    <div>
                      <p className="font-medium">{c.title}</p>
                      <p className="text-xs text-[var(--color-ink-muted)]">
                        {c.resident?.name}
                      </p>
                    </div>
                    <StatusBadge status={c.status} />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[var(--color-ink-muted)]">No complaints yet.</p>
          )}
        </div>

        <div>
          <h2 className="mb-4 text-lg font-semibold">Recent visitors</h2>
          {data.recentVisitors?.length ? (
            <ul className="space-y-3">
              {data.recentVisitors.map((v) => (
                <li
                  key={v._id}
                  className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-4 py-3"
                >
                  <div className="flex justify-between gap-2">
                    <div>
                      <p className="font-medium">{v.name}</p>
                      <p className="text-xs text-[var(--color-ink-muted)]">
                        → {v.resident?.name}
                      </p>
                    </div>
                    <StatusBadge status={v.status} />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[var(--color-ink-muted)]">No visitors yet.</p>
          )}
        </div>
      </div>
    </section>
  );
}

export default AdminDashboardPage;

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getResidentDashboard } from '../../services/residentService';
import Spinner from '../../components/Spinner';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';

function ResidentDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getResidentDashboard();
        setData(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <Spinner label="Loading dashboard..." />;
  if (error) {
    return <p className="text-[var(--color-danger)]">{error}</p>;
  }

  const cards = [
    {
      label: 'Visitors',
      value: data.stats.visitors,
      to: '/resident/visitors',
    },
    {
      label: 'Open complaints',
      value: data.stats.openComplaints,
      to: '/resident/complaints',
    },
    {
      label: 'Pending parcels',
      value: data.stats.pendingParcels,
      to: '/resident/parcels',
    },
    {
      label: 'Unread alerts',
      value: data.stats.unreadNotifications,
      to: '/resident/notifications',
    },
  ];

  return (
    <section>
      <h1 className="font-display text-3xl font-bold text-[var(--color-ink)]">
        Welcome, {user?.name?.split(' ')[0]}
      </h1>
      <p className="mt-1 text-[var(--color-ink-muted)]">
        Your resident hub for visitors, parcels, complaints, and notices.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            to={card.to}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-5 transition hover:border-[var(--color-accent)]"
          >
            <p className="text-sm text-[var(--color-ink-muted)]">{card.label}</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--color-ink)]">
              {card.value}
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent notices</h2>
          <Link
            to="/resident/notices"
            className="text-sm text-[var(--color-accent)] hover:underline"
          >
            View all
          </Link>
        </div>

        {data.recentNotices?.length ? (
          <ul className="space-y-3">
            {data.recentNotices.map((notice) => (
              <li
                key={notice._id}
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-4 py-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium">{notice.title}</p>
                  <StatusBadge status={notice.priority} />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-[var(--color-ink-muted)]">
            No published notices yet.
          </p>
        )}
      </div>
    </section>
  );
}

export default ResidentDashboardPage;

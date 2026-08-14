import { useEffect, useState } from 'react';
import { getAnalytics } from '../../services/adminService';
import Spinner from '../../components/Spinner';

function BarList({ title, rows }) {
  const max = Math.max(...rows.map((r) => r.count), 1);
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-5">
      <h2 className="text-lg font-semibold">{title}</h2>
      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-[var(--color-ink-muted)]">No data yet.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {rows.map((row) => (
            <li key={row.label}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="capitalize text-[var(--color-ink-muted)]">{row.label}</span>
                <span className="font-medium">{row.count}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[var(--color-border)]">
                <div
                  className="h-full rounded-full bg-[var(--color-accent)]"
                  style={{ width: `${(row.count / max) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function mapAgg(arr) {
  return (arr || []).map((x) => ({ label: x._id || 'unknown', count: x.count }));
}

function AdminAnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getAnalytics();
        setData(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <Spinner label="Loading analytics..." />;
  if (error) return <p className="text-[var(--color-danger)]">{error}</p>;

  return (
    <section>
      <h1 className="font-display text-3xl font-bold">Analytics</h1>
      <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
        Aggregated insights across users, visitors, and complaints.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <BarList title="Users by role" rows={mapAgg(data.usersByRole)} />
        <BarList title="Visitors by status" rows={mapAgg(data.visitorsByStatus)} />
        <BarList title="Complaints by status" rows={mapAgg(data.complaintsByStatus)} />
        <BarList title="Complaints by category" rows={mapAgg(data.complaintsByCategory)} />
        <BarList
          title="Visitors last 7 days"
          rows={mapAgg(data.visitorsLast7Days)}
        />
      </div>
    </section>
  );
}

export default AdminAnalyticsPage;

import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getMyNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../../services/residentService';
import { useNotifications } from '../../context/NotificationContext';
import Spinner from '../../components/Spinner';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';

function ResidentNotificationsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { unread, connected, lastNotification, refreshUnread, clearUnread, markLocalRead } =
    useNotifications();

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await getMyNotifications({ limit: 50 });
      setItems(data.data.items);
      await refreshUnread();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [refreshUnread]);

  useEffect(() => {
    load();
  }, [load]);

  // Live prepend when Socket.IO delivers a new notification
  useEffect(() => {
    if (!lastNotification?._id) return;
    setItems((prev) => {
      if (prev.some((n) => String(n._id) === String(lastNotification._id))) return prev;
      return [lastNotification, ...prev];
    });
  }, [lastNotification]);

  const onReadOne = async (id) => {
    await markNotificationRead(id);
    markLocalRead(1);
    setItems((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
    );
  };

  const onReadAll = async () => {
    await markAllNotificationsRead();
    clearUnread();
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  if (loading) return <Spinner />;
  if (error) return <p className="text-[var(--color-danger)]">{error}</p>;

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">Notifications</h1>
          <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
            {unread} unread
            {connected ? (
              <span className="ml-2 text-[var(--color-success)]">· Live</span>
            ) : (
              <span className="ml-2">· Offline</span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={load}
            className="rounded-md border border-[var(--color-border)] px-3 py-1.5 text-sm font-medium hover:border-[var(--color-accent)]"
          >
            Refresh
          </button>
          {unread > 0 && (
            <button
              type="button"
              onClick={onReadAll}
              className="rounded-md border border-[var(--color-border)] px-3 py-1.5 text-sm font-medium hover:border-[var(--color-accent)]"
            >
              Mark all read
            </button>
          )}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="You're all caught up"
            description="Alerts about visitors, parcels, and complaints will appear here instantly."
          />
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {items.map((n) => (
            <li
              key={n._id}
              className={`rounded-xl border border-[var(--color-border)] p-4 ${
                n.isRead
                  ? 'bg-[var(--color-surface-elevated)] opacity-80'
                  : 'bg-[var(--color-accent-soft)]'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{n.title}</p>
                    <StatusBadge status={n.type} />
                  </div>
                  <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
                    {n.message}
                  </p>
                  <p className="mt-2 text-xs text-[var(--color-ink-muted)]">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                  {n.link && (
                    <Link
                      to={n.link}
                      className="mt-2 inline-block text-xs font-medium text-[var(--color-accent)] hover:underline"
                    >
                      Open related page →
                    </Link>
                  )}
                </div>
                {!n.isRead && (
                  <button
                    type="button"
                    onClick={() => onReadOne(n._id)}
                    className="text-sm font-medium text-[var(--color-accent)] hover:underline"
                  >
                    Mark read
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default ResidentNotificationsPage;

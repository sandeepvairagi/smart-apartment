import { Link } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';

/**
 * Toast stack — shows live Socket.IO notifications in the corner.
 */
function NotificationToaster() {
  const { toasts, dismissToast } = useNotifications();

  if (!toasts.length) return null;

  return (
    <div
      className="pointer-events-none fixed right-4 bottom-4 z-[100] flex w-full max-w-sm flex-col gap-2"
      aria-live="polite"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4 shadow-lg"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[var(--color-ink)]">{t.title}</p>
              <p className="mt-1 text-sm text-[var(--color-ink-muted)]">{t.message}</p>
              {t.link && (
                <Link
                  to={t.link}
                  onClick={() => dismissToast(t.id)}
                  className="mt-2 inline-block text-xs font-medium text-[var(--color-accent)] hover:underline"
                >
                  Open →
                </Link>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismissToast(t.id)}
              className="shrink-0 text-xs text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default NotificationToaster;

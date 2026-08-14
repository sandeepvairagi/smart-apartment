import { useAuth } from '../context/AuthContext';

/**
 * Temporary shared dashboard — role-specific dashboards come in later modules.
 */
function DashboardPage() {
  const { user } = useAuth();

  return (
    <section>
      <h1 className="font-display text-3xl font-bold text-[var(--color-ink)]">
        Dashboard
      </h1>
      <p className="mt-2 text-[var(--color-ink-muted)]">
        Welcome back, {user?.name}. Your role is{' '}
        <span className="font-semibold capitalize text-[var(--color-accent)]">
          {user?.role}
        </span>
        .
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {['Visitors', 'Parcels', 'Notices'].map((label) => (
          <div
            key={label}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-5"
          >
            <p className="text-sm text-[var(--color-ink-muted)]">{label}</p>
            <p className="mt-2 text-2xl font-semibold">—</p>
            <p className="mt-1 text-xs text-[var(--color-ink-muted)]">
              Module coming soon
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default DashboardPage;

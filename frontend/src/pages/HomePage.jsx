import { Link } from 'react-router-dom';
import { APP_NAME } from '../utils/constants';

function HomePage() {
  return (
    <section className="grid items-center gap-10 py-10 md:grid-cols-2 md:py-16">
      <div>
        <p className="font-display text-4xl font-bold leading-tight text-[var(--color-ink)] md:text-5xl">
          {APP_NAME}
        </p>
        <h1 className="mt-4 text-xl font-medium text-[var(--color-ink-muted)] md:text-2xl">
          Visitors, parcels, and community — managed in one place.
        </h1>
        <p className="mt-4 max-w-md text-[var(--color-ink-muted)]">
          Built for admins, guards, and residents with secure JWT access and
          real-time updates coming next.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/login"
            className="rounded-md bg-[var(--color-accent)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-hover)]"
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-5 py-2.5 text-sm font-semibold text-[var(--color-ink)] transition hover:border-[var(--color-accent)]"
          >
            Create account
          </Link>
          <Link
            to="/visitor/register"
            className="rounded-md border border-[var(--color-accent)] px-5 py-2.5 text-sm font-semibold text-[var(--color-accent)] transition hover:bg-[var(--color-accent-soft)]"
          >
            Visitor portal
          </Link>
        </div>
      </div>

      <div className="space-y-4">
        <div
          className="min-h-48 rounded-2xl bg-gradient-to-br from-[var(--color-accent)] to-[#0a4f52] p-8 text-white shadow-lg"
          aria-hidden="true"
        >
          <p className="text-sm uppercase tracking-widest text-white/70">Roles</p>
          <ul className="mt-6 space-y-3 text-lg font-medium">
            <li>Admin — building control</li>
            <li>Guard — gate & visitors</li>
            <li>Resident — home hub</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-[var(--color-ink-muted)]">
            Visitor portal
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link to="/visitor/register" className="text-[var(--color-accent)] hover:underline">
                Register a visit
              </Link>
            </li>
            <li>
              <Link to="/visitor/status" className="text-[var(--color-accent)] hover:underline">
                Check visit status
              </Link>
            </li>
            <li>
              <Link to="/visitor/verify" className="text-[var(--color-accent)] hover:underline">
                Verify QR pass
              </Link>
            </li>
            <li>
              <Link to="/visitor/history" className="text-[var(--color-accent)] hover:underline">
                Visit history
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}

export default HomePage;

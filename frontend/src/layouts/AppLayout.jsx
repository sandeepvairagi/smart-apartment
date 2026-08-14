import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from './AuthLayout';
import { APP_NAME } from '../utils/constants';

/**
 * AppLayout — authenticated shell (navbar now; sidebar added in module steps)
 */
function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[var(--color-surface)]">
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface-elevated)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <Link
            to="/dashboard"
            className="font-display text-xl font-bold text-[var(--color-ink)]"
          >
            {APP_NAME}
          </Link>

          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-[var(--color-ink-muted)] sm:inline">
              {user?.name} · <span className="capitalize">{user?.role}</span>
            </span>
            <ThemeToggle />
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-md bg-[var(--color-accent)] px-3 py-1.5 text-sm font-medium text-white transition hover:bg-[var(--color-accent-hover)]"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;

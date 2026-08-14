import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { ThemeToggle } from './AuthLayout';
import { APP_NAME } from '../utils/constants';
import AIChatbot from '../components/AIChatbot';

const navItems = [
  { to: '/resident/dashboard', label: 'Dashboard' },
  { to: '/resident/profile', label: 'Profile' },
  { to: '/resident/visitors', label: 'Visitors' },
  { to: '/resident/complaints', label: 'Complaints' },
  { to: '/resident/notices', label: 'Notices' },
  { to: '/resident/parcels', label: 'Parcels' },
  { to: '/resident/notifications', label: 'Notifications', badge: true },
];

/**
 * ResidentLayout — sidebar + top bar for resident pages
 */
function ResidentLayout() {
  const { user, logout } = useAuth();
  const { unread, connected } = useNotifications();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const linkClass = ({ isActive }) =>
    `block rounded-md px-3 py-2 text-sm font-medium transition ${
      isActive
        ? 'bg-[var(--color-accent)] text-white'
        : 'text-[var(--color-ink-muted)] hover:bg-[var(--color-accent-soft)] hover:text-[var(--color-ink)]'
    }`;

  const renderLabel = (item) => (
    <span className="flex items-center justify-between gap-2">
      <span>{item.label}</span>
      {item.badge && unread > 0 && (
        <span className="inline-flex min-w-[1.25rem] items-center justify-center rounded-md bg-[var(--color-danger)] px-1.5 py-0.5 text-[10px] font-bold text-white">
          {unread > 99 ? '99+' : unread}
        </span>
      )}
    </span>
  );

  return (
    <div className="flex min-h-screen bg-[var(--color-surface)]">
      <aside className="hidden w-60 shrink-0 border-r border-[var(--color-border)] bg-[var(--color-surface-elevated)] md:flex md:flex-col">
        <div className="border-b border-[var(--color-border)] px-5 py-5">
          <p className="font-display text-lg font-bold leading-tight text-[var(--color-ink)]">
            {APP_NAME}
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-[var(--color-ink-muted)]">
            Resident
            <span
              className={`inline-block h-1.5 w-1.5 rounded-full ${
                connected ? 'bg-emerald-500' : 'bg-zinc-400'
              }`}
              title={connected ? 'Live updates connected' : 'Connecting...'}
            />
          </p>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={linkClass}
              end={item.to.endsWith('dashboard')}
            >
              {renderLabel(item)}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-4 py-3 sm:px-6">
          <div>
            <p className="text-sm font-semibold text-[var(--color-ink)]">
              {user?.name}
            </p>
            <p className="text-xs text-[var(--color-ink-muted)]">
              {user?.unitLabel || 'No unit set'} · {user?.email}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {unread > 0 && (
              <button
                type="button"
                onClick={() => navigate('/resident/notifications')}
                className="rounded-md border border-[var(--color-border)] px-2.5 py-1.5 text-xs font-medium hover:border-[var(--color-accent)]"
              >
                {unread} new
              </button>
            )}
            <ThemeToggle />
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-md bg-[var(--color-accent)] px-3 py-1.5 text-sm font-medium text-white hover:bg-[var(--color-accent-hover)]"
            >
              Logout
            </button>
          </div>
        </header>

        <nav className="flex gap-1 overflow-x-auto border-b border-[var(--color-border)] px-3 py-2 md:hidden">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={linkClass}
              end={item.to.endsWith('dashboard')}
            >
              {renderLabel(item)}
            </NavLink>
          ))}
        </nav>

        <main className="flex-1 px-4 py-6 sm:px-6">
          <Outlet />
        </main>
      </div>

      <AIChatbot />
    </div>
  );
}

export default ResidentLayout;

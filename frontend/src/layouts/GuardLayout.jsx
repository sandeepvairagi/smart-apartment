import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from './AuthLayout';
import { APP_NAME } from '../utils/constants';
import AIChatbot from '../components/AIChatbot';

const navItems = [
  { to: '/guard/dashboard', label: 'Dashboard' },
  { to: '/guard/add-visitor', label: 'Add Visitor' },
  { to: '/guard/scan', label: 'Scan QR' },
  { to: '/guard/history', label: 'History' },
  { to: '/guard/parcels', label: 'Parcels' },
];

function GuardLayout() {
  const { user, logout } = useAuth();
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

  return (
    <div className="flex min-h-screen bg-[var(--color-surface)]">
      <aside className="hidden w-60 shrink-0 border-r border-[var(--color-border)] bg-[var(--color-surface-elevated)] md:flex md:flex-col">
        <div className="border-b border-[var(--color-border)] px-5 py-5">
          <p className="font-display text-lg font-bold text-[var(--color-ink)]">
            {APP_NAME}
          </p>
          <p className="mt-1 text-xs text-[var(--color-ink-muted)]">Guard Gate</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={linkClass}
              end={item.to.endsWith('dashboard')}
            >
              {item.label}
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
            <p className="text-xs text-[var(--color-ink-muted)]">Security · Gate desk</p>
          </div>
          <div className="flex items-center gap-2">
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
              {item.label}
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

export default GuardLayout;

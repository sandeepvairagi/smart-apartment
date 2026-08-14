import { Link, Outlet } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { APP_NAME } from '../utils/constants';
import AIChatbot from '../components/AIChatbot';

/**
 * ThemeToggle — small reusable button for dark/light mode
 */
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="rounded-md border border-[var(--color-border)] px-3 py-1.5 text-sm text-[var(--color-ink-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
      aria-label="Toggle dark mode"
    >
      {theme === 'dark' ? 'Light' : 'Dark'}
    </button>
  );
}

/**
 * AuthLayout — public pages shell (login, register, home)
 */
function AuthLayout() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--color-surface)]">
      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 20% -10%, var(--color-accent-soft), transparent), radial-gradient(ellipse 60% 40% at 100% 0%, #cfe8e0, transparent)',
        }}
        aria-hidden="true"
      />

      <header className="relative z-10 mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <Link
          to="/"
          className="font-display text-2xl font-bold tracking-tight text-[var(--color-ink)]"
        >
          {APP_NAME}
        </Link>
        <ThemeToggle />
      </header>

      <main className="relative z-10 mx-auto w-full max-w-5xl px-6 pb-16">
        <Outlet />
      </main>

      <AIChatbot />
    </div>
  );
}

export default AuthLayout;

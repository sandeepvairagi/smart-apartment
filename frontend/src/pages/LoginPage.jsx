import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import { getDashboardPath } from '../utils/roleRedirect';

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      navigate(getDashboardPath(data.data.user.role), { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md pt-6">
      <h1 className="font-display text-3xl font-bold text-[var(--color-ink)]">
        Sign in
      </h1>
      <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
        Use your admin, guard, or resident account.
      </p>

      <form
        onSubmit={onSubmit}
        className="mt-8 space-y-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6"
      >
        {error && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-[var(--color-danger)] dark:bg-red-950/40">
            {error}
          </p>
        )}

        <label className="block text-sm font-medium">
          Email
          <input
            type="email"
            name="email"
            required
            value={form.email}
            onChange={onChange}
            className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 outline-none focus:border-[var(--color-accent)]"
            placeholder="admin@apartment.com"
          />
        </label>

        <label className="block text-sm font-medium">
          Password
          <input
            type="password"
            name="password"
            required
            minLength={6}
            value={form.password}
            onChange={onChange}
            className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 outline-none focus:border-[var(--color-accent)]"
            placeholder="••••••••"
          />
        </label>

        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            className="text-sm text-[var(--color-accent)] hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-[var(--color-accent)] py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-hover)] disabled:opacity-60"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>

        {loading && <Spinner label="Authenticating..." />}
      </form>

      <p className="mt-4 text-center text-sm text-[var(--color-ink-muted)]">
        New resident?{' '}
        <Link to="/register" className="font-medium text-[var(--color-accent)]">
          Create an account
        </Link>
      </p>
    </div>
  );
}

export default LoginPage;

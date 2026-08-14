import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { resetPassword } from '../services/authService';
import { getDashboardPath } from '../utils/roleRedirect';

function ResetPasswordPage() {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const { data } = await resetPassword(token, { password });
      setMessage(data.message);

      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));

      setTimeout(() => {
        window.location.href = getDashboardPath(data.data.user.role);
      }, 800);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Reset failed. Link may be expired.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="mx-auto max-w-md pt-6">
        <p className="text-[var(--color-danger)]">Missing reset token.</p>
        <Link to="/forgot-password" className="text-[var(--color-accent)]">
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md pt-6">
      <h1 className="font-display text-3xl font-bold text-[var(--color-ink)]">
        Set new password
      </h1>
      <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
        Choose a new password for your account. This link expires in 10 minutes.
      </p>

      <form
        onSubmit={onSubmit}
        className="mt-8 space-y-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6"
      >
        {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
        {message && (
          <p className="text-sm text-[var(--color-success)]">{message}</p>
        )}

        <label className="block text-sm font-medium">
          New password
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 outline-none focus:border-[var(--color-accent)]"
          />
        </label>

        <label className="block text-sm font-medium">
          Confirm password
          <input
            type="password"
            required
            minLength={6}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 outline-none focus:border-[var(--color-accent)]"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-[var(--color-accent)] py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-accent-hover)] disabled:opacity-60"
        >
          {loading ? 'Saving...' : 'Update password'}
        </button>
      </form>

      <p className="mt-4 text-center text-sm">
        <Link to="/login" className="text-[var(--color-accent)]">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}

export default ResetPasswordPage;

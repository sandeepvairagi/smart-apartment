import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../services/authService';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [devInfo, setDevInfo] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setDevInfo(null);
    setLoading(true);
    try {
      const { data } = await forgotPassword({ email });
      setMessage(data.message);
      if (data.devResetUrl || data.devPreviewUrl) {
        setDevInfo({
          resetUrl: data.devResetUrl,
          previewUrl: data.devPreviewUrl,
          token: data.devResetToken,
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Request failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md pt-6">
      <h1 className="font-display text-3xl font-bold text-[var(--color-ink)]">
        Forgot password
      </h1>
      <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
        Enter your email and we&apos;ll send a reset link (valid for 10 minutes).
      </p>

      <form
        onSubmit={onSubmit}
        className="mt-8 space-y-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6"
      >
        {error && (
          <p className="text-sm text-[var(--color-danger)]">{error}</p>
        )}
        {message && (
          <p className="text-sm text-[var(--color-success)]">{message}</p>
        )}
        {devInfo && (
          <div className="space-y-2 rounded-md bg-[var(--color-accent-soft)] p-3 text-xs text-[var(--color-ink)]">
            <p className="font-semibold">Development helpers</p>
            {devInfo.previewUrl && (
              <p>
                Ethereal inbox:{' '}
                <a
                  href={devInfo.previewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="break-all text-[var(--color-accent)] underline"
                >
                  Open email preview
                </a>
              </p>
            )}
            {devInfo.resetUrl && (
              <p>
                Reset page:{' '}
                <Link
                  to={`/reset-password/${devInfo.token}`}
                  className="break-all text-[var(--color-accent)] underline"
                >
                  Open reset form
                </Link>
              </p>
            )}
          </div>
        )}

        <label className="block text-sm font-medium">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 outline-none focus:border-[var(--color-accent)]"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-[var(--color-accent)] py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-accent-hover)] disabled:opacity-60"
        >
          {loading ? 'Sending...' : 'Send reset link'}
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

export default ForgotPasswordPage;

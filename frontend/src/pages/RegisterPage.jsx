import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDashboardPath } from '../utils/roleRedirect';

function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });
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
      const data = await register(form);
      navigate(getDashboardPath(data.data.user.role), { replace: true });
    } catch (err) {
      const apiErrors = err.response?.data?.errors;
      if (apiErrors?.length) {
        setError(apiErrors.map((x) => x.message).join(', '));
      } else {
        setError(err.response?.data?.message || 'Registration failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md pt-6">
      <h1 className="font-display text-3xl font-bold text-[var(--color-ink)]">
        Create account
      </h1>
      <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
        Public signup creates a <strong>resident</strong> account.
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

        {['name', 'email', 'phone', 'password'].map((field) => (
          <label key={field} className="block text-sm font-medium capitalize">
            {field}
            <input
              type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'}
              name={field}
              required={field !== 'phone'}
              minLength={field === 'password' ? 6 : undefined}
              value={form[field]}
              onChange={onChange}
              className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 outline-none focus:border-[var(--color-accent)]"
            />
          </label>
        ))}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-[var(--color-accent)] py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-hover)] disabled:opacity-60"
        >
          {loading ? 'Creating...' : 'Register'}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-[var(--color-ink-muted)]">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-[var(--color-accent)]">
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default RegisterPage;

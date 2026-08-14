import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updateProfile } from '../../services/residentService';

function ResidentProfilePage() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    unitLabel: user?.unitLabel || '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);
    try {
      const { data } = await updateProfile(form);
      setUser(data.data.user);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      setMessage('Profile updated successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-lg">
      <h1 className="font-display text-3xl font-bold">Update profile</h1>
      <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
        Email and role cannot be changed here.
      </p>

      <form
        onSubmit={onSubmit}
        className="mt-8 space-y-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6"
      >
        {message && (
          <p className="text-sm text-[var(--color-success)]">{message}</p>
        )}
        {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}

        <label className="block text-sm font-medium">
          Email (read-only)
          <input
            type="email"
            value={user?.email || ''}
            disabled
            className="mt-1 w-full cursor-not-allowed rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 opacity-70"
          />
        </label>

        <label className="block text-sm font-medium">
          Name
          <input
            name="name"
            required
            value={form.name}
            onChange={onChange}
            className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 outline-none focus:border-[var(--color-accent)]"
          />
        </label>

        <label className="block text-sm font-medium">
          Phone
          <input
            name="phone"
            value={form.phone}
            onChange={onChange}
            className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 outline-none focus:border-[var(--color-accent)]"
          />
        </label>

        <label className="block text-sm font-medium">
          Unit (e.g. A-101)
          <input
            name="unitLabel"
            value={form.unitLabel}
            onChange={onChange}
            placeholder="A-101"
            className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 outline-none focus:border-[var(--color-accent)]"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-[var(--color-accent)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-accent-hover)] disabled:opacity-60"
        >
          {loading ? 'Saving...' : 'Save changes'}
        </button>
      </form>
    </section>
  );
}

export default ResidentProfilePage;

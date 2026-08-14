import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getVisitorHistory } from '../../services/visitorService';
import Spinner from '../../components/Spinner';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';

function VisitorHistoryPage() {
  const [phone, setPhone] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setSearched(true);
    try {
      const { data } = await getVisitorHistory({ phone: phone.trim() });
      setItems(data.data.items);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load history');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-2xl pt-6">
      <h1 className="font-display text-3xl font-bold">Visit history</h1>
      <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
        Look up all past and upcoming visits registered with your phone number.
      </p>

      <form
        onSubmit={onSubmit}
        className="mt-8 flex gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4"
      >
        <input
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Your phone number"
          className="flex-1 rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          Search
        </button>
      </form>

      {loading ? (
        <Spinner />
      ) : error ? (
        <p className="mt-6 text-[var(--color-danger)]">{error}</p>
      ) : searched && items.length === 0 ? (
        <div className="mt-6">
          <EmptyState title="No visits found" description="Try a different phone number." />
        </div>
      ) : (
        items.length > 0 && (
          <ul className="mt-6 space-y-3">
            {items.map((v) => (
              <li
                key={v._id}
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{v.name}</p>
                    <p className="text-sm text-[var(--color-ink-muted)]">
                      → {v.resident?.name}
                      {v.resident?.unitLabel ? ` · ${v.resident.unitLabel}` : ''}
                    </p>
                    <p className="mt-1 text-xs text-[var(--color-ink-muted)]">
                      {new Date(v.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <StatusBadge status={v.status} />
                </div>
                <Link
                  to={`/visitor/status?id=${v._id}`}
                  className="mt-2 inline-block text-xs text-[var(--color-accent)] hover:underline"
                >
                  Check status (need phone)
                </Link>
              </li>
            ))}
          </ul>
        )
      )}

      <p className="mt-8 text-center text-sm">
        <Link to="/visitor/register" className="text-[var(--color-accent)] hover:underline">
          Register a new visit →
        </Link>
      </p>
    </section>
  );
}

export default VisitorHistoryPage;

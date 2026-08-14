import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { addVisitor, getResidents } from '../../services/guardService';
import QrPassCard from '../../components/QrPassCard';
import Spinner from '../../components/Spinner';

function GuardAddVisitorPage() {
  const [residents, setResidents] = useState([]);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    purpose: 'Personal visit',
    residentId: '',
    expectedDate: new Date().toISOString().slice(0, 10),
  });
  const [search, setSearch] = useState('');
  const [loadingResidents, setLoadingResidents] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [created, setCreated] = useState(null);

  const loadResidents = async (q = '') => {
    setLoadingResidents(true);
    try {
      const { data } = await getResidents(q ? { search: q } : undefined);
      setResidents(data.data.residents);
    } catch {
      setResidents([]);
    } finally {
      setLoadingResidents(false);
    }
  };

  useEffect(() => {
    loadResidents();
  }, []);

  const onChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCreated(null);
    setSubmitting(true);
    try {
      const { data } = await addVisitor(form);
      setCreated(data.data);
      setForm({
        name: '',
        phone: '',
        purpose: 'Personal visit',
        residentId: '',
        expectedDate: new Date().toISOString().slice(0, 10),
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Could not register visitor');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="max-w-2xl">
      <h1 className="font-display text-3xl font-bold">Add visitor</h1>
      <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
        Register a guest and generate a QR pass instantly.
      </p>

      <form
        onSubmit={onSubmit}
        className="mt-8 space-y-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6"
      >
        {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}

        <label className="block text-sm font-medium">
          Visitor name
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
            required
            value={form.phone}
            onChange={onChange}
            className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 outline-none focus:border-[var(--color-accent)]"
          />
        </label>

        <label className="block text-sm font-medium">
          Purpose
          <input
            name="purpose"
            value={form.purpose}
            onChange={onChange}
            className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 outline-none focus:border-[var(--color-accent)]"
          />
        </label>

        <label className="block text-sm font-medium">
          Expected date
          <input
            type="date"
            name="expectedDate"
            value={form.expectedDate}
            onChange={onChange}
            className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 outline-none focus:border-[var(--color-accent)]"
          />
        </label>

        <div>
          <p className="text-sm font-medium">Resident to visit</p>
          <div className="mt-1 flex gap-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, unit..."
              className="w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
            />
            <button
              type="button"
              onClick={() => loadResidents(search.trim())}
              className="shrink-0 rounded-md border border-[var(--color-border)] px-3 py-2 text-sm"
            >
              Search
            </button>
          </div>
          {loadingResidents ? (
            <Spinner label="Loading residents..." />
          ) : (
            <select
              name="residentId"
              required
              value={form.residentId}
              onChange={onChange}
              className="mt-2 w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 outline-none focus:border-[var(--color-accent)]"
            >
              <option value="">Select resident</option>
              {residents.map((r) => (
                <option key={r.id || r._id} value={r.id || r._id}>
                  {r.name} {r.unitLabel ? `(${r.unitLabel})` : ''} — {r.email}
                </option>
              ))}
            </select>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-[var(--color-accent)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-accent-hover)] disabled:opacity-60"
        >
          {submitting ? 'Generating QR...' : 'Register & generate QR'}
        </button>
      </form>

      {created && (
        <div className="mt-8">
          <QrPassCard
            visitor={created.visitor}
            qrCode={created.visitor.qrCode}
            qrPayload={created.qrPayload}
          />
          <Link
            to="/guard/history"
            className="mt-4 inline-block text-sm font-medium text-[var(--color-accent)] hover:underline"
          >
            View in history →
          </Link>
        </div>
      )}
    </section>
  );
}

export default GuardAddVisitorPage;

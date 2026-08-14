import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  registerVisitor,
  getResidentsForRegistration,
} from '../../services/visitorService';
import QrPassCard from '../../components/QrPassCard';

function VisitorRegisterPage() {
  const [residents, setResidents] = useState([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    name: '',
    phone: '',
    purpose: 'Personal visit',
    residentId: '',
    expectedDate: new Date().toISOString().slice(0, 10),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const loadResidents = async (q = '') => {
    try {
      const { data } = await getResidentsForRegistration(q ? { search: q } : undefined);
      setResidents(data.data.residents);
    } catch {
      setResidents([]);
    }
  };

  useEffect(() => {
    loadResidents();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const { data } = await registerVisitor(form);
      setResult(data.data);
      setForm({
        name: '',
        phone: '',
        purpose: 'Personal visit',
        residentId: '',
        expectedDate: new Date().toISOString().slice(0, 10),
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-lg pt-6">
      <h1 className="font-display text-3xl font-bold">Visitor registration</h1>
      <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
        Pre-register your visit and get a QR pass for the gate.
      </p>

      <form
        onSubmit={onSubmit}
        className="mt-8 space-y-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6"
      >
        {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}

        <label className="block text-sm font-medium">
          Your name
          <input
            required
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2"
          />
        </label>

        <label className="block text-sm font-medium">
          Your phone
          <input
            required
            value={form.phone}
            onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
            className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2"
          />
        </label>

        <label className="block text-sm font-medium">
          Purpose
          <input
            value={form.purpose}
            onChange={(e) => setForm((p) => ({ ...p, purpose: e.target.value }))}
            className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2"
          />
        </label>

        <label className="block text-sm font-medium">
          Expected date
          <input
            type="date"
            value={form.expectedDate}
            onChange={(e) => setForm((p) => ({ ...p, expectedDate: e.target.value }))}
            className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2"
          />
        </label>

        <div>
          <p className="text-sm font-medium">Resident to visit</p>
          <div className="mt-1 flex gap-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or unit..."
              className="w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={() => loadResidents(search.trim())}
              className="shrink-0 rounded-md border border-[var(--color-border)] px-3 py-2 text-sm"
            >
              Search
            </button>
          </div>
          <select
            required
            value={form.residentId}
            onChange={(e) => setForm((p) => ({ ...p, residentId: e.target.value }))}
            className="mt-2 w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2"
          >
            <option value="">Select resident</option>
            {residents.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} {r.unitLabel ? `(${r.unitLabel})` : ''}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-[var(--color-accent)] py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? 'Registering...' : 'Register & get QR'}
        </button>
      </form>

      {result && (
        <div className="mt-8">
          <div className="mb-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4 text-center">
            <h2 className="text-lg font-semibold">Registration successful</h2>
            <p className="mt-1 text-sm">
              Visit ID: <strong>{result.visitor.id}</strong>
            </p>
            <p className="text-sm text-[var(--color-ink-muted)]">
              Save your visit ID and phone to check status later.
            </p>
            <Link
              to={`/visitor/status?id=${result.visitor.id}`}
              className="mt-3 inline-block text-sm font-medium text-[var(--color-accent)] hover:underline"
            >
              Check status →
            </Link>
          </div>
          <QrPassCard
            visitor={result.visitor}
            qrCode={result.visitor.qrCode}
            qrPayload={result.qrPayload}
          />
        </div>
      )}
    </section>
  );
}

export default VisitorRegisterPage;

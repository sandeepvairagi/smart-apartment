import { useEffect, useState } from 'react';
import {
  getApartments,
  createApartment,
  updateApartment,
  deleteApartment,
} from '../../services/adminService';
import Spinner from '../../components/Spinner';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';

function AdminApartmentsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    block: '',
    unitNumber: '',
    floor: 1,
    type: '2BHK',
  });

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await getApartments({ limit: 50 });
      setItems(data.data.items);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load apartments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onCreate = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await createApartment(form);
      setMessage('Apartment created');
      setForm({ block: '', unitNumber: '', floor: 1, type: '2BHK' });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Create failed');
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm('Delete this apartment?')) return;
    try {
      await deleteApartment(id);
      setMessage('Apartment deleted');
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  const onToggleType = async (apt) => {
    const next = apt.type === '2BHK' ? '3BHK' : '2BHK';
    try {
      await updateApartment(apt._id, { type: next });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    }
  };

  return (
    <section className="space-y-10">
      <div>
        <h1 className="font-display text-3xl font-bold">Apartments</h1>
        <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
          Manage building units and occupancy.
        </p>
      </div>

      <form
        onSubmit={onCreate}
        className="grid gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6 sm:grid-cols-2"
      >
        <h2 className="sm:col-span-2 text-lg font-semibold">Add apartment</h2>
        <label className="block text-sm font-medium">
          Block
          <input
            required
            value={form.block}
            onChange={(e) => setForm((p) => ({ ...p, block: e.target.value }))}
            className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2"
            placeholder="A"
          />
        </label>
        <label className="block text-sm font-medium">
          Unit number
          <input
            required
            value={form.unitNumber}
            onChange={(e) => setForm((p) => ({ ...p, unitNumber: e.target.value }))}
            className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2"
            placeholder="101"
          />
        </label>
        <label className="block text-sm font-medium">
          Floor
          <input
            type="number"
            min={0}
            value={form.floor}
            onChange={(e) => setForm((p) => ({ ...p, floor: Number(e.target.value) }))}
            className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2"
          />
        </label>
        <label className="block text-sm font-medium">
          Type
          <select
            value={form.type}
            onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
            className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2"
          >
            {['1BHK', '2BHK', '3BHK', 'studio', 'other'].map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <div className="sm:col-span-2">
          <button
            type="submit"
            className="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white"
          >
            Create apartment
          </button>
        </div>
      </form>

      {message && <p className="text-sm text-[var(--color-success)]">{message}</p>}
      {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}

      {loading ? (
        <Spinner />
      ) : items.length === 0 ? (
        <EmptyState title="No apartments" description="Add your first unit above." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[var(--color-border)]">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[var(--color-surface-elevated)] text-[var(--color-ink-muted)]">
              <tr>
                <th className="px-4 py-3 font-medium">Unit</th>
                <th className="px-4 py-3 font-medium">Floor</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Occupancy</th>
                <th className="px-4 py-3 font-medium">Resident</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((a) => (
                <tr
                  key={a._id}
                  className="border-t border-[var(--color-border)] bg-[var(--color-surface-elevated)]"
                >
                  <td className="px-4 py-3 font-medium">
                    {a.block}-{a.unitNumber}
                  </td>
                  <td className="px-4 py-3">{a.floor}</td>
                  <td className="px-4 py-3">{a.type}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={a.isOccupied ? 'checked-in' : 'pending'} />
                    <span className="ml-1 text-xs">
                      {a.isOccupied ? 'Occupied' : 'Vacant'}
                    </span>
                  </td>
                  <td className="px-4 py-3">{a.resident?.name || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => onToggleType(a)}
                        className="text-xs text-[var(--color-accent)] hover:underline"
                      >
                        Cycle type
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(a._id)}
                        className="text-xs text-[var(--color-danger)] hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default AdminApartmentsPage;

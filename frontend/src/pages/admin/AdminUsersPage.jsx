import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  getUsers,
  createUser,
  updateUser,
  getApartments,
  assignApartment,
} from '../../services/adminService';
import Spinner from '../../components/Spinner';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';

function AdminUsersPage() {
  const [searchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [role, setRole] = useState(searchParams.get('role') || '');
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'resident',
    phone: '',
  });

  const load = async (params = {}) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await getUsers(params);
      setItems(data.data.items);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(role ? { role } : {});
    getApartments({ limit: 50, isOccupied: 'false' })
      .then((res) => setApartments(res.data.data.items))
      .catch(() => {});
  }, [role]);

  const onFilter = (e) => {
    e.preventDefault();
    const params = {};
    if (role) params.role = role;
    if (search.trim()) params.search = search.trim();
    load(params);
  };

  const onCreate = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      await createUser(form);
      setMessage('User created');
      setForm({ name: '', email: '', password: '', role: 'resident', phone: '' });
      load(role ? { role } : {});
    } catch (err) {
      setError(err.response?.data?.message || 'Create failed');
    }
  };

  const toggleActive = async (user) => {
    try {
      await updateUser(user.id, { isActive: !user.isActive });
      setMessage(user.isActive ? 'User deactivated' : 'User activated');
      load(role ? { role } : {});
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    }
  };

  const onAssign = async (userId, apartmentId) => {
    try {
      const payload =
        !apartmentId || apartmentId === '__none__'
          ? { apartmentId: null }
          : { apartmentId };
      await assignApartment(userId, payload);
      setMessage('Apartment assignment updated');
      load(role ? { role } : {});
      const res = await getApartments({ limit: 50, isOccupied: 'false' });
      setApartments(res.data.data.items);
    } catch (err) {
      setError(err.response?.data?.message || 'Assign failed');
    }
  };

  return (
    <section className="space-y-10">
      <div>
        <h1 className="font-display text-3xl font-bold">User management</h1>
        <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
          Create and manage residents, guards, and admins.
        </p>
      </div>

      <form
        onSubmit={onCreate}
        className="grid gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6 sm:grid-cols-2"
      >
        <h2 className="sm:col-span-2 text-lg font-semibold">Create user</h2>
        {['name', 'email', 'phone', 'password'].map((field) => (
          <label key={field} className="block text-sm font-medium capitalize">
            {field}
            <input
              type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'}
              required={field !== 'phone'}
              minLength={field === 'password' ? 6 : undefined}
              value={form[field]}
              onChange={(e) => setForm((p) => ({ ...p, [field]: e.target.value }))}
              className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 outline-none focus:border-[var(--color-accent)]"
            />
          </label>
        ))}
        <label className="block text-sm font-medium">
          Role
          <select
            value={form.role}
            onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
            className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2"
          >
            <option value="resident">Resident</option>
            <option value="guard">Guard</option>
            <option value="admin">Admin</option>
          </select>
        </label>
        <div className="sm:col-span-2">
          <button
            type="submit"
            className="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--color-accent-hover)]"
          >
            Create account
          </button>
        </div>
      </form>

      <form onSubmit={onFilter} className="flex flex-wrap gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name/email/unit..."
          className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-2 text-sm"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-2 text-sm"
        >
          <option value="">All roles</option>
          <option value="resident">Resident</option>
          <option value="guard">Guard</option>
          <option value="admin">Admin</option>
        </select>
        <button
          type="submit"
          className="rounded-md border border-[var(--color-border)] px-4 py-2 text-sm"
        >
          Filter
        </button>
      </form>

      {message && <p className="text-sm text-[var(--color-success)]">{message}</p>}
      {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}

      {loading ? (
        <Spinner />
      ) : items.length === 0 ? (
        <EmptyState title="No users found" />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[var(--color-border)]">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[var(--color-surface-elevated)] text-[var(--color-ink-muted)]">
              <tr>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Unit</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((u) => (
                <tr
                  key={u.id}
                  className="border-t border-[var(--color-border)] bg-[var(--color-surface-elevated)]"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium">{u.name}</p>
                    <p className="text-xs text-[var(--color-ink-muted)]">{u.email}</p>
                  </td>
                  <td className="px-4 py-3 capitalize">{u.role}</td>
                  <td className="px-4 py-3">{u.unitLabel || '—'}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={u.isActive ? 'resolved' : 'closed'} />
                    <span className="ml-1 text-xs">{u.isActive ? 'Active' : 'Inactive'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => toggleActive(u)}
                        className="text-left text-xs font-medium text-[var(--color-accent)] hover:underline"
                      >
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      {u.role === 'resident' && (
                        <select
                          defaultValue=""
                          onChange={(e) => {
                            if (!e.target.value) return;
                            onAssign(u.id, e.target.value);
                            e.target.value = '';
                          }}
                          className="rounded border border-[var(--color-border)] bg-transparent px-2 py-1 text-xs"
                        >
                          <option value="">Assign apartment...</option>
                          <option value="__none__">Unassign</option>
                          {apartments.map((a) => (
                            <option key={a._id} value={a._id}>
                              {a.block}-{a.unitNumber}
                            </option>
                          ))}
                        </select>
                      )}
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

export default AdminUsersPage;

import { useEffect, useState } from 'react';
import { createAdminUser, deleteAdminUser, listAdminUsers, updateAdminUser, type AdminUser } from '@/services/adminUsersApi';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'super_admin'>('admin');

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setUsers(await listAdminUsers());
    } catch (e: any) {
      setError(e?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createAdminUser({ username, password, role });
      setUsername('');
      setPassword('');
      setRole('admin');
      await load();
    } catch (e: any) {
      setError(e?.message || 'Failed to create user');
    }
  }

  async function onToggleActive(u: AdminUser) {
    try {
      await updateAdminUser(u.id, { is_active: !u.is_active });
      await load();
    } catch (e: any) {
      setError(e?.message || 'Failed to update user');
    }
  }

  async function onDelete(u: AdminUser) {
    if (!confirm(`Delete admin user ${u.username}?`)) return;
    try {
      await deleteAdminUser(u.id);
      await load();
    } catch (e: any) {
      setError(e?.message || 'Failed to delete user');
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin Users</h1>
        <p className="text-muted-foreground mt-1">Manage Agent Hub admin accounts</p>
      </div>

      {error && <div className="text-sm text-red-400">{error}</div>}

      <form onSubmit={onCreate} className="rounded-xl border border-border p-4 space-y-3">
        <h2 className="font-semibold">Create admin user</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input className="rounded border border-input bg-background px-3 py-2 text-sm" placeholder="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
          <input className="rounded border border-input bg-background px-3 py-2 text-sm" placeholder="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <select className="rounded border border-input bg-background px-3 py-2 text-sm" value={role} onChange={(e) => setRole(e.target.value as any)}>
            <option value="admin">admin</option>
            <option value="super_admin">super_admin</option>
          </select>
        </div>
        <button className="rounded bg-primary text-primary-foreground px-4 py-2 text-sm font-medium">Create</button>
      </form>

      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-2">Username</th>
              <th className="text-left px-4 py-2">Role</th>
              <th className="text-left px-4 py-2">Active</th>
              <th className="text-left px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="px-4 py-3" colSpan={4}>Loading...</td></tr>
            ) : users.length === 0 ? (
              <tr><td className="px-4 py-3" colSpan={4}>No users</td></tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="border-t border-border">
                  <td className="px-4 py-2">{u.username}</td>
                  <td className="px-4 py-2">{u.role}</td>
                  <td className="px-4 py-2">{u.is_active ? 'yes' : 'no'}</td>
                  <td className="px-4 py-2 space-x-2">
                    <button className="underline" onClick={() => onToggleActive(u)}>{u.is_active ? 'disable' : 'enable'}</button>
                    <button className="underline text-red-400" onClick={() => onDelete(u)}>delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

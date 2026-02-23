export interface AdminUser {
  id: number;
  username: string;
  role: 'admin' | 'super_admin' | string;
  is_active: boolean;
  created_at: string;
}

export async function listAdminUsers(): Promise<AdminUser[]> {
  const res = await fetch('/api/admin-users', { credentials: 'include' });
  const data = await res.json();
  if (!res.ok || !data.ok) throw new Error(data.error || 'Failed to load users');
  return data.users as AdminUser[];
}

export async function createAdminUser(payload: { username: string; password: string; role?: 'admin' | 'super_admin' }) {
  const res = await fetch('/api/admin-users', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data.ok) throw new Error(data.error || 'Failed to create user');
  return data.user as AdminUser;
}

export async function updateAdminUser(id: number, payload: { role?: 'admin' | 'super_admin'; is_active?: boolean; password?: string }) {
  const res = await fetch(`/api/admin-users/${id}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data.ok) throw new Error(data.error || 'Failed to update user');
  return data.user as AdminUser;
}

export async function deleteAdminUser(id: number) {
  const res = await fetch(`/api/admin-users/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  const data = await res.json();
  if (!res.ok || !data.ok) throw new Error(data.error || 'Failed to delete user');
}

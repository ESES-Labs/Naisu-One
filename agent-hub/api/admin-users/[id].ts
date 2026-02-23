import { ensureAuthSchema, getDb } from '../_db.js';
import { getSessionFromRequest, hashPassword } from '../_auth.js';

export default async function handler(req: any, res: any) {
  await ensureAuthSchema();

  const session = await getSessionFromRequest(req);
  if (!session.ok) {
    return res.status(401).json({ ok: false, error: 'Unauthorized' });
  }

  const id = Number(req.query.id);
  if (!Number.isFinite(id) || id <= 0) {
    return res.status(400).json({ ok: false, error: 'Invalid id' });
  }

  const db = getDb();

  if (req.method === 'PATCH') {
    if (session.role !== 'super_admin') {
      return res.status(403).json({ ok: false, error: 'Forbidden' });
    }

    const { role, is_active, password } = req.body || {};

    const updates: string[] = [];
    const values: any[] = [];

    if (role) {
      const finalRole = role === 'super_admin' ? 'super_admin' : 'admin';
      values.push(finalRole);
      updates.push(`role = $${values.length}`);
    }

    if (typeof is_active === 'boolean') {
      values.push(is_active);
      updates.push(`is_active = $${values.length}`);
    }

    if (password) {
      values.push(hashPassword(password));
      updates.push(`password_hash = $${values.length}`);
    }

    if (updates.length === 0) {
      return res.status(400).json({ ok: false, error: 'No valid fields to update' });
    }

    values.push(id);

    const result = await db.query(
      `
        UPDATE admin_users
        SET ${updates.join(', ')}
        WHERE id = $${values.length}
        RETURNING id, username, role, is_active, created_at
      `,
      values
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ ok: false, error: 'User not found' });
    }

    return res.status(200).json({ ok: true, user: result.rows[0] });
  }

  if (req.method === 'DELETE') {
    if (session.role !== 'super_admin') {
      return res.status(403).json({ ok: false, error: 'Forbidden' });
    }

    if (session.userId === id) {
      return res.status(400).json({ ok: false, error: 'Cannot delete current session user' });
    }

    const result = await db.query(`DELETE FROM admin_users WHERE id = $1`, [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ ok: false, error: 'User not found' });
    }

    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ ok: false, error: 'Method not allowed' });
}

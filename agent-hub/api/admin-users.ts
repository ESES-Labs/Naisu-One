import { ensureAuthSchema, getDb } from './_db.js';
import { getSessionFromRequest, hashPassword } from './_auth.js';

export default async function handler(req: any, res: any) {
  await ensureAuthSchema();

  const session = await getSessionFromRequest(req);
  if (!session.ok) {
    return res.status(401).json({ ok: false, error: 'Unauthorized' });
  }

  const db = getDb();

  if (req.method === 'GET') {
    const rows = await db.query(
      `SELECT id, username, role, is_active, created_at FROM admin_users ORDER BY id ASC`
    );
    return res.status(200).json({ ok: true, users: rows.rows });
  }

  if (req.method === 'POST') {
    if (session.role !== 'super_admin') {
      return res.status(403).json({ ok: false, error: 'Forbidden' });
    }

    const { username, password, role } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ ok: false, error: 'username and password are required' });
    }

    const finalRole = role === 'super_admin' ? 'super_admin' : 'admin';
    const passwordHash = hashPassword(password);

    try {
      const result = await db.query(
        `
          INSERT INTO admin_users (username, password_hash, role, is_active)
          VALUES ($1, $2, $3, TRUE)
          RETURNING id, username, role, is_active, created_at
        `,
        [username, passwordHash, finalRole]
      );

      return res.status(201).json({ ok: true, user: result.rows[0] });
    } catch (e: any) {
      if (e?.code === '23505') {
        return res.status(409).json({ ok: false, error: 'Username already exists' });
      }
      throw e;
    }
  }

  return res.status(405).json({ ok: false, error: 'Method not allowed' });
}

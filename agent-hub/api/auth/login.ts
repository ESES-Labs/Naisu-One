import {
  buildSessionCookie,
  createSessionForUser,
  getSessionMaxAgeSeconds,
  verifyPasswordHash,
} from '../_auth.js';
import { ensureAuthSchema, getDb } from '../_db.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ ok: false, authenticated: false, error: 'Missing credentials' });
  }

  await ensureAuthSchema();
  const db = getDb();

  const user = await db.query(
    `
      SELECT id, username, password_hash
      FROM admin_users
      WHERE username = $1
        AND is_active = TRUE
      LIMIT 1
    `,
    [username]
  );

  if (user.rowCount === 0) {
    return res.status(401).json({ ok: false, authenticated: false, error: 'Invalid credentials' });
  }

  const row = user.rows[0];
  const validPass = verifyPasswordHash(password, row.password_hash);
  if (!validPass) {
    return res.status(401).json({ ok: false, authenticated: false, error: 'Invalid credentials' });
  }

  const maxAge = getSessionMaxAgeSeconds();
  const token = await createSessionForUser(Number(row.id), maxAge);
  res.setHeader('Set-Cookie', buildSessionCookie(token, maxAge));

  return res.status(200).json({ ok: true, authenticated: true, username: row.username });
}

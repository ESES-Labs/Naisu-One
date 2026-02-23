import crypto from 'crypto';
import { ensureAuthSchema, getDb } from './_db.js';

const COOKIE_NAME = 'agenthub_session';

export function parseCookie(cookieHeader?: string): Record<string, string> {
  if (!cookieHeader) return {};
  return cookieHeader
    .split(';')
    .map((v) => v.trim())
    .filter(Boolean)
    .reduce((acc: Record<string, string>, item) => {
      const idx = item.indexOf('=');
      if (idx <= 0) return acc;
      const k = decodeURIComponent(item.slice(0, idx));
      const v = decodeURIComponent(item.slice(idx + 1));
      acc[k] = v;
      return acc;
    }, {});
}

export function buildSessionCookie(token: string, maxAgeSeconds: number): string {
  const secure = process.env.NODE_ENV === 'production';
  return `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds}; ${secure ? 'Secure;' : ''}`;
}

export function buildClearSessionCookie(): string {
  const secure = process.env.NODE_ENV === 'production';
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; ${secure ? 'Secure;' : ''}`;
}

function sha256(text: string): string {
  return crypto.createHash('sha256').update(text).digest('hex');
}

export function createSessionToken(): string {
  return crypto.randomBytes(48).toString('base64url');
}

export async function getSessionFromRequest(req: any): Promise<{ ok: boolean; userId?: number; username?: string; role?: string }> {
  await ensureAuthSchema();

  const cookies = parseCookie(req.headers?.cookie);
  const token = cookies[COOKIE_NAME];
  if (!token) return { ok: false };

  const tokenHash = sha256(token);
  const db = getDb();

  await db.query(`DELETE FROM admin_sessions WHERE expires_at < NOW()`);

  const session = await db.query(
    `
      SELECT s.user_id, u.username, u.role
      FROM admin_sessions s
      JOIN admin_users u ON u.id = s.user_id
      WHERE s.token_hash = $1
        AND s.expires_at > NOW()
        AND u.is_active = TRUE
      LIMIT 1
    `,
    [tokenHash]
  );

  if (session.rowCount === 0) return { ok: false };

  await db.query(
    `UPDATE admin_sessions SET last_seen_at = NOW() WHERE token_hash = $1`,
    [tokenHash]
  );

  const row = session.rows[0];
  return { ok: true, userId: Number(row.user_id), username: row.username, role: row.role };
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16);
  const derived = crypto.scryptSync(password, salt, 64);
  return `scrypt$${salt.toString('hex')}$${derived.toString('hex')}`;
}

export function verifyPasswordHash(input: string, hash: string): boolean {
  const [algo, saltHex, hashHex] = hash.split('$');
  if (algo !== 'scrypt' || !saltHex || !hashHex) return false;

  const derived = crypto.scryptSync(input, Buffer.from(saltHex, 'hex'), 64);
  const expected = Buffer.from(hashHex, 'hex');
  if (derived.length !== expected.length) return false;
  return crypto.timingSafeEqual(derived, expected);
}

export function getSessionMaxAgeSeconds(): number {
  const raw = process.env.ADMIN_SESSION_MAX_AGE_SECONDS;
  const n = raw ? Number(raw) : 60 * 60 * 8;
  if (!Number.isFinite(n) || n <= 0) return 60 * 60 * 8;
  return Math.floor(n);
}

export async function createSessionForUser(userId: number, maxAgeSeconds: number): Promise<string> {
  await ensureAuthSchema();

  const token = createSessionToken();
  const tokenHash = sha256(token);
  const db = getDb();

  await db.query(
    `
      INSERT INTO admin_sessions (token_hash, user_id, expires_at)
      VALUES ($1, $2, NOW() + ($3 || ' seconds')::interval)
    `,
    [tokenHash, userId, String(maxAgeSeconds)]
  );

  return token;
}

export async function revokeSessionFromRequest(req: any): Promise<void> {
  await ensureAuthSchema();
  const cookies = parseCookie(req.headers?.cookie);
  const token = cookies[COOKIE_NAME];
  if (!token) return;

  const db = getDb();
  await db.query(`DELETE FROM admin_sessions WHERE token_hash = $1`, [sha256(token)]);
}

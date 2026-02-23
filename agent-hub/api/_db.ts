import { Pool } from 'pg';
import crypto from 'crypto';

let pool: Pool | null = null;
let initialized = false;

export function getDb(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is required');
  }

  if (!pool) {
    pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
  }

  return pool;
}

function scryptHash(password: string): string {
  const salt = crypto.randomBytes(16);
  const derived = crypto.scryptSync(password, salt, 64);
  return `scrypt$${salt.toString('hex')}$${derived.toString('hex')}`;
}

async function bootstrapSuperAdmin(db: Pool) {
  const username = process.env.SUPERADMIN_USERNAME;
  if (!username) return;

  const passwordHash = process.env.SUPERADMIN_PASSWORD_HASH;
  const plainPassword = process.env.SUPERADMIN_PASSWORD;

  const finalHash = passwordHash || (plainPassword ? scryptHash(plainPassword) : '');
  if (!finalHash) {
    throw new Error('SUPERADMIN_USERNAME is set but SUPERADMIN_PASSWORD_HASH/SUPERADMIN_PASSWORD is missing');
  }

  await db.query(
    `
      INSERT INTO admin_users (username, password_hash, role, is_active)
      VALUES ($1, $2, 'super_admin', TRUE)
      ON CONFLICT (username)
      DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        role = 'super_admin',
        is_active = TRUE
    `,
    [username, finalHash]
  );
}

export async function ensureAuthSchema() {
  if (initialized) return;
  const db = getDb();

  await db.query(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id BIGSERIAL PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS admin_sessions (
      id BIGSERIAL PRIMARY KEY,
      token_hash TEXT NOT NULL UNIQUE,
      user_id BIGINT NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires_at
    ON admin_sessions (expires_at);
  `);

  await bootstrapSuperAdmin(db);

  initialized = true;
}

# Agent Hub Admin Auth (Postgres)

Agent Hub now uses Postgres-backed admin auth/session.

## Required env (Vercel project: agent-hub)

- `API_BASE_URL`
- `MASTER_API_KEY`
- `DATABASE_URL`
- optional: `ADMIN_SESSION_MAX_AGE_SECONDS`

## Bootstrap first admin user

1) Generate scrypt hash:

```bash
node -e "const c=require('crypto');const p=process.argv[1];const s=c.randomBytes(16);const d=c.scryptSync(p,s,64);console.log('scrypt$'+s.toString('hex')+'$'+d.toString('hex'))" 'YOUR_PASSWORD'
```

2) Insert admin row (run against your Postgres):

```sql
INSERT INTO admin_users (username, password_hash, role, is_active)
VALUES ('jar', 'scrypt$<saltHex>$<hashHex>', 'admin', true)
ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash, is_active = true;
```

## Endpoints

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET/POST/... /api/admin-proxy?path=/v1/...` (requires session cookie)

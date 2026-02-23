# Agent Hub Admin Auth (Postgres)

Agent Hub uses Postgres-backed admin auth/session.

## Required env (Vercel project: agent-hub)

- `API_BASE_URL`
- `MASTER_API_KEY`
- `DATABASE_URL`
- optional: `ADMIN_SESSION_MAX_AGE_SECONDS`

## Bootstrap first super admin (SQL seed)

1) Generate password hash:

```bash
node scripts/generate-password-hash.mjs 'YOUR_PASSWORD'
```

2) Open `agent-hub/db/seed_superadmin.sql` and replace:
- `<USERNAME>`
- `<SCRYPT_HASH>`

3) Run SQL once in Neon SQL Editor (or via `psql`).

## Endpoints

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET/POST/... /api/admin-proxy?path=/v1/...` (requires session cookie)

### Admin user management (super_admin)
- `GET /api/admin-users`
- `POST /api/admin-users`
- `PATCH /api/admin-users/:id`
- `DELETE /api/admin-users/:id`

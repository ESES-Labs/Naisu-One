# Agent Hub Admin Auth (Postgres)

Agent Hub uses Postgres-backed admin auth/session.

## Required env (Vercel project: agent-hub)

- `API_BASE_URL`
- `MASTER_API_KEY`
- `DATABASE_URL`
- optional: `ADMIN_SESSION_MAX_AGE_SECONDS`

## Super admin bootstrap (recommended)

Set these env vars in Vercel:

- `SUPERADMIN_USERNAME` (e.g. `jar`)
- and one of:
  - `SUPERADMIN_PASSWORD_HASH` (recommended)
  - `SUPERADMIN_PASSWORD` (temporary/easier)

On first request, schema init will upsert this user as `super_admin` and active.

## Generate password hash

```bash
node -e "const c=require('crypto');const p=process.argv[1];const s=c.randomBytes(16);const d=c.scryptSync(p,s,64);console.log('scrypt$'+s.toString('hex')+'$'+d.toString('hex'))" 'YOUR_PASSWORD'
```

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

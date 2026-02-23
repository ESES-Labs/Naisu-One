-- Seed one super admin account (run once in Neon SQL editor or psql)
-- 1) Generate hash first:
--    node scripts/generate-password-hash.mjs 'YOUR_PASSWORD'
-- 2) Replace <USERNAME> and <SCRYPT_HASH> below

INSERT INTO admin_users (username, password_hash, role, is_active)
VALUES ('<USERNAME>', '<SCRYPT_HASH>', 'super_admin', TRUE)
ON CONFLICT (username)
DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  role = 'super_admin',
  is_active = TRUE;

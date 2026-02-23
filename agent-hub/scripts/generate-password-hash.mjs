import crypto from 'crypto';

const password = process.argv[2];
if (!password) {
  console.error('Usage: node scripts/generate-password-hash.mjs <password>');
  process.exit(1);
}

const salt = crypto.randomBytes(16);
const derived = crypto.scryptSync(password, salt, 64);
const hash = `scrypt$${salt.toString('hex')}$${derived.toString('hex')}`;
console.log(hash);

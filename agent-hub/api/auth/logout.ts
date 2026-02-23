import { buildClearSessionCookie, revokeSessionFromRequest } from '../_auth.js';

export default async function handler(req: any, res: any) {
  await revokeSessionFromRequest(req);
  res.setHeader('Set-Cookie', buildClearSessionCookie());
  return res.status(200).json({ ok: true, authenticated: false });
}

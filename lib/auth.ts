import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';

const COOKIE = 'ipa_admin_session';
function secret() { const s = process.env.COOKIE_SECRET; if (!s || s.length < 32) throw new Error('COOKIE_SECRET must be at least 32 characters'); return s; }
export function makeSession() {
  const payload = Buffer.from(JSON.stringify({u: process.env.ADMIN_USERNAME || 'admin', exp: Date.now() + 7 * 86400_000})).toString('base64url');
  const sig = createHmac('sha256', secret()).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}
export function validSession(value?: string) {
  if (!value) return false;
  const [payload, sig] = value.split('.'); if (!payload || !sig) return false;
  const expected = createHmac('sha256', secret()).update(payload).digest();
  let got: Buffer; try { got = Buffer.from(sig, 'base64url'); } catch { return false; }
  if (got.length !== expected.length || !timingSafeEqual(got, expected)) return false;
  try { const p = JSON.parse(Buffer.from(payload, 'base64url').toString()); return p.u === (process.env.ADMIN_USERNAME || 'admin') && p.exp > Date.now(); } catch { return false; }
}
export function isAdminRequest() { return validSession(cookies().get(COOKIE)?.value); }
export const sessionCookieName = COOKIE;

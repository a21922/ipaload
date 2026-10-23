export type IPAApp = {
  id: string; name: string; developer: string; description: string; icon: string; screenshots: string[];
  category: string; storeUrl: string; version: string; minOS: string; storeSize: string; rating: number | null;
  ratingCount: number; country: string; status: string; tags: string[]; ipaUrl: string; ipaPath: string;
  ipaSize: number; downloads: number; createdAt: string; updatedAt: string; featured: boolean;
};
const DATA_FILE = 'catalog.json';
function base() { const u = process.env.WEBDAV_URL; if (!u) throw new Error('Missing WEBDAV_URL'); return u.endsWith('/') ? u : u + '/'; }
function auth() { const u = process.env.WEBDAV_USERNAME; const p = process.env.WEBDAV_PASSWORD; if (!u || !p) throw new Error('Missing WebDAV credentials'); return 'Basic ' + Buffer.from(`${u}:${p}`).toString('base64'); }
export function publicFileUrl(path: string) { const b = process.env.WEBDAV_PUBLIC_BASE_URL; return b ? (b.endsWith('/') ? b : b + '/') + path.split('/').map(encodeURIComponent).join('/') : ''; }
async function request(path: string, init: RequestInit = {}) {
  const url = base() + path.split('/').map(encodeURIComponent).join('/');
  const res = await fetch(url, { ...init, headers: { Authorization: auth(), ...(init.headers || {}) }, cache: 'no-store' });
  return res;
}
export async function readCatalog(): Promise<IPAApp[]> {
  const r = await request(DATA_FILE);
  if (r.status === 404) return [];
  if (!r.ok) throw new Error(`WebDAV read failed (${r.status})`);
  const data = await r.json(); return Array.isArray(data) ? data : [];
}
export async function writeCatalog(apps: IPAApp[]) {
  const r = await request(DATA_FILE, { method: 'PUT', headers: {'Content-Type':'application/json; charset=utf-8'}, body: JSON.stringify(apps, null, 2) });
  if (!r.ok) throw new Error(`WebDAV write failed (${r.status})`);
}
export async function uploadBuffer(path: string, data: Buffer, contentType = 'application/octet-stream') {
  // Ensure the IPA folder exists; a 405 response usually means it already exists.
  const mk = await request('ipa', { method: 'MKCOL' });
  if (!mk.ok && mk.status !== 405 && mk.status !== 409) throw new Error(`WebDAV folder creation failed (${mk.status})`);
  const r = await request(path, { method: 'PUT', headers: {'Content-Type':contentType}, body: new Uint8Array(data) });
  if (!r.ok) throw new Error(`WebDAV upload failed (${r.status})`);
}

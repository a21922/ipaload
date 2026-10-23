import { readCatalog } from '@/lib/webdav';
import Catalog from './ui/Catalog';
export const dynamic = 'force-dynamic';
export default async function Home() {
  let apps = []; let error = '';
  try { apps = await readCatalog(); } catch (e) { error = e instanceof Error ? e.message : '读取存储失败'; }
  return <Catalog initialApps={apps} siteName={process.env.SITE_NAME || 'IPA Library'} storageError={error} />;
}

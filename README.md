# IPA Library — Vercel + WebDAV

A Next.js 14 serverless IPA catalogue inspired by the supplied IPAOMTK HTML cards. Public metadata is stored as `catalog.json` on WebDAV; IPA files are stored in a WebDAV `ipa/` directory. No SQLite or Docker required.

## Features
- Responsive dark app cards: icon, iOS label, New/Updated status, category, IPA size, version and tags.
- Search and category filtering, app detail modal, screenshots and App Store links.
- Admin password login with signed HttpOnly cookie (7-day expiry), CSRF-resistant same-site cookie, app list, featured toggle, delete catalog record.
- Bulk App Store URL import (up to 100 per request) via Apple's public iTunes Lookup API.
- IPA source can be a direct URL, or a small file upload to WebDAV.
- WebDAV stores the JSON catalogue and uploaded files; no ephemeral Vercel filesystem used for persistence.

## Important upload limitation
Vercel Functions have a request body limit (commonly 4.5 MB). This project intentionally caps its browser upload route at 3 MB. For real IPA files (usually tens/hundreds of MB), upload the file using a WebDAV client directly into the configured WebDAV public directory, then paste the public direct-download URL into Admin → Add IPA source. Do not proxy multi-GB uploads through Vercel Functions. `WEBDAV_PUBLIC_BASE_URL` must be a public-read URL mapping to the same directory as `WEBDAV_URL`; otherwise visitors cannot download the stored file. External direct links work without public WebDAV access.

## Project tree
```
app/
  api/apps/route.ts       # public catalogue + admin operations
  api/import/route.ts     # App Store metadata import
  api/login/route.ts      # admin session
  api/logout/route.ts
  api/upload/route.ts     # <=3 MB upload to WebDAV
  admin/page.tsx
  ui/Admin.tsx
  ui/Catalog.tsx
  page.tsx
  layout.tsx
  style.css
lib/
  auth.ts                 # signed session cookie
  webdav.ts               # WebDAV read/write/upload
public/placeholder.svg
.env.example
vercel.json
REFERENCE-IPAOMTK-CARDS.txt # original user-provided HTML reference
```

## Deploy on Vercel
1. Create a GitHub repository and upload all files in this directory (do not upload `.env.local`).
2. In Vercel, import that repository as a Next.js project. Framework preset should be Next.js.
3. Create a dedicated WebDAV folder, for example `ipa-library/`, and ensure the WebDAV account has read/write access. Create a public read URL for the IPA subfolder if you want anonymous downloads from the site. Keep catalogue JSON private.
4. In Vercel → Project → Settings → Environment Variables, add all variables from `.env.example`:
   - `WEBDAV_URL`: authenticated WebDAV directory URL, ending in `/`.
   - `WEBDAV_USERNAME`, `WEBDAV_PASSWORD`: dedicated WebDAV credentials.
   - `WEBDAV_PUBLIC_BASE_URL`: public URL corresponding to the WebDAV directory, ending in `/`. Only needed for small-file upload; external IPA URLs can be used without it.
   - `ADMIN_USERNAME`, `ADMIN_PASSWORD`: strong admin credentials.
   - `COOKIE_SECRET`: random secret at least 32 characters. Example generate locally with `openssl rand -hex 32`.
   - `APP_STORE_COUNTRY`: `us`, `jp`, `cn`, etc. Metadata lookup depends on the storefront.
   - `SITE_NAME`: site title.
5. Deploy. Visit `/admin`, sign in, paste App Store URLs, and import. Then add an IPA direct link for each app.
6. For large IPA files, upload directly with a WebDAV client to the publicly readable file directory and paste the resulting public direct-download URL in the admin.

## Local development
Use Node.js 18.17+ or 20+.
```bash
cp .env.example .env.local
# Edit .env.local with real WebDAV credentials and strong passwords
npm install
npm run dev
```
Open `http://localhost:3000`.

## WebDAV notes
- WebDAV URL must point to a writable directory, e.g. Nextcloud WebDAV user's folder. Do not use the public share URL as `WEBDAV_URL`; use the authenticated DAV endpoint.
- `WEBDAV_PUBLIC_BASE_URL` is separate and should point to the public HTTP file URL mapping to that directory. Some WebDAV providers do not support public folder URLs or stable direct-download URLs; in that case, use external direct IPA links or configure a public download mapping.
- The catalogue is a single JSON file. This is suitable for a small personal catalogue, not concurrent high-write workloads. Concurrent edits can race; back up `catalog.json` regularly.

## Security and legal notes
- Use a dedicated WebDAV account with access only to this project folder.
- Do not commit `.env.local` or share WebDAV credentials.
- App Store metadata is fetched from Apple's public lookup endpoint; Apple does not provide IPA binaries through this API.
- Only share IPA files you own or are authorized to redistribute. This project does not bypass app signing or DRM.

## Known limitations
- Large browser uploads are intentionally not proxied through Vercel; direct WebDAV upload + paste-link is the recommended workflow.
- Downloads use the public URL provided by the administrator; external link availability and range support depend on that host.
- No automatic scheduled metadata refresh or IPA binary inspection is included.

# admin.orasage.com CMS path split (Cloudflare Tunnel)

## Problem

Cloudflare Tunnel often maps `admin.orasage.com` directly to `http://127.0.0.1:3103`
(the admin Next.js app). The stock nginx site that proxies `/cms/` → Payload `:3120`
is then bypassed, so:

- `https://admin.orasage.com/cms/admin` → **404**
- CMS media / APIs under `/cms/api/*` → **404**
- Frontends using `CMS_PUBLIC_URL=https://admin.orasage.com/cms` show missing content/images

`cms.orasage.com` may still work if that hostname tunnels to `:3120`.

## Fix on ora (home host)

1. Run admin Next on **3104** (systemd drop-in `PORT=3104`; `admin/package.json` may hardcode `-p 3103` — override ExecStart).
2. Enable [`orasage-admin-tunnel-split.conf`](./orasage-admin-tunnel-split.conf) on `127.0.0.1:3103`:
   - `/cms/*` → `127.0.0.1:3120`
   - `/*` → `127.0.0.1:3104`
3. Point the 443 nginx admin `location /` at `3104` as well.
4. Prefer `CMS_PUBLIC_URL=https://cms.orasage.com/cms` **or** `https://admin.orasage.com/cms` once split is live; shop `next/image` must allow the chosen host.

## Verify

```bash
curl -sI https://admin.orasage.com/cms/admin | head -5   # 200
curl -sI https://admin.orasage.com/cms/api/media/file/P4-1.webp | head -5  # 200 image/webp
```

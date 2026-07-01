# AGENTS.md

## Cursor Cloud specific instructions

### What is runnable in this repo

Despite the multi-app product plan in `README.md`/`PRODUCT_PLAN_v3.md`, the only app with source code in this repo is `auth-service/` (Express + Drizzle + `jose`, TypeScript, port `3101`). The other apps (main, shop, admin, bazi, ziwei, tarot, cms) are not present here. Everything under `deploy/` (nginx configs, `vps-setup.sh`, `remote-deploy.sh`) is production infrastructure for a remote VPS and is not used for local development.

### Services

- PostgreSQL 16 is required and is already installed in the VM snapshot. It is NOT started automatically on boot — start it each session with `sudo pg_ctlcluster 16 main start` (check with `pg_lsclusters`).
- The dev database is pre-created in the snapshot: role `orasage` (password `changeme`), database `orasage_auth`. The `users` table is auto-created by `initDb()` on server startup, so no migration step is required (`npm run db:push` is optional and needs a `drizzle.config`, which is absent).

### Running auth-service

- Build first: `npm run build` (from `auth-service/`). There is NO watch/dev script — after editing `src/`, rebuild before restarting.
- The app does NOT auto-load `.env` (no dotenv dependency). Provide env vars explicitly. Easiest: `node --env-file=.env dist/index.js` (Node 22 supports `--env-file`); `npm start` alone will fail unless the required vars are already exported.
- Required env vars: `DATABASE_URL` (e.g. `postgresql://orasage:changeme@127.0.0.1:5432/orasage_auth`) and `JWT_SECRET` (min 16 chars, or the service throws on token signing).
- The server binds to `127.0.0.1:3101` only (not `0.0.0.0`).

### Testing / gotchas

- There is no automated test suite and no lint config in this repo; `npm run build` (tsc) is the only programmatic check.
- The auth cookie domain defaults to `.orasage.com` (override via `JWT_COOKIE_DOMAIN`). Because of this, a cookie jar (e.g. `curl -c`) will NOT retain the cookie when hitting `127.0.0.1`. For local API testing, read the token from the `Set-Cookie` response header and pass it as `Authorization: Bearer <token>` to protected endpoints (`/verify`, `/auth/me`).
- `deploy/auth/docker-compose.yml` will NOT build: it references `build: ./auth-service` but no Dockerfile exists and the path is wrong relative to `deploy/auth/`. Run the service directly with npm instead.

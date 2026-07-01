# AGENTS.md

## Cursor Cloud specific instructions

### What is runnable in this repo

This repo now contains source for `main/` (Next.js 15 portal), `auth-service/`
(Express + Drizzle + `jose`, port 3101), `shop/` (Next.js, port 3102),
`admin/` (Next.js skeleton, port 3103) and `cms/` (Payload CMS skeleton, port
3120). `bazi`, `ziwei`, `tarot` have no application source in this repo — they
are reverse-proxied to their existing external services via
`deploy/{bazi,ziwei,tarot}/proxy/`; `deploy/` also holds nginx configs,
systemd units, and remote deploy scripts targeting a single production VPS.

### Services

- PostgreSQL 16 is required for `auth-service`, `shop` (via auth-service) and
  `cms`. Start it each session with `sudo pg_ctlcluster 16 main start` (check
  with `pg_lsclusters`).
- Create per-app databases as needed, e.g.
  `sudo -u postgres psql -c "CREATE DATABASE orasage_auth;"` (also
  `orasage_shop`-equivalent data lives in `orasage_auth` since shop delegates
  persistence to auth-service's internal API; `orasage_cms` for Payload).
- `auth-service` schema is managed by Drizzle: `DATABASE_URL=... npx drizzle-kit push --force`
  (or apply the SQL files under `auth-service/drizzle/` in order).
- `cms` schema is managed by Payload migrations: `npm run migrate` (creates
  tables) after setting `DATABASE_URL` / `PAYLOAD_SECRET`.

### Running auth-service

- `npm install`, then `npm run build` (esbuild, no watch mode — rebuild after
  editing `src/`), then `npm start`.
- Required env vars: `DATABASE_URL`, `JWT_SECRET` (≥32 chars recommended).
- Binds to `127.0.0.1` by default (`HOST` env var can override to `0.0.0.0`,
  which is required when running via the provided docker-compose files).
- The auth cookie domain defaults to `.orasage.com`. A cookie jar hitting
  `127.0.0.1` over plain HTTP will not retain the `secure` cookie — for local
  testing, read the `token` field from the JSON response and send it as
  `Authorization: Bearer <token>` instead.

### Running shop / main / admin

- Each is a standalone Next.js app: `npm install && npm run build && npm start`.
- `shop` needs `JWT_SECRET` (must match auth-service) and `AUTH_INTERNAL_URL`
  (defaults to `http://127.0.0.1:3101`) to sync orders with auth-service.
- `admin` needs `JWT_SECRET` matching auth-service; gate logic requires the
  JWT's `role` claim to be `admin`.

### Running cms

- `npm install`, then `DATABASE_URL=... PAYLOAD_SECRET=... npm run migrate`
  (first run only, creates tables), then `npm run build && npm start`
  (port 3120). Visiting `/admin` for the first time prompts to create the
  first admin user.

### Testing / gotchas

- No repo-wide automated test suite. Per app: `npx tsc --noEmit` (auth-service,
  shop, admin) or `npm run build` (main, cms) are the main programmatic
  checks. There is no ESLint config committed for any app.
- `deploy/` scripts assume a single production VPS reachable over SSH; they
  are not meant to run inside this sandbox. Use them for review/editing, not
  execution.
- Binding to `127.0.0.1` inside a Docker container makes it unreachable via
  Docker's published ports unless the container's network mode is `host`.
  Both `auth-service/compose.yml` and `deploy/auth/docker-compose.yml` set
  `HOST=0.0.0.0` for this reason, while still restricting host-side exposure
  via `127.0.0.1:<port>:<port>` port mappings.

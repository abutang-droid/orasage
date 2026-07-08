# AGENTS.md

> **Agent 规则**：执行任务前请阅读 [`docs/AGENT-RULES.md`](docs/AGENT-RULES.md)（含 **最高宪法：关联分支穿透与影响评估**、「全站」范围定义与导航规范）。

## Cursor Cloud specific instructions

### What is runnable in this repo

All 8 apps now have source in this repo: `main/` (Next.js 15 portal),
`auth-service/` (Express + Drizzle + `jose`, port 3101), `shop/` (Next.js,
port 3102), `admin/` (Next.js skeleton, port 3103), `cms/` (Payload CMS
skeleton, port 3120), and `bazi/` `ziwei/` `tarot/` (vendored from the
separate `abutang-droid/bazi-calculator` / `ziwei-doushu` / `tarot-mind`
repos — copied working trees, not git subtrees, so they don't carry their
original commit history). `deploy/{bazi,ziwei,tarot}/` also still contains a
`proxy` fallback mode (reverse-proxies to the pre-migration external
services) kept only as a rollback path; `native` (building the vendored
source) is now the default. `deploy/` also holds nginx configs, systemd
units, and remote deploy scripts targeting a single production VPS.

### Services

- PostgreSQL 16 is required for `auth-service`, `shop` (via auth-service), `cms`,
  `bazi`, and `tarot`. Start it each session with
  `sudo pg_ctlcluster 16 main start` (check with `pg_lsclusters`).
- Create per-app Postgres databases as needed:
  `orasage_auth` (auth-service + shop order data via internal API),
  `orasage_cms` (Payload), `orasage_bazi` (bazi), `orasage_tarot` (tarot).
  Helper: `bash scripts/db-migration/create-pg-databases.sh`
- `auth-service` schema is managed by Drizzle: `DATABASE_URL=... npx drizzle-kit push --force`
  (or apply the SQL files under `auth-service/drizzle/` in order).
- `cms` schema is managed by Payload migrations: `npm run migrate` (creates
  tables) after setting `DATABASE_URL` / `PAYLOAD_SECRET`.
- `bazi` schema is managed by Drizzle (PostgreSQL):
  `DATABASE_URL=postgresql://.../orasage_bazi npx drizzle-kit push --force`.
  Uses `pnpm`, not `npm` (`corepack enable` first if pnpm isn't installed).
- `tarot` schema is managed by Prisma (PostgreSQL):
  `DATABASE_URL=postgresql://.../orasage_tarot npx prisma migrate deploy`.

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
- **Payments:** `PAYMENT_MODE` defaults to `mock` in dev and production (risk
  review / flow testing). Set `PAYMENT_MODE=stripe` plus `STRIPE_SECRET_KEY`
  and `STRIPE_WEBHOOK_SECRET` for live Stripe checkout. Logic lives in
  `shared/payments/mode.ts` and `shop/src/lib/payment-mode.ts`.
- `admin` needs `JWT_SECRET` matching auth-service; gate logic requires the
  JWT's `role` claim to be `admin`.

### Running cms

- `npm install`, then `DATABASE_URL=... PAYLOAD_SECRET=... npm run migrate`
  (first run only, creates tables), then `npm run build && npm start`
  (port 3120). Visiting `/admin` for the first time prompts to create the
  first admin user.

### Running bazi / ziwei / tarot

- `bazi`: `pnpm install`, `DATABASE_URL=postgresql://.../orasage_bazi npx drizzle-kit push --force`,
  then `DATABASE_URL=... JWT_SECRET=... pnpm run build && node dist/index.js`
  (port from `PORT` env, default 3000; the deploy scripts set it to 3110).
  `NODE_ENV=production` and missing `JWT_SECRET` will throw at startup.
- `ziwei`: `npm install && npm run build && npm start` (port 3111 by default
  now, see `package.json`). No database. `JWT_SECRET`/`AUTH_URL` are optional —
  without them the app is fully anonymous (unchanged from upstream).
- `tarot`: `npm install`, `DATABASE_URL=postgresql://.../orasage_tarot npx prisma migrate deploy`, then
  `DATABASE_URL=... JWT_SECRET=... npm run build && npm start` (reads `PORT`
  env, no `-p` flag in the script; deploy scripts set `PORT=3112`).
- All three accept the shared `orasage_token` cookie (same `JWT_SECRET` as
  auth-service) as an additive login bridge — see README's "各命理 App 的桥接
  说明" section for what changed in each app and how it was verified.

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

#!/usr/bin/env bash
# Per-boot: optional SSH key, PostgreSQL, databases, schema. Then return.
set -euo pipefail
# shellcheck source=lib.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib.sh"

mkdir -p "${HOME}/.ssh"
chmod 700 "${HOME}/.ssh"
if [ -n "${SSH_PRIVATE_KEY:-}" ]; then
  printf '%s\n' "$SSH_PRIVATE_KEY" >"${HOME}/.ssh/id_rsa"
  chmod 600 "${HOME}/.ssh/id_rsa"
  log "Wrote SSH_PRIVATE_KEY to ~/.ssh/id_rsa"
fi

if ! command -v pg_lsclusters >/dev/null 2>&1; then
  log "PostgreSQL is missing; run scripts/cloud-agent/install.sh first"
  exit 1
fi

cluster_line="$(pg_lsclusters --no-header 2>/dev/null | awk '/^16 /{print; found=1} END{if(!found) print}' | head -1)"
if [ -z "${cluster_line}" ]; then
  log "Creating PostgreSQL 16 main cluster"
  sudo pg_createcluster 16 main --start
else
  status="$(echo "$cluster_line" | awk '{print $4}')"
  if [ "$status" != "online" ]; then
    log "Starting PostgreSQL 16 main"
    sudo pg_ctlcluster 16 main start
  else
    log "PostgreSQL 16 main already online"
  fi
fi

ready=0
for _ in $(seq 1 30); do
  if sudo -u postgres pg_isready -q; then
    ready=1
    break
  fi
  sleep 1
done
if [ "$ready" -ne 1 ]; then
  log "PostgreSQL did not become ready"
  exit 1
fi

log "Ensuring role ${PG_USER} and databases"
sudo -u postgres psql -v ON_ERROR_STOP=1 <<SQL
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${PG_USER}') THEN
    CREATE ROLE ${PG_USER} LOGIN PASSWORD '${PG_PASSWORD}' SUPERUSER;
  ELSE
    ALTER ROLE ${PG_USER} WITH LOGIN PASSWORD '${PG_PASSWORD}' SUPERUSER;
  END IF;
END
\$\$;
SQL

for db in orasage_auth orasage_cms orasage_bazi orasage_tarot; do
  sudo -u postgres psql -v ON_ERROR_STOP=1 <<SQL
SELECT 'CREATE DATABASE ${db} OWNER ${PG_USER}'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '${db}')\gexec
GRANT ALL PRIVILEGES ON DATABASE ${db} TO ${PG_USER};
SQL
done

bash "$ROOT/scripts/cloud-agent/write-local-env.sh"

if [ -d "$ROOT/auth-service/node_modules" ]; then
  log "Pushing auth-service schema"
  (
    cd "$ROOT/auth-service"
    DATABASE_URL="$AUTH_DATABASE_URL" npx drizzle-kit push --force
  )
else
  log "Skip auth schema: node_modules missing"
fi

if [ -d "$ROOT/bazi/node_modules" ]; then
  log "Pushing bazi schema"
  (
    cd "$ROOT/bazi"
    DATABASE_URL="$BAZI_DATABASE_URL" npx drizzle-kit push --force
  )
else
  log "Skip bazi schema: node_modules missing"
fi

if [ -d "$ROOT/tarot/node_modules" ]; then
  log "Applying tarot Prisma schema (db push; migrate history is not linear on a fresh DB)"
  (
    cd "$ROOT/tarot"
    DATABASE_URL="$TAROT_DATABASE_URL" npx prisma db push --skip-generate
    DATABASE_URL="$TAROT_DATABASE_URL" npx prisma generate
  ) || log "tarot schema failed (non-fatal)"
else
  log "Skip tarot schema: node_modules missing"
fi

if [ -d "$ROOT/cms/node_modules" ]; then
  log "Running cms Payload migrate"
  mkdir -p /tmp/orasage-cms-media
  (
    cd "$ROOT/cms"
    DATABASE_URL="$CMS_DATABASE_URL" PAYLOAD_SECRET="$PAYLOAD_SECRET" npm run migrate
  ) || log "cms migrate failed (non-fatal; start cms later with npm run migrate)"
else
  log "Skip cms migrate: node_modules missing"
fi

log "Cloud Agent local stack is ready (postgres + schema). Start apps via terminals or npm run dev."

#!/usr/bin/env bash
# Create PostgreSQL databases for bazi and tarot on the same instance as auth/cms.
set -euo pipefail

PG_USER="${PG_USER:-orasage}"
PG_HOST="${PG_HOST:-127.0.0.1}"
PG_PORT="${PG_PORT:-5432}"

log() { echo "[db-migration] $*"; }

for db in orasage_bazi orasage_tarot; do
  log "Ensuring database $db exists..."
  sudo -u postgres psql -v ON_ERROR_STOP=1 <<SQL
SELECT 'CREATE DATABASE ${db} OWNER ${PG_USER}'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '${db}')\gexec
GRANT ALL PRIVILEGES ON DATABASE ${db} TO ${PG_USER};
SQL
done

log "Done. Example URLs:"
log "  bazi:  postgresql://${PG_USER}:<password>@${PG_HOST}:${PG_PORT}/orasage_bazi"
log "  tarot: postgresql://${PG_USER}:<password>@${PG_HOST}:${PG_PORT}/orasage_tarot"

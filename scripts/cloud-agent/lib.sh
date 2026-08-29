#!/usr/bin/env bash
# Shared local-dev defaults for Cloud Agent install/start. Not for production.
# Password and JWT values are well-known local dummies, never used on the VPS.

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

PG_USER="${PG_USER:-orasage}"
PG_PASSWORD="${PG_PASSWORD:-orasage}"
PG_HOST="${PG_HOST:-127.0.0.1}"
PG_PORT="${PG_PORT:-5432}"

# Local-only dummy (≥32 chars). Matches across auth / shop / admin / fortune apps.
JWT_SECRET="${JWT_SECRET:-orasage-cloud-agent-local-dev-jwt-secret-do-not-use-in-prod}"
PAYLOAD_SECRET="${PAYLOAD_SECRET:-orasage-cloud-agent-local-payload-secret-32chars}"

AUTH_DATABASE_URL="postgres://${PG_USER}:${PG_PASSWORD}@${PG_HOST}:${PG_PORT}/orasage_auth"
CMS_DATABASE_URL="postgresql://${PG_USER}:${PG_PASSWORD}@${PG_HOST}:${PG_PORT}/orasage_cms"
BAZI_DATABASE_URL="postgresql://${PG_USER}:${PG_PASSWORD}@${PG_HOST}:${PG_PORT}/orasage_bazi"
TAROT_DATABASE_URL="postgresql://${PG_USER}:${PG_PASSWORD}@${PG_HOST}:${PG_PORT}/orasage_tarot"

log() { echo "[cloud-agent] $*"; }

write_if_missing() {
  local path="$1"
  local contents="$2"
  if [ -f "$path" ]; then
    log "keep existing $path"
    return 0
  fi
  mkdir -p "$(dirname "$path")"
  printf '%s\n' "$contents" >"$path"
  log "wrote $path"
}

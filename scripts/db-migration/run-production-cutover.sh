#!/usr/bin/env bash
# Production cutover: MySQL → PostgreSQL for bazi + tarot on VPS.
# Run on VPS as root or with sudo where noted.
set -euo pipefail

DEPLOY_DIR="${DEPLOY_DIR:-/opt/orasage}"
REF="${ORASAGE_REF:-cursor/postgres-migration-2e83}"
LOG_PREFIX="[cutover]"

log() { echo "$(date '+%H:%M:%S') $LOG_PREFIX $*"; }

require_file() {
  [ -f "$1" ] || { log "Missing file: $1"; exit 1; }
}

load_env_file() {
  # shellcheck disable=SC1090
  set -a
  source "$1"
  set +a
}

log "Syncing repository (ref=$REF)..."
cd "$DEPLOY_DIR"
git fetch --all --prune
git checkout "$REF"
git pull --ff-only origin "$REF" 2>/dev/null || true

require_file "$DEPLOY_DIR/.env"
require_file "$DEPLOY_DIR/bazi/.env"
require_file "$DEPLOY_DIR/tarot/.env"

load_env_file "$DEPLOY_DIR/.env"
AUTH_PG_URL="$DATABASE_URL"
PG_USER="$(echo "$AUTH_PG_URL" | sed -E 's|postgresql://([^:]+):.*|\1|')"
PG_PASS="$(echo "$AUTH_PG_URL" | sed -E 's|postgresql://[^:]+:([^@]+)@.*|\1|')"
PG_HOST="$(echo "$AUTH_PG_URL" | sed -E 's|.*@([^:/]+).*|\1|')"
PG_PORT="$(echo "$AUTH_PG_URL" | sed -E 's|.*:([0-9]+)/.*|\1|')"

PG_BAZI_URL="postgresql://${PG_USER}:${PG_PASS}@${PG_HOST}:${PG_PORT}/orasage_bazi"
PG_TAROT_URL="postgresql://${PG_USER}:${PG_PASS}@${PG_HOST}:${PG_PORT}/orasage_tarot"

load_env_file "$DEPLOY_DIR/bazi/.env"
MYSQL_BAZI_URL="$DATABASE_URL"
load_env_file "$DEPLOY_DIR/tarot/.env"
MYSQL_TAROT_URL="${DATABASE_URL//\'/}"

export PG_USER PG_HOST PG_PORT

log "Creating PostgreSQL databases..."
bash "$DEPLOY_DIR/scripts/db-migration/create-pg-databases.sh"

log "Stopping bazi + tarot..."
sudo systemctl stop orasage-bazi orasage-tarot

log "Applying tarot schema..."
cd "$DEPLOY_DIR/tarot"
npm ci --include=dev
DATABASE_URL="$PG_TAROT_URL" npx prisma migrate deploy

log "Applying bazi schema..."
cd "$DEPLOY_DIR/bazi"
export CI=true
pnpm install --frozen-lockfile --force
DATABASE_URL="$PG_BAZI_URL" npx drizzle-kit push --force

log "Importing data from MySQL..."
cd "$DEPLOY_DIR/scripts/db-migration"
npm install
export MYSQL_BAZI_URL MYSQL_TAROT_URL PG_BAZI_URL PG_TAROT_URL
MYSQL_URL="$MYSQL_TAROT_URL" PG_URL="$PG_TAROT_URL" node import-tarot.mjs
MYSQL_URL="$MYSQL_BAZI_URL" PG_URL="$PG_BAZI_URL" node import-bazi.mjs
node verify-counts.mjs

log "Updating .env to PostgreSQL..."
sudo sed -i "s|^DATABASE_URL=.*|DATABASE_URL=${PG_BAZI_URL}|" "$DEPLOY_DIR/bazi/.env"
sudo sed -i "s|^DATABASE_URL=.*|DATABASE_URL='${PG_TAROT_URL}'|" "$DEPLOY_DIR/tarot/.env"

log "Rebuilding and restarting apps..."
cd "$DEPLOY_DIR"
sudo ORASAGE_REF="$REF" DEPLOY_DIR="$DEPLOY_DIR" bash deploy/tarot/deploy-tarot.sh
sudo ORASAGE_REF="$REF" DEPLOY_DIR="$DEPLOY_DIR" bash deploy/bazi/deploy-bazi.sh

log "Smoke checks..."
sleep 3
curl -sf -o /dev/null -w "tarot:%{http_code}\n" http://127.0.0.1:3112/
curl -sf -o /dev/null -w "bazi:%{http_code}\n" http://127.0.0.1:3110/

log "Cutover complete. Run decommission after manual smoke:"
log "  CONFIRM_DECOMMISSION=yes sudo bash $DEPLOY_DIR/scripts/db-migration/decommission-mysql.sh"

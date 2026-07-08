#!/usr/bin/env bash
# Full cutover helper: import data from MySQL into PostgreSQL, then verify row counts.
#
# Required env:
#   MYSQL_BAZI_URL   e.g. mysql://orasage:pass@127.0.0.1:3306/bazi_calculator
#   MYSQL_TAROT_URL  e.g. mysql://orasage:pass@127.0.0.1:3306/tarot
#   PG_BAZI_URL      e.g. postgresql://orasage:pass@127.0.0.1:5432/orasage_bazi
#   PG_TAROT_URL     e.g. postgresql://orasage:pass@127.0.0.1:5432/orasage_tarot
#
# Usage:
#   1. Stop bazi + tarot services
#   2. bash create-pg-databases.sh
#   3. Apply schemas (see README)
#   4. bash run-cutover.sh
#   5. Update .env DATABASE_URL to PG URLs, redeploy apps
#   6. bash verify-counts.mjs (or npm run verify)
#   7. bash decommission-mysql.sh

set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

log() { echo "[cutover] $*"; }

require_env() {
  for v in "$@"; do
    if [ -z "${!v:-}" ]; then
      log "Missing env: $v"
      exit 1
    fi
  done
}

require_env MYSQL_BAZI_URL MYSQL_TAROT_URL PG_BAZI_URL PG_TAROT_URL

log "Importing tarot..."
MYSQL_URL="$MYSQL_TAROT_URL" PG_URL="$PG_TAROT_URL" node import-tarot.mjs

log "Importing bazi..."
MYSQL_URL="$MYSQL_BAZI_URL" PG_URL="$PG_BAZI_URL" node import-bazi.mjs

log "Verifying row counts..."
MYSQL_BAZI_URL="$MYSQL_BAZI_URL" MYSQL_TAROT_URL="$MYSQL_TAROT_URL" \
  PG_BAZI_URL="$PG_BAZI_URL" PG_TAROT_URL="$PG_TAROT_URL" \
  node verify-counts.mjs

log "Cutover data import complete. Update app .env to PG URLs and restart services."

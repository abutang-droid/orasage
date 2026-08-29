#!/usr/bin/env bash
# Idempotent Cloud Agent install: system PostgreSQL + npm/pnpm deps + local env files.
# Does not start servers or apply schema (see start.sh).
set -euo pipefail
# shellcheck source=lib.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib.sh"

mkdir -p "${HOME}/.ssh"
chmod 700 "${HOME}/.ssh"

log "Node $(node -v) npm $(npm -v)"

if ! command -v psql >/dev/null 2>&1 || ! command -v pg_lsclusters >/dev/null 2>&1; then
  log "Installing PostgreSQL 16"
  sudo apt-get update -y
  sudo DEBIAN_FRONTEND=noninteractive apt-get install -y postgresql postgresql-contrib
else
  log "PostgreSQL already installed"
fi

if ! command -v pnpm >/dev/null 2>&1; then
  log "Enabling pnpm via corepack"
  corepack enable
  corepack prepare pnpm@10.4.1 --activate
fi

npm_ci() {
  local dir="$1"
  log "npm install in $dir"
  if [ -f "$dir/package-lock.json" ]; then
    if ! npm ci --prefix "$dir" --no-audit --no-fund; then
      log "npm ci failed in $dir (lockfile drift); falling back to npm install"
      npm install --prefix "$dir" --no-audit --no-fund
    fi
  else
    npm install --prefix "$dir" --no-audit --no-fund
  fi
}

log "Installing workspace packages"
npm_ci "$ROOT"

npm_ci "$ROOT/auth-service"
npm_ci "$ROOT/main"
npm_ci "$ROOT/shop"
npm_ci "$ROOT/admin"

log "Installing cms (Payload)"
npm_ci "$ROOT/cms"

log "Installing ziwei (skip husky git hooks)"
if ! HUSKY=0 npm ci --prefix "$ROOT/ziwei" --no-audit --no-fund; then
  log "npm ci failed in ziwei; falling back to npm install"
  HUSKY=0 npm install --prefix "$ROOT/ziwei" --no-audit --no-fund
fi

log "Installing tarot"
npm_ci "$ROOT/tarot"

log "Installing bazi with pnpm"
(
  cd "$ROOT/bazi"
  corepack enable
  if [ -f pnpm-lock.yaml ]; then
    pnpm install --frozen-lockfile || pnpm install
  else
    pnpm install
  fi
)

bash "$ROOT/scripts/cloud-agent/write-local-env.sh"

log "Install complete"

#!/usr/bin/env bash
# Remove MariaDB/MySQL after PostgreSQL cutover is verified.
# This is destructive — only run after verify-counts.mjs passes and smoke tests succeed.
set -euo pipefail

log() { echo "[decommission-mysql] $*"; }

if [ "${CONFIRM_DECOMMISSION:-}" != "yes" ]; then
  log "Refusing to run without CONFIRM_DECOMMISSION=yes"
  log "Example: CONFIRM_DECOMMISSION=yes bash decommission-mysql.sh"
  exit 1
fi

for svc in orasage-bazi orasage-tarot; do
  if systemctl is-active --quiet "$svc" 2>/dev/null; then
    log "Stopping $svc before MySQL removal..."
    systemctl stop "$svc"
  fi
done

for svc in mariadb mysql; do
  if systemctl list-unit-files "${svc}.service" 2>/dev/null | grep -q "${svc}.service"; then
    if systemctl is-active --quiet "$svc" 2>/dev/null; then
      log "Stopping $svc..."
      systemctl stop "$svc"
      systemctl disable "$svc"
    fi
  fi
done

if command -v mysql >/dev/null 2>&1; then
  log "Purging MySQL/MariaDB packages..."
  apt-get purge -y mysql-server mysql-client mysql-common mariadb-server mariadb-client mariadb-common 2>/dev/null || true
  apt-get autoremove -y 2>/dev/null || true
  rm -rf /var/lib/mysql
  log "MySQL data directory removed."
else
  log "MySQL client not installed — nothing to purge."
fi

log "MySQL decommission complete. PostgreSQL is now the only database engine."

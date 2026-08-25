#!/usr/bin/env bash
# GCE metadata startup-script：安装系统依赖、PostgreSQL、克隆仓库。
# 由 deploy/gcp/create-instance.sh 注入；也可在已有 VM 上手动执行。
# 注意：不自动部署带密钥的 App（需人工写 .env 后再 bootstrap）。

set -euo pipefail
exec > >(tee -a /var/log/orasage-startup.log) 2>&1

DEPLOY_DIR="${DEPLOY_DIR:-/opt/orasage}"
REPO_URL="${REPO_URL:-https://github.com/abutang-droid/orasage.git}"
ORASAGE_REF="${ORASAGE_REF:-main}"
PG_USER="${PG_USER:-orasage}"
# 首次启动生成随机库密码，写入 /root/orasage-pg-password（仅 root 可读）
PG_PASS_FILE="/root/orasage-pg-password"

log() { echo "[$(date '+%F %T')] [startup] $*"; }

export DEBIAN_FRONTEND=noninteractive

log "apt update + base packages"
apt-get update -qq
apt-get install -y -qq nginx certbot python3-certbot-nginx git curl ca-certificates gnupg redis-server \
  postgresql postgresql-contrib

# Node.js 22
if ! command -v node >/dev/null 2>&1 || [ "$(node -v | sed 's/^v//' | cut -d. -f1)" -lt 22 ]; then
  log "install Node.js 22"
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y -qq nodejs
fi
corepack enable 2>/dev/null || npm install -g pnpm

systemctl enable --now redis-server
systemctl enable --now postgresql

if [ ! -f "$PG_PASS_FILE" ]; then
  openssl rand -base64 24 | tr -d '/+=' | head -c 24 > "$PG_PASS_FILE"
  chmod 600 "$PG_PASS_FILE"
fi
PG_PASS="$(cat "$PG_PASS_FILE")"

log "ensure postgres role + databases"
sudo -u postgres psql -v ON_ERROR_STOP=1 <<SQL
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${PG_USER}') THEN
    CREATE ROLE ${PG_USER} LOGIN PASSWORD '${PG_PASS}';
  ELSE
    ALTER ROLE ${PG_USER} WITH PASSWORD '${PG_PASS}';
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

# 允许本机密码登录（App 用 DATABASE_URL）
PG_HBA="$(sudo -u postgres psql -tA -c "SHOW hba_file")"
if [ -n "$PG_HBA" ] && ! grep -q "orasage local md5" "$PG_HBA" 2>/dev/null; then
  echo "# orasage local md5" >> "$PG_HBA"
  echo "host    all             ${PG_USER}       127.0.0.1/32            scram-sha-256" >> "$PG_HBA"
  systemctl reload postgresql
fi

log "clone / update repo → $DEPLOY_DIR"
mkdir -p "$DEPLOY_DIR"
if [ -d "$DEPLOY_DIR/.git" ]; then
  git -C "$DEPLOY_DIR" fetch --all --prune || true
  git -C "$DEPLOY_DIR" checkout "$ORASAGE_REF" 2>/dev/null || git -C "$DEPLOY_DIR" checkout main || true
  git -C "$DEPLOY_DIR" pull --ff-only origin "$ORASAGE_REF" 2>/dev/null \
    || git -C "$DEPLOY_DIR" pull --ff-only || true
else
  git clone --branch "$ORASAGE_REF" "$REPO_URL" "$DEPLOY_DIR" \
    || git clone "$REPO_URL" "$DEPLOY_DIR"
fi

# 部署用户：优先 ubuntu
if id ubuntu >/dev/null 2>&1; then
  chown -R ubuntu:ubuntu "$DEPLOY_DIR"
fi

# 临时 HTTP bootstrap nginx（证书申请前）
if [ -f "$DEPLOY_DIR/deploy/nginx/orasage-http-bootstrap.conf" ]; then
  cp "$DEPLOY_DIR/deploy/nginx/orasage-http-bootstrap.conf" /etc/nginx/sites-available/orasage
  ln -sf /etc/nginx/sites-available/orasage /etc/nginx/sites-enabled/orasage
  rm -f /etc/nginx/sites-enabled/default
  nginx -t && systemctl enable --now nginx && systemctl reload nginx || true
fi

log "startup base complete"
log "PG password file: $PG_PASS_FILE"
log "Next: configure App .env files, point DNS, then:"
log "  sudo -u ubuntu ORASAGE_REF=${ORASAGE_REF} bash ${DEPLOY_DIR}/deploy/bootstrap-all-on-vps.sh"

#!/usr/bin/env bash
# VPS 端 cms（Payload CMS）部署脚本
# 在 VPS 上执行: sudo bash deploy/cms/deploy-cms.sh
#
# 前置条件:
#   - PostgreSQL 已运行（与 auth/shop 共用实例）
#   - /opt/orasage/cms/.env 已配置 DATABASE_URL / PAYLOAD_SECRET

set -euo pipefail

DEPLOY_DIR="${DEPLOY_DIR:-/opt/orasage}"
APP_DIR="$DEPLOY_DIR/cms"

# shellcheck disable=SC1091
source "$DEPLOY_DIR/deploy/lib/load-env.sh" 2>/dev/null || true

log() { echo "[$(date '+%H:%M:%S')] [cms] $*"; }

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || { log "缺少命令: $1"; exit 1; }
}

sync_config_repo() {
  log "同步 orasage 仓库..."
  if [ -d "$DEPLOY_DIR/.git" ]; then
    git -C "$DEPLOY_DIR" fetch --all --prune
    git -C "$DEPLOY_DIR" checkout "${ORASAGE_REF:-main}" 2>/dev/null || git -C "$DEPLOY_DIR" checkout main
    git -C "$DEPLOY_DIR" pull --ff-only || true
  fi
}

ensure_env() {
  if [ ! -f "$APP_DIR/.env" ]; then
    if [ -f "$APP_DIR/.env.example" ]; then
      cp "$APP_DIR/.env.example" "$APP_DIR/.env"
      log "已从模板创建 $APP_DIR/.env，请配置 DATABASE_URL 与 PAYLOAD_SECRET 后重试"
      exit 1
    fi
    log "错误: $APP_DIR/.env 不存在"
    exit 1
  fi

  set -a
  load_dotenv "$APP_DIR/.env"
  set +u

  if [ -z "${DATABASE_URL:-}" ]; then
    log "错误: cms/.env 缺少 DATABASE_URL"
    exit 1
  fi
  if [ -z "${PAYLOAD_SECRET:-}" ] || [ "$PAYLOAD_SECRET" = "change-me-to-a-random-string-at-least-32-chars" ]; then
    log "错误: cms/.env 缺少有效的 PAYLOAD_SECRET（至少 32 位随机字符串）"
    exit 1
  fi
  if [ -z "${JWT_SECRET:-}" ]; then
    log "警告: cms/.env 缺少 JWT_SECRET（需与 auth-service 相同，用于 SSO）"
  fi
  export NEXT_PUBLIC_SERVER_URL="${NEXT_PUBLIC_SERVER_URL:-https://admin.orasage.com/cms}"
  export CMS_BASE_PATH="${CMS_BASE_PATH:-/cms}"
  set -u
}

try_create_database() {
  if psql "$DATABASE_URL" -c "SELECT 1" >/dev/null 2>&1; then
    log "PostgreSQL 连接正常"
    return 0
  fi

  log "无法连接 $DATABASE_URL，尝试创建数据库 orasage_cms..."

  local auth_url=""
  if [ -f "$DEPLOY_DIR/.env" ]; then
    auth_url=$(grep '^DATABASE_URL=' "$DEPLOY_DIR/.env" | cut -d= -f2- | tr -d "'\"")
  fi

  if [ -n "$auth_url" ]; then
    local db_name
    db_name=$(echo "$DATABASE_URL" | sed -E 's|.*/([^/?]+).*|\1|')
    psql "$auth_url" -c "CREATE DATABASE ${db_name};" 2>/dev/null || true
    if psql "$DATABASE_URL" -c "SELECT 1" >/dev/null 2>&1; then
      log "数据库 ${db_name} 已就绪"
      return 0
    fi
  fi

  log "错误: 无法连接 CMS 数据库。请手动执行:"
  log "  sudo -u postgres psql -c \"CREATE DATABASE orasage_cms OWNER orasage;\""
  exit 1
}

deploy_native() {
  log "部署 cms（Payload）..."
  require_cmd npm

  cd "$APP_DIR"
  npm ci
  npm run migrate
  npm run seed:tarot 2>/dev/null || log "seed:tarot 跳过（需 tsx / 已种子化）"
  npm run seed:tarot-geo 2>/dev/null || log "seed:tarot-geo 跳过（需 tsx / 已种子化）"
  npm run build

  RUN_USER="${SUDO_USER:-${USER:-ubuntu}}"
  chown -R "$RUN_USER:$RUN_USER" "$APP_DIR"

  cp "$DEPLOY_DIR/deploy/cms/orasage-cms.service" /etc/systemd/system/
  systemctl daemon-reload
  systemctl enable orasage-cms
  systemctl restart orasage-cms
}

ensure_nginx() {
  if [ -f "$DEPLOY_DIR/deploy/nginx/orasage.conf" ]; then
    cp "$DEPLOY_DIR/deploy/nginx/orasage.conf" /etc/nginx/sites-available/orasage
    ln -sf /etc/nginx/sites-available/orasage /etc/nginx/sites-enabled/orasage
    nginx -t
    systemctl reload nginx
  fi
}

verify() {
  sleep 3
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 http://127.0.0.1:3120/cms/admin || echo "000")
  log "  127.0.0.1:3120/cms/admin → HTTP $code"
  blocked=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 -L https://cms.orasage.com/admin || echo "000")
  log "  https://cms.orasage.com/admin → HTTP $blocked (期望 301 链至 admin/cms/admin)"
  admin_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 https://admin.orasage.com/cms/admin || echo "000")
  log "  https://admin.orasage.com/cms/admin → HTTP $admin_code"
}

# ── main ──────────────────────────────────────────────────────
log "开始部署 cms..."
require_cmd git
require_cmd curl
sync_config_repo
ensure_env
try_create_database
deploy_native
ensure_nginx
verify
log "cms 部署完成 → https://admin.orasage.com/cms/admin（cms.orasage.com 公网已封禁）"

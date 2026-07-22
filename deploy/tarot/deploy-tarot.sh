#!/usr/bin/env bash
# VPS 端 tarot 部署脚本
# 在 VPS 上执行: sudo bash deploy-tarot.sh
# 或从 remote-deploy-tarot.sh 远程调用
#
# 模式:
#   native (默认) — 构建本仓库内已 vendor 进来的 tarot/ 源码
#                    （对应 abutang-droid/tarot-mind），systemd 常驻运行。
#                    需要 PostgreSQL（DATABASE_URL）+ JWT_SECRET（与 auth-service 共享）。
#   proxy         — 回滚用：3112 反代到迁移前的现有线上服务
#                    （需显式提供 TAROT_UPSTREAM_URL，本仓库未曾确认过真实地址）。

set -euo pipefail

DEPLOY_DIR="${DEPLOY_DIR:-/opt/orasage}"
APP_DIR="$DEPLOY_DIR/tarot"
PROXY_DIR="$DEPLOY_DIR/deploy/tarot"
MODE="${DEPLOY_MODE:-native}"

# shellcheck disable=SC1091
source "$DEPLOY_DIR/deploy/lib/load-env.sh"

log() { echo "[$(date '+%H:%M:%S')] [tarot] $*"; }

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || { log "缺少命令: $1"; exit 1; }
}

sync_config_repo() {
  log "同步 orasage 仓库..."
  mkdir -p "$DEPLOY_DIR"
  if [ -d "$DEPLOY_DIR/.git" ]; then
    git -C "$DEPLOY_DIR" fetch --all --prune
    git -C "$DEPLOY_DIR" checkout "${ORASAGE_REF:-main}" 2>/dev/null || git -C "$DEPLOY_DIR" checkout main
    git -C "$DEPLOY_DIR" pull --ff-only || true
  else
    git clone https://github.com/abutang-droid/orasage.git "$DEPLOY_DIR"
  fi
}

deploy_native() {
  log "部署 native 模式（自托管，源码见 $APP_DIR）..."
  require_cmd npm

  if [ ! -f "$APP_DIR/.env" ] && [ -f "$APP_DIR/.env.example" ]; then
    log "警告: $APP_DIR/.env 不存在，从模板创建（请检查 DATABASE_URL / JWT_SECRET）"
    cp "$APP_DIR/.env.example" "$APP_DIR/.env"
  fi

  cd "$APP_DIR"
  for pkg in packages/ui packages/tokens packages/i18n; do
    if [ -f "$DEPLOY_DIR/$pkg/package.json" ]; then
      log "安装 $pkg 依赖..."
      (cd "$DEPLOY_DIR/$pkg" && npm install --no-audit --no-fund)
    fi
  done
  npm ci --include=dev

  set -a
  if [ -f .env ]; then
    load_dotenv .env
  fi
  set +a

  ensure_tarot_env_kv() {
    local key="$1" val="$2"
    local file="$APP_DIR/.env"
    touch "$file"
    if grep -q "^${key}=" "$file" 2>/dev/null; then
      sed -i "s|^${key}=.*|${key}=${val}|" "$file"
    else
      echo "${key}=${val}" >> "$file"
    fi
  }
  ensure_tarot_env_kv MERIT_SHARE_PATH_ENABLED true

  NGINX_SITE="${NGINX_SITE:-orasage}"
  if [ -f "$DEPLOY_DIR/deploy/lib/site-env.sh" ]; then
    # shellcheck disable=SC1091
    source "$DEPLOY_DIR/deploy/lib/site-env.sh"
    apply_site_env
  fi

  # Persist public URLs into .env so rebuilds / runtime match the deployment apex
  ensure_tarot_env_kv SITE_APEX "${SITE_APEX:-orasage.com}"
  ensure_tarot_env_kv NEXT_PUBLIC_SITE_APEX "${SITE_APEX:-orasage.com}"
  ensure_tarot_env_kv NEXT_PUBLIC_SITE_URL "${TAROT_URL:-https://tarot.${SITE_APEX:-orasage.com}}"
  ensure_tarot_env_kv NEXT_PUBLIC_APP_URL "${TAROT_URL:-https://tarot.${SITE_APEX:-orasage.com}}"
  ensure_tarot_env_kv NEXT_PUBLIC_MAIN_URL "${APP_URL:-https://${SITE_APEX:-orasage.com}}"
  ensure_tarot_env_kv NEXT_PUBLIC_AUTH_URL "${AUTH_URL:-https://auth.${SITE_APEX:-orasage.com}}"
  ensure_tarot_env_kv NEXT_PUBLIC_SHOP_URL "${SHOP_URL:-https://shop.${SITE_APEX:-orasage.com}}"
  ensure_tarot_env_kv NEXT_PUBLIC_CMS_URL "${CMS_PUBLIC_URL:-https://admin.${SITE_APEX:-orasage.com}/cms}"
  ensure_tarot_env_kv AUTH_URL "${AUTH_URL:-https://auth.${SITE_APEX:-orasage.com}}"
  ensure_tarot_env_kv CMS_PUBLIC_URL "${CMS_PUBLIC_URL:-https://admin.${SITE_APEX:-orasage.com}/cms}"

  set -a
  if [ -f .env ]; then
    load_dotenv .env
  fi
  set +a

  if [ -z "${DATABASE_URL:-}" ]; then
    log "错误: 缺少 DATABASE_URL（PostgreSQL），请在 $APP_DIR/.env 中配置"
    exit 1
  fi
  npx prisma migrate deploy

  export NEXT_PUBLIC_SITE_APEX="${SITE_APEX:-orasage.com}"
  export NEXT_PUBLIC_SITE_URL="${TAROT_URL:-https://tarot.${SITE_APEX:-orasage.com}}"
  export NEXT_PUBLIC_APP_URL="${TAROT_URL:-https://tarot.${SITE_APEX:-orasage.com}}"
  export NEXT_PUBLIC_MAIN_URL="${APP_URL:-https://${SITE_APEX:-orasage.com}}"
  export NEXT_PUBLIC_AUTH_URL="${AUTH_URL:-https://auth.${SITE_APEX:-orasage.com}}"
  export NEXT_PUBLIC_SHOP_URL="${SHOP_URL:-https://shop.${SITE_APEX:-orasage.com}}"
  export NEXT_PUBLIC_CMS_URL="${CMS_PUBLIC_URL:-https://admin.${SITE_APEX:-orasage.com}/cms}"

  npm run build

  # Install unit with correct npm path when /usr/local/bin/npm is missing
  UNIT_SRC="$DEPLOY_DIR/deploy/tarot/orasage-tarot.service"
  UNIT_DST=/etc/systemd/system/orasage-tarot.service
  cp "$UNIT_SRC" "$UNIT_DST"
  NPM_BIN="$(command -v npm || true)"
  if [ -n "$NPM_BIN" ] && [ "$NPM_BIN" != "/usr/local/bin/npm" ]; then
    sed -i "s|/usr/local/bin/npm|${NPM_BIN}|g" "$UNIT_DST"
  fi
  systemctl daemon-reload
  systemctl enable orasage-tarot
  systemctl restart orasage-tarot
}

deploy_proxy() {
  if [ -z "${TAROT_UPSTREAM_URL:-}" ]; then
    log "错误: proxy 模式需要设置 TAROT_UPSTREAM_URL（塔罗现有线上服务真实地址）"
    exit 1
  fi
  log "部署 proxy 模式（回滚：3112 → ${TAROT_UPSTREAM_URL}）..."
  require_cmd docker
  systemctl stop orasage-tarot 2>/dev/null || true
  cd "$PROXY_DIR"
  if [ -f .env ]; then
    set -a && source .env && set +a
  elif [ -f .env.example ]; then
    cp .env.example .env
    set -a && source .env && set +a
  fi
  docker compose build --pull
  docker compose up -d --remove-orphans
}

ensure_nginx() {
  log "确保 Nginx 配置 (NGINX_SITE=${NGINX_SITE:-orasage})..."
  if [ -f "$DEPLOY_DIR/deploy/lib/nginx-site.sh" ]; then
    # shellcheck source=../lib/nginx-site.sh
    source "$DEPLOY_DIR/deploy/lib/nginx-site.sh"
    install_nginx_site
    return
  fi
  NGINX_CONF="/etc/nginx/sites-available/orasage"
  if [ -f "$DEPLOY_DIR/deploy/nginx/orasage.conf" ]; then
    cp "$DEPLOY_DIR/deploy/nginx/orasage.conf" "$NGINX_CONF"
  fi
  ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/orasage
  nginx -t
  systemctl reload nginx
}

verify() {
  log "验证本地 3112 端口..."
  sleep 2
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 http://127.0.0.1:3112/ || echo "000")
  log "  127.0.0.1:3112/ → HTTP $code"
  if [ "$code" != "200" ]; then
    log "警告: 健康检查未通过，请检查日志"
    if [ "$MODE" = "native" ]; then
      journalctl -u orasage-tarot -n 30 --no-pager 2>/dev/null || true
    else
      docker compose -f "$PROXY_DIR/docker-compose.yml" logs --tail 30 2>/dev/null || true
    fi
  fi
  ext_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "https://tarot.${SITE_APEX:-orasage.com}" || echo "000")
  log "  https://tarot.${SITE_APEX:-orasage.com} → HTTP $ext_code"
}

# ── main ──────────────────────────────────────────────────────
log "开始部署 tarot（模式: $MODE）..."
require_cmd git
require_cmd curl

# Avoid dubious ownership when script is run via sudo
git config --global --add safe.directory "$DEPLOY_DIR" 2>/dev/null || true

sync_config_repo

case "$MODE" in
  native) deploy_native ;;
  proxy)  deploy_proxy ;;
  *)      log "未知 DEPLOY_MODE=$MODE（支持 native | proxy）"; exit 1 ;;
esac

ensure_nginx
verify
log "tarot 部署完成 → https://tarot.${SITE_APEX:-orasage.com}"

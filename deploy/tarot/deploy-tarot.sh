#!/usr/bin/env bash
# VPS 端 tarot 部署脚本
# 在 VPS 上执行: sudo bash deploy-tarot.sh
# 或从 remote-deploy-tarot.sh 远程调用
#
# 模式:
#   native (默认) — 构建本仓库内已 vendor 进来的 tarot/ 源码
#                    （对应 abutang-droid/tarot-mind），systemd 常驻运行。
#                    需要 MySQL（DATABASE_URL）+ JWT_SECRET（与 auth-service 共享）。
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
  npm ci --include=dev

  set -a
  if [ -f .env ]; then
    load_dotenv .env
  fi
  set +a

  if [ -z "${DATABASE_URL:-}" ]; then
    log "错误: 缺少 DATABASE_URL（MySQL），请在 $APP_DIR/.env 中配置"
    exit 1
  fi
  npx prisma db push

  npm run build

  cp "$DEPLOY_DIR/deploy/tarot/orasage-tarot.service" /etc/systemd/system/
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
  log "确保 Nginx 配置..."
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
  ext_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 https://tarot.orasage.com || echo "000")
  log "  https://tarot.orasage.com → HTTP $ext_code"
}

# ── main ──────────────────────────────────────────────────────
log "开始部署 tarot（模式: $MODE）..."
require_cmd git
require_cmd curl
sync_config_repo

case "$MODE" in
  native) deploy_native ;;
  proxy)  deploy_proxy ;;
  *)      log "未知 DEPLOY_MODE=$MODE（支持 native | proxy）"; exit 1 ;;
esac

ensure_nginx
verify
log "tarot 部署完成 → https://tarot.orasage.com"

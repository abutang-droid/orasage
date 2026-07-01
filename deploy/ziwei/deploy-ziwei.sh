#!/usr/bin/env bash
# VPS 端 ziwei 部署脚本
# 在 VPS 上执行: sudo bash deploy-ziwei.sh
# 或从 remote-deploy-ziwei.sh 远程调用
#
# 模式:
#   native (默认) — 构建本仓库内已 vendor 进来的 ziwei/ 源码
#                    （对应 abutang-droid/ziwei-doushu），systemd 常驻运行。
#                    无数据库依赖；JWT_SECRET/AUTH_URL 用于桥接 orasage 统一登录，
#                    未配置时退化为纯匿名模式（不影响现有体验）。
#   proxy         — 回滚用：3111 反代到迁移前的现有线上服务。

set -euo pipefail

DEPLOY_DIR="${DEPLOY_DIR:-/opt/orasage}"
APP_DIR="$DEPLOY_DIR/ziwei"
PROXY_DIR="$DEPLOY_DIR/deploy/ziwei"
MODE="${DEPLOY_MODE:-native}"

log() { echo "[$(date '+%H:%M:%S')] [ziwei] $*"; }

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
    log "警告: $APP_DIR/.env 不存在，从模板创建"
    cp "$APP_DIR/.env.example" "$APP_DIR/.env"
  fi

  cd "$APP_DIR"
  npm ci

  set -a
  # shellcheck disable=SC1091
  [ -f .env ] && source .env
  set +a

  npm run build

  cp "$DEPLOY_DIR/deploy/ziwei/orasage-ziwei.service" /etc/systemd/system/
  systemctl daemon-reload
  systemctl enable orasage-ziwei
  systemctl restart orasage-ziwei
}

deploy_proxy() {
  log "部署 proxy 模式（回滚：3111 → ${ZIWEI_UPSTREAM_URL:-https://api2.lilyfunnlove.com}）..."
  require_cmd docker
  systemctl stop orasage-ziwei 2>/dev/null || true
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
  log "验证本地 3111 端口..."
  sleep 2
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 http://127.0.0.1:3111/ || echo "000")
  log "  127.0.0.1:3111/ → HTTP $code"
  if [ "$code" != "200" ] && [ "$code" != "307" ] && [ "$code" != "308" ]; then
    log "警告: 健康检查未通过，请检查日志"
    if [ "$MODE" = "native" ]; then
      journalctl -u orasage-ziwei -n 30 --no-pager 2>/dev/null || true
    else
      docker compose -f "$PROXY_DIR/docker-compose.yml" logs --tail 30 2>/dev/null || true
    fi
  fi
  ext_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 https://ziwei.orasage.com || echo "000")
  log "  https://ziwei.orasage.com → HTTP $ext_code"
}

# ── main ──────────────────────────────────────────────────────
log "开始部署 ziwei（模式: $MODE）..."
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
log "ziwei 部署完成 → https://ziwei.orasage.com"

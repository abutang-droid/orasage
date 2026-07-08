#!/usr/bin/env bash
# VPS 端 bazi 部署脚本
# 在 VPS 上执行: sudo bash deploy-bazi.sh
# 或从 remote-deploy-bazi.sh 远程调用
#
# 模式:
#   native (默认) — 构建本仓库内已 vendor 进来的 bazi/ 源码（server + client，
#                    对应 abutang-droid/bazi-calculator），通过 systemd 常驻运行。
#                    需要 PostgreSQL（DATABASE_URL）+ JWT_SECRET（与 auth-service 共享）。
#   proxy         — 回滚用：3110 反代到迁移前的现有线上服务，不需要本仓库源码。

set -euo pipefail

DEPLOY_DIR="${DEPLOY_DIR:-/opt/orasage}"
APP_DIR="$DEPLOY_DIR/bazi"
PROXY_DIR="$DEPLOY_DIR/deploy/bazi"
MODE="${DEPLOY_MODE:-native}"

# shellcheck disable=SC1091
source "$DEPLOY_DIR/deploy/lib/load-env.sh"

log() { echo "[$(date '+%H:%M:%S')] [bazi] $*"; }

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || { log "缺少命令: $1"; exit 1; }
}

sync_config_repo() {
  log "同步 orasage 仓库..."
  mkdir -p "$DEPLOY_DIR"
  if [ -d "$DEPLOY_DIR/.git" ]; then
    git -C "$DEPLOY_DIR" fetch --all --prune
    git -C "$DEPLOY_DIR" checkout "${ORASAGE_REF:-main}" 2>/dev/null || git -C "$DEPLOY_DIR" checkout main
    git -C "$DEPLOY_DIR" reset --hard "origin/${ORASAGE_REF:-main}" 2>/dev/null \
      || git -C "$DEPLOY_DIR" pull --ff-only origin "${ORASAGE_REF:-main}" 2>/dev/null \
      || git -C "$DEPLOY_DIR" pull --ff-only || true
  else
    git clone https://github.com/abutang-droid/orasage.git "$DEPLOY_DIR"
  fi
}

deploy_native() {
  log "部署 native 模式（自托管，源码见 $APP_DIR）..."
  require_cmd node

  if [ ! -f "$APP_DIR/.env" ]; then
    log "警告: $APP_DIR/.env 不存在，从模板创建（请检查 DATABASE_URL / JWT_SECRET）"
    cp "$APP_DIR/.env.example" "$APP_DIR/.env" 2>/dev/null || true
  fi

  cd "$APP_DIR"
  export CI=true
  if command -v pnpm >/dev/null 2>&1; then
    pnpm install --frozen-lockfile --force
  else
    corepack enable && corepack prepare pnpm --activate
    pnpm install --frozen-lockfile --force
  fi

  set -a
  if [ -f .env ]; then
    load_dotenv .env
  fi
  set +a

  if [ -z "${DATABASE_URL:-}" ]; then
    log "错误: 缺少 DATABASE_URL（PostgreSQL），请在 $APP_DIR/.env 中配置"
    exit 1
  fi
  npx drizzle-kit push --force

  export VITE_AUTH_URL="${VITE_AUTH_URL:-https://auth.orasage.com}"
  export VITE_LUNAR_DATA_DIR="${VITE_LUNAR_DATA_DIR:-/data}"
  # 空字符串会让 Vite 把 OAuth 门户当成已配置，前端应走 orasage auth 回退
  unset VITE_OAUTH_PORTAL_URL VITE_APP_ID 2>/dev/null || true

  pnpm run build

  log "构建版本: $(git -C "$DEPLOY_DIR" rev-parse --short HEAD 2>/dev/null || echo unknown)"

  # build 产物属主须与 systemd User= 一致。
  # 注意不能用 SUDO_USER：remote-deploy-all → bootstrap（sudo）→ 本脚本（嵌套 sudo）时
  # SUDO_USER=root，会把整个目录 chown 给 root，导致 ubuntu 运行的服务 EACCES。
  RUN_USER="${SERVICE_USER:-ubuntu}"
  mkdir -p "$APP_DIR/dist/public/reports"
  chown -R "$RUN_USER:$RUN_USER" "$APP_DIR"

  # 报告 HTML 持久目录（与 systemd 单元 REPORTS_DIR 一致），迁移 dist 内历史报告
  REPORTS_PERSIST_DIR="${REPORTS_PERSIST_DIR:-/var/lib/orasage/bazi-reports}"
  mkdir -p "$REPORTS_PERSIST_DIR"
  cp -n "$APP_DIR/dist/public/reports/"*.html "$REPORTS_PERSIST_DIR/" 2>/dev/null || true
  chown -R "$RUN_USER:$RUN_USER" "$REPORTS_PERSIST_DIR"

  cp "$DEPLOY_DIR/deploy/bazi/orasage-bazi.service" /etc/systemd/system/
  systemctl daemon-reload
  systemctl enable orasage-bazi
  systemctl restart orasage-bazi
}

deploy_proxy() {
  log "部署 proxy 模式（回滚：3110 → ${BAZI_UPSTREAM_URL:-https://api1.lilyfunnlove.com}）..."
  require_cmd docker
  systemctl stop orasage-bazi 2>/dev/null || true
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
  log "验证本地 3110 端口..."
  sleep 2
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 http://127.0.0.1:3110/ || echo "000")
  log "  127.0.0.1:3110/ → HTTP $code"
  if [ "$code" != "200" ]; then
    log "警告: 健康检查未通过，请检查日志"
    if [ "$MODE" = "native" ]; then
      journalctl -u orasage-bazi -n 30 --no-pager 2>/dev/null || true
    else
      docker compose -f "$PROXY_DIR/docker-compose.yml" logs --tail 30 2>/dev/null || true
    fi
  fi
  ext_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 https://bazi.orasage.com || echo "000")
  log "  https://bazi.orasage.com → HTTP $ext_code"
}

# ── main ──────────────────────────────────────────────────────
log "开始部署 bazi（模式: $MODE）..."
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
log "bazi 部署完成 → https://bazi.orasage.com"

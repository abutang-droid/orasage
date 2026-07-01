#!/usr/bin/env bash
# 紫微斗数 ziwei.orasage.com 部署脚本
#
# 迁移阶段（默认）：Nginx 反向代理到现有线上服务 api2.lilyfunnlove.com
# 自托管阶段：ZIWEI_MODE=local 时启动本地 :3111 服务
#
# 用法:
#   bash deploy/ziwei/deploy-ziwei.sh              # 在 VPS 上执行（代理模式）
#   ZIWEI_MODE=local bash deploy/ziwei/deploy-ziwei.sh  # 自托管模式
#
# 远程部署:
#   SSH_KEY=~/.ssh/id_rsa bash deploy/remote-deploy.sh ziwei

set -euo pipefail

DEPLOY_DIR="${DEPLOY_DIR:-/opt/orasage}"
ZIWEI_MODE="${ZIWEI_MODE:-proxy}"
ZIWEI_UPSTREAM="${ZIWEI_UPSTREAM:-https://api2.lilyfunnlove.com}"
ZIWEI_UPSTREAM_HOST="${ZIWEI_UPSTREAM_HOST:-api2.lilyfunnlove.com}"
ZIWEI_PORT="${ZIWEI_PORT:-3111}"
NGINX_CONF="/etc/nginx/sites-available/orasage"

log() { echo "[ziwei-deploy $(date '+%H:%M:%S')] $*"; }

# ── 1. 更新 Nginx 配置 ───────────────────────────────────────
log "部署 Nginx 配置（模式: $ZIWEI_MODE）..."
if [ -f "$DEPLOY_DIR/deploy/nginx/orasage.conf" ]; then
  cp "$DEPLOY_DIR/deploy/nginx/orasage.conf" "$NGINX_CONF"
  ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/orasage
else
  log "警告: 未找到 $DEPLOY_DIR/deploy/nginx/orasage.conf，跳过 Nginx 更新"
fi

# ── 2. 自托管模式：启动本地服务 ──────────────────────────────
if [ "$ZIWEI_MODE" = "local" ]; then
  ZIWEI_APP_DIR="${ZIWEI_APP_DIR:-$DEPLOY_DIR/ziwei}"

  if [ ! -d "$ZIWEI_APP_DIR" ]; then
    log "错误: 自托管模式需要 ziwei 应用目录 $ZIWEI_APP_DIR"
    log "请设置 ZIWEI_REPO 并克隆源码，或手动部署应用到该目录"
    exit 1
  fi

  log "构建并启动本地 ziwei 服务（端口 $ZIWEI_PORT）..."
  cd "$ZIWEI_APP_DIR"

  if [ -f docker-compose.yml ] || [ -f compose.yml ]; then
    docker compose up -d --build
  elif [ -f package.json ]; then
    npm ci --production=false
    npm run build
  fi

  if [ -f /etc/systemd/system/orasage-ziwei.service ]; then
    cp "$DEPLOY_DIR/deploy/ziwei/orasage-ziwei.service" /etc/systemd/system/
    systemctl daemon-reload
    systemctl enable orasage-ziwei
    systemctl restart orasage-ziwei
  else
    log "提示: 安装 systemd 服务: cp deploy/ziwei/orasage-ziwei.service /etc/systemd/system/"
  fi
else
  log "代理模式: ziwei.orasage.com → $ZIWEI_UPSTREAM"
fi

# ── 3. 重载 Nginx ────────────────────────────────────────────
if command -v nginx &>/dev/null; then
  nginx -t
  systemctl reload nginx
  log "Nginx 已重载"
fi

# ── 4. 验证 ──────────────────────────────────────────────────
log "验证 ziwei.orasage.com ..."
sleep 2
code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "https://ziwei.orasage.com" || echo "000")
log "  https://ziwei.orasage.com → HTTP $code"

if [ "$code" = "200" ] || [ "$code" = "307" ] || [ "$code" = "308" ]; then
  log "✅ 紫微应用部署成功"
else
  log "⚠️  HTTP $code — 请检查 Nginx 配置和上游服务"
  exit 1
fi

#!/usr/bin/env bash
# VPS 端 ziwei 部署脚本
# 在 VPS 上执行: sudo bash deploy-ziwei.sh
# 或从 remote-deploy-ziwei.sh 远程调用

set -euo pipefail

DEPLOY_DIR="${DEPLOY_DIR:-/opt/orasage}"
ZIWEI_DIR="$DEPLOY_DIR/ziwei"
MODE="${DEPLOY_MODE:-proxy}"
REPO_URL="${ZIWEI_REPO_URL:-}"
REPO_BRANCH="${ZIWEI_REPO_BRANCH:-main}"

log() { echo "[$(date '+%H:%M:%S')] [ziwei] $*"; }

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || { log "缺少命令: $1"; exit 1; }
}

install_docker() {
  if command -v docker >/dev/null 2>&1; then
    return
  fi
  log "安装 Docker..."
  apt-get update -qq
  apt-get install -y -qq ca-certificates curl
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
  chmod a+r /etc/apt/keyrings/docker.asc
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
    > /etc/apt/sources.list.d/docker.list
  apt-get update -qq
  apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-compose-plugin
  systemctl enable --now docker
}

sync_config_repo() {
  log "同步 orasage 配置仓库..."
  mkdir -p "$DEPLOY_DIR"
  if [ -d "$DEPLOY_DIR/.git" ]; then
    git -C "$DEPLOY_DIR" fetch --all --prune
    git -C "$DEPLOY_DIR" checkout "${ORASAGE_REF:-main}" 2>/dev/null || git -C "$DEPLOY_DIR" checkout main
    git -C "$DEPLOY_DIR" pull --ff-only || true
  else
    git clone https://github.com/abutang-droid/orasage.git "$DEPLOY_DIR"
  fi
}

deploy_proxy() {
  log "部署 proxy 模式（3111 → ${ZIWEI_UPSTREAM_URL:-https://api2.lilyfunnlove.com}）..."
  require_cmd docker
  cd "$ZIWEI_DIR"
  if [ -f .env ]; then
    set -a && source .env && set +a
  elif [ -f .env.example ]; then
    cp .env.example .env
    set -a && source .env && set +a
  fi
  docker compose build --pull
  docker compose up -d --remove-orphans
}

deploy_native() {
  log "部署 native 模式（完全自托管）..."
  if [ -z "$REPO_URL" ]; then
    log "错误: native 模式需要设置 ZIWEI_REPO_URL"
    log "示例: ZIWEI_REPO_URL=https://github.com/abutang-droid/ziwei.git DEPLOY_MODE=native bash deploy-ziwei.sh"
    exit 1
  fi
  export ZIWEI_REPO_URL="$REPO_URL"
  export ZIWEI_REPO_BRANCH="$REPO_BRANCH"
  export GITHUB_TOKEN="${GITHUB_TOKEN:-}"
  bash "$DEPLOY_DIR/deploy/ziwei/deploy-native-ziwei.sh"
}

ensure_nginx() {
  log "确保 Nginx ziwei 子域配置..."
  NGINX_CONF="/etc/nginx/sites-available/orasage"
  if [ -f "$DEPLOY_DIR/deploy/nginx/orasage-live.conf" ]; then
    cp "$DEPLOY_DIR/deploy/nginx/orasage-live.conf" "$NGINX_CONF"
  elif [ -f "$DEPLOY_DIR/deploy/nginx/orasage.conf" ]; then
    cp "$DEPLOY_DIR/deploy/nginx/orasage.conf" "$NGINX_CONF"
  fi
  ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/orasage
  nginx -t
  systemctl reload nginx
}

verify() {
  log "验证本地 3111 端口..."
  sleep 2
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 http://127.0.0.1:3111/health || echo "000")
  log "  127.0.0.1:3111/health → HTTP $code"
  if [ "$code" != "200" ]; then
    log "警告: 健康检查未通过，请检查 docker logs"
    docker compose -f "$ZIWEI_DIR/docker-compose.yml" logs --tail 30 2>/dev/null || true
  fi
  ext_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 https://ziwei.orasage.com/health || echo "000")
  log "  https://ziwei.orasage.com/health → HTTP $ext_code"
  page_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 https://ziwei.orasage.com || echo "000")
  log "  https://ziwei.orasage.com → HTTP $page_code"
}

# ── main ──────────────────────────────────────────────────────
log "开始部署 ziwei（模式: $MODE）..."
require_cmd git
require_cmd curl
install_docker
sync_config_repo

mkdir -p "$ZIWEI_DIR"
cp -r "$DEPLOY_DIR/deploy/ziwei/"* "$ZIWEI_DIR/" 2>/dev/null || true

case "$MODE" in
  proxy)  deploy_proxy ;;
  native) deploy_native ;;
  *)      log "未知 DEPLOY_MODE=$MODE（支持 proxy | native）"; exit 1 ;;
esac

ensure_nginx
verify
log "ziwei 部署完成 → https://ziwei.orasage.com"

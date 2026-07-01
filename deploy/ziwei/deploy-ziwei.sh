#!/usr/bin/env bash
# VPS 端 ziwei 部署脚本
# 在 VPS 上执行: sudo bash deploy-ziwei.sh
# 或从 remote-deploy-ziwei.sh 远程调用

set -euo pipefail

DEPLOY_DIR="${DEPLOY_DIR:-/opt/orasage}"
ZIWEI_DIR="$DEPLOY_DIR/ziwei"
MODE="${DEPLOY_MODE:-native}"
REPO_URL="${ZIWEI_REPO_URL:-https://github.com/abutang-droid/ziwei-doushu.git}"
REPO_BRANCH="${ZIWEI_REPO_BRANCH:-main}"
NATIVE_RUNTIME="${NATIVE_RUNTIME:-systemd}"
NPM_BIN="${NPM_BIN:-/usr/local/bin/npm}"

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

sync_app_source() {
  APP_SRC="$ZIWEI_DIR/app"
  if [ -d "$APP_SRC/.git" ]; then
    git -C "$APP_SRC" fetch --all --prune
    git -C "$APP_SRC" checkout "$REPO_BRANCH"
    git -C "$APP_SRC" pull --ff-only
  else
    mkdir -p "$APP_SRC"
    git clone --branch "$REPO_BRANCH" --depth 1 "$REPO_URL" "$APP_SRC"
  fi
}

deploy_native_systemd() {
  log "部署 native/systemd 模式（自托管 ziwei，端口 3111）..."
  require_cmd "$NPM_BIN"
  sync_app_source
  cd "$APP_SRC"

  if [ ! -f package.json ]; then
    log "错误: ziwei 仓库缺少 package.json，无法 systemd 部署"
    exit 1
  fi

  "$NPM_BIN" install
  if grep -q '"build"' package.json; then
    "$NPM_BIN" run build
  fi

  docker compose -f "$ZIWEI_DIR/docker-compose.yml" down 2>/dev/null || true
  docker rm -f orasage-ziwei-native 2>/dev/null || true

  sudo cp "$DEPLOY_DIR/deploy/ziwei/orasage-ziwei.service" /etc/systemd/system/
  sudo systemctl daemon-reload
  sudo systemctl enable orasage-ziwei
  sudo systemctl restart orasage-ziwei
}

deploy_native_docker() {
  log "部署 native/docker 模式（自托管 ziwei 应用）..."
  require_cmd docker
  sync_app_source
  cd "$APP_SRC"
  if [ -f Dockerfile ]; then
    docker build -t orasage-ziwei:native .
    docker rm -f orasage-ziwei-native 2>/dev/null || true
    docker run -d \
      --name orasage-ziwei-native \
      --restart unless-stopped \
      -p 127.0.0.1:3111:3111 \
      --env-file "$ZIWEI_DIR/.env" \
      orasage-ziwei:native
  elif [ -f docker-compose.yml ] || [ -f compose.yml ]; then
    COMPOSE_FILE=$(ls docker-compose.yml compose.yml 2>/dev/null | head -1)
    docker compose -f "$COMPOSE_FILE" up -d --build
  else
    log "错误: ziwei 仓库中未找到 Dockerfile、docker-compose.yml 或 package.json"
    exit 1
  fi
}

deploy_native() {
  if [ -z "$REPO_URL" ]; then
    log "错误: native 模式需要设置 ZIWEI_REPO_URL"
    exit 1
  fi
  if [ -f "$ZIWEI_DIR/.env" ]; then
    set -a && source "$ZIWEI_DIR/.env" && set +a
  elif [ -f "$ZIWEI_DIR/.env.example" ]; then
    cp "$ZIWEI_DIR/.env.example" "$ZIWEI_DIR/.env"
    set -a && source "$ZIWEI_DIR/.env" && set +a
  fi
  case "$NATIVE_RUNTIME" in
    systemd) deploy_native_systemd ;;
    docker)  deploy_native_docker ;;
    *)       log "未知 NATIVE_RUNTIME=$NATIVE_RUNTIME（支持 systemd | docker）"; exit 1 ;;
  esac
}

ensure_nginx() {
  log "确保 Nginx ziwei 子域配置..."
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
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 http://127.0.0.1:3111/health || echo "000")
  log "  127.0.0.1:3111/health → HTTP $code"
  if [ "$code" != "200" ]; then
    log "警告: 健康检查未通过"
    systemctl status orasage-ziwei --no-pager 2>/dev/null || true
    docker compose -f "$ZIWEI_DIR/docker-compose.yml" logs --tail 30 2>/dev/null || true
  fi
  ext_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 https://ziwei.orasage.com/health || echo "000")
  log "  https://ziwei.orasage.com/health → HTTP $ext_code"
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

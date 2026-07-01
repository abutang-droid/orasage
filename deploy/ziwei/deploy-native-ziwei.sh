#!/usr/bin/env bash
# 紫微完全自托管部署
# 在 VPS 上执行:
#   sudo ZIWEI_REPO_URL=https://github.com/abutang-droid/ziwei.git bash deploy-native-ziwei.sh
#
# 私有仓库:
#   sudo GITHUB_TOKEN=ghp_xxx ZIWEI_REPO_URL=... bash deploy-native-ziwei.sh

set -euo pipefail

DEPLOY_DIR="${DEPLOY_DIR:-/opt/orasage}"
ZIWEI_DIR="${DEPLOY_DIR}/ziwei"
APP_DIR="${ZIWEI_DIR}/app"
REPO_URL="${ZIWEI_REPO_URL:-}"
REPO_BRANCH="${ZIWEI_REPO_BRANCH:-main}"
GITHUB_TOKEN="${GITHUB_TOKEN:-}"

log() { echo "[native-ziwei $(date '+%H:%M:%S')] $*"; }

[ "$(id -u)" -eq 0 ] || { log "请 sudo 运行"; exit 1; }
[ -n "$REPO_URL" ] || { log "请设置 ZIWEI_REPO_URL，例如: https://github.com/abutang-droid/ziwei.git"; exit 1; }

# ── 安装依赖 ─────────────────────────────────────────────────
if ! command -v docker >/dev/null 2>&1; then
  apt-get update -qq && apt-get install -y -qq docker.io docker-compose-plugin git
  systemctl enable --now docker
fi

# ── 停止迁移代理 ─────────────────────────────────────────────
docker compose -f "${ZIWEI_DIR}/docker-compose.yml" down 2>/dev/null || true
docker rm -f orasage-ziwei-native 2>/dev/null || true

# ── 克隆源码 ─────────────────────────────────────────────────
mkdir -p "$ZIWEI_DIR"
CLONE_URL="$REPO_URL"
if [ -n "$GITHUB_TOKEN" ]; then
  CLONE_URL=$(echo "$REPO_URL" | sed "s|https://|https://x-access-token:${GITHUB_TOKEN}@|")
fi

if [ -d "$APP_DIR/.git" ]; then
  log "更新源码..."
  git -C "$APP_DIR" fetch --all --prune
  git -C "$APP_DIR" checkout "$REPO_BRANCH"
  git -C "$APP_DIR" pull --ff-only
else
  log "克隆 $REPO_URL (branch: $REPO_BRANCH)..."
  rm -rf "$APP_DIR"
  git clone --branch "$REPO_BRANCH" --depth 1 "$CLONE_URL" "$APP_DIR"
fi

# ── 准备 .env ─────────────────────────────────────────────────
if [ ! -f "$ZIWEI_DIR/.env" ]; then
  if [ -f "$APP_DIR/.env.example" ]; then
    cp "$APP_DIR/.env.example" "$ZIWEI_DIR/.env"
  elif [ -f "$DEPLOY_DIR/deploy/ziwei/.env.example" ]; then
    cp "$DEPLOY_DIR/deploy/ziwei/.env.example" "$ZIWEI_DIR/.env"
  else
    cat > "$ZIWEI_DIR/.env" << 'EOF'
NODE_ENV=production
PORT=3111
HOSTNAME=0.0.0.0
NEXT_PUBLIC_APP_URL=https://ziwei.orasage.com
MYSQL_ROOT_PASSWORD=changeme
MYSQL_DATABASE=ziwei
MYSQL_USER=ziwei
MYSQL_PASSWORD=changeme
DATABASE_URL=mysql://ziwei:changeme@ziwei-db:3306/ziwei
JWT_SECRET=change-me-to-a-random-string-at-least-32-chars
JWT_COOKIE_NAME=orasage_token
AUTH_URL=https://auth.orasage.com
EOF
  fi
  log "已生成 $ZIWEI_DIR/.env — 请编辑 GEMINI_API_KEY / JWT_SECRET / 数据库密码"
fi

# 同步 app 目录 .env（部分项目从根目录读取）
if [ -f "$ZIWEI_DIR/.env" ] && [ ! -f "$APP_DIR/.env" ]; then
  cp "$ZIWEI_DIR/.env" "$APP_DIR/.env"
fi

# ── Dockerfile 处理 ───────────────────────────────────────────
if [ ! -f "$APP_DIR/Dockerfile" ] && [ ! -f "$APP_DIR/docker-compose.yml" ] && [ ! -f "$APP_DIR/compose.yml" ]; then
  log "仓库无 Dockerfile，注入通用 Next.js Dockerfile..."
  # 启用 standalone 输出（若无则追加 next.config）
  if [ -f "$APP_DIR/next.config.ts" ] || [ -f "$APP_DIR/next.config.js" ] || [ -f "$APP_DIR/next.config.mjs" ]; then
    for cfg in next.config.ts next.config.js next.config.mjs; do
      [ -f "$APP_DIR/$cfg" ] || continue
      if ! grep -q "standalone" "$APP_DIR/$cfg"; then
        log "提示: 建议在 $cfg 中添加 output: 'standalone' 以优化 Docker 构建"
      fi
    done
  fi
  cp "${DEPLOY_DIR}/deploy/ziwei/Dockerfile.nextjs" "$APP_DIR/Dockerfile" 2>/dev/null \
    || cp "$(dirname "$0")/Dockerfile.nextjs" "$APP_DIR/Dockerfile"
fi

# ── 构建并启动 ───────────────────────────────────────────────
cd "$ZIWEI_DIR"
cp "${DEPLOY_DIR}/deploy/ziwei/docker-compose.native.yml" "$ZIWEI_DIR/docker-compose.native.yml" 2>/dev/null \
  || cp "$(dirname "$0")/docker-compose.native.yml" "$ZIWEI_DIR/docker-compose.native.yml"

if [ -f "$APP_DIR/docker-compose.yml" ] || [ -f "$APP_DIR/compose.yml" ]; then
  log "使用仓库自带 docker-compose..."
  COMPOSE_FILE="$APP_DIR/docker-compose.yml"
  [ -f "$APP_DIR/compose.yml" ] && COMPOSE_FILE="$APP_DIR/compose.yml"
  docker compose -f "$COMPOSE_FILE" --env-file "$ZIWEI_DIR/.env" up -d --build
elif [ -f "$APP_DIR/Dockerfile" ]; then
  log "使用 docker-compose.native.yml 构建..."
  export ZIWEI_DOCKERFILE=Dockerfile
  docker compose -f docker-compose.native.yml --env-file .env up -d --build
else
  log "错误: 未找到 Dockerfile 或 docker-compose.yml"
  exit 1
fi

# ── 确保 Nginx 指向本地 3111 ─────────────────────────────────
if [ -f /etc/nginx/conf.d/ziwei-local.conf ]; then
  :
elif [ -f /etc/nginx/sites-available/orasage ]; then
  sed -i 's|proxy_pass https://api2.lilyfunnlove.com|proxy_pass http://127.0.0.1:3111|g' /etc/nginx/sites-available/orasage
fi
nginx -t && systemctl reload nginx

# ── 验证 ─────────────────────────────────────────────────────
log "等待应用启动..."
for i in 1 2 3 4 5 6 7 8 9 10; do
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://127.0.0.1:3111/ 2>/dev/null || echo 000)
  [ "$code" = "200" ] || [ "$code" = "307" ] || [ "$code" = "308" ] && break
  sleep 5
done

log "  127.0.0.1:3111/       → HTTP $code"
chart=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 http://127.0.0.1:3111/chart 2>/dev/null || echo 000)
ext=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 https://ziwei.orasage.com/chart 2>/dev/null || echo 000)
log "  127.0.0.1:3111/chart  → HTTP $chart"
log "  ziwei.orasage.com/chart → HTTP $ext"

if [ "$chart" = "200" ] || [ "$ext" = "200" ]; then
  log "✅ 紫微完全自托管部署成功"
  docker compose -f "$ZIWEI_DIR/docker-compose.native.yml" ps 2>/dev/null || docker ps | grep ziwei
else
  log "⚠️  部署完成但健康检查未通过，查看日志:"
  docker compose -f "$ZIWEI_DIR/docker-compose.native.yml" logs --tail 40 2>/dev/null \
    || docker logs "$(docker ps -q --filter name=ziwei | head -1)" --tail 40 2>/dev/null
  exit 1
fi

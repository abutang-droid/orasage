#!/usr/bin/env bash
# 在 VPS 本机执行的一键部署脚本（shop + auth 更新）
# 用法（GCP 控制台 SSH 或已有 VPS 登录）:
#   curl -fsSL https://raw.githubusercontent.com/abutang-droid/orasage/cursor/shop-integration-9dd1/deploy/deploy-shop-on-vps.sh | bash
# 或:
#   bash /opt/orasage/deploy/deploy-shop-on-vps.sh

set -euo pipefail

DEPLOY_DIR="${DEPLOY_DIR:-/opt/orasage}"
BRANCH="${BRANCH:-cursor/shop-integration-9dd1}"
REPO_URL="${REPO_URL:-https://github.com/abutang-droid/orasage.git}"
NODE_BIN="${NODE_BIN:-/usr/local/bin}"
NPM_BIN="${NPM_BIN:-/usr/local/bin/npm}"

log() { echo "[$(date '+%H:%M:%S')] $*"; }

log "=== OraSage Shop 部署 ==="

# ── 1. 拉取最新代码 ──────────────────────────────────────────
if [ -d "$DEPLOY_DIR/.git" ]; then
  log "更新仓库 ($BRANCH)..."
  git -C "$DEPLOY_DIR" fetch origin "$BRANCH"
  git -C "$DEPLOY_DIR" checkout "$BRANCH" 2>/dev/null || git -C "$DEPLOY_DIR" checkout -b "$BRANCH" "origin/$BRANCH"
  git -C "$DEPLOY_DIR" reset --hard "origin/$BRANCH"
else
  log "克隆仓库..."
  sudo mkdir -p "$DEPLOY_DIR"
  sudo chown "$(whoami):$(whoami)" "$DEPLOY_DIR"
  git clone --branch "$BRANCH" "$REPO_URL" "$DEPLOY_DIR"
fi

# ── 2. 环境变量 ──────────────────────────────────────────────
if [ ! -f "$DEPLOY_DIR/.env" ]; then
  log "警告: $DEPLOY_DIR/.env 不存在，从模板创建（请检查 JWT_SECRET）"
  cp "$DEPLOY_DIR/deploy/.env.example" "$DEPLOY_DIR/.env"
fi

# shellcheck disable=SC1091
source "$DEPLOY_DIR/.env" 2>/dev/null || true

# ── 3. Auth 数据库迁移 ───────────────────────────────────────
log "运行 auth 数据库迁移..."
if command -v psql >/dev/null 2>&1; then
  psql "${DATABASE_URL:-postgresql://orasage:orasage_prod_2026@127.0.0.1:5432/orasage_auth}" \
    -f "$DEPLOY_DIR/auth-service/drizzle/0002_add_shop_source.sql" 2>/dev/null || {
    log "迁移可能已执行（shop app_source 已存在则跳过）"
  }
else
  log "psql 未找到，跳过迁移（请手动执行 0002_add_shop_source.sql）"
fi

# ── 4. 部署 auth-service ─────────────────────────────────────
log "构建 auth-service..."
cd "$DEPLOY_DIR/auth-service"
"$NPM_BIN" install
"$NPM_BIN" run build

log "重启 auth 服务..."
if systemctl list-unit-files | grep -q orasage-auth; then
  sudo systemctl restart orasage-auth
else
  log "配置 orasage-auth 服务..."
  if [ -f "$DEPLOY_DIR/deploy/auth/orasage-auth.service" ]; then
    sudo cp "$DEPLOY_DIR/deploy/auth/orasage-auth.service" /etc/systemd/system/
  fi
  sudo systemctl daemon-reload
  sudo systemctl enable orasage-auth 2>/dev/null || true
  sudo systemctl restart orasage-auth 2>/dev/null || log "请手动配置 orasage-auth.service"
fi

# ── 5. 部署 shop ─────────────────────────────────────────────
log "安装 shop 依赖..."
cd "$DEPLOY_DIR/shop"
"$NPM_BIN" install

log "构建 shop..."
export JWT_SECRET="${JWT_SECRET:-}"
export AUTH_INTERNAL_URL="${AUTH_INTERNAL_URL:-http://127.0.0.1:3101}"
export SHOP_URL="${SHOP_URL:-https://shop.orasage.com}"
"$NPM_BIN" run build

# ── 6. systemd 服务 ──────────────────────────────────────────
log "配置 orasage-shop 服务..."
sudo cp "$DEPLOY_DIR/deploy/shop/orasage-shop.service" /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable orasage-shop
sudo systemctl restart orasage-shop

# ── 7. 验证 ──────────────────────────────────────────────────
sleep 2
log "健康检查..."
curl -sf http://127.0.0.1:3101/health | head -c 200 && echo ""
curl -sf http://127.0.0.1:3102/api/health && echo ""

if curl -sfI https://shop.orasage.com | head -1 | grep -q 200; then
  log "✅ shop.orasage.com 已上线"
else
  log "⚠️  shop.orasage.com 尚未返回 200，检查 nginx 与 systemd 日志"
  sudo journalctl -u orasage-shop -n 20 --no-pager || true
fi

log "=== 部署完成 ==="

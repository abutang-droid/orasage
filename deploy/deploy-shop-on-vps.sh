#!/usr/bin/env bash
# 在 VPS 本机执行的一键部署脚本（main + auth + shop 三个自托管 App）
# 用法（GCP 控制台 SSH 或已有 VPS 登录）:
#   curl -fsSL https://raw.githubusercontent.com/abutang-droid/orasage/main/deploy/deploy-shop-on-vps.sh | bash
# 或:
#   bash /opt/orasage/deploy/deploy-shop-on-vps.sh

set -euo pipefail

DEPLOY_DIR="${DEPLOY_DIR:-/opt/orasage}"
BRANCH="${BRANCH:-${ORASAGE_REF:-main}}"
REPO_URL="${REPO_URL:-https://github.com/abutang-droid/orasage.git}"
NODE_BIN="${NODE_BIN:-/usr/local/bin}"
NPM_BIN="${NPM_BIN:-/usr/local/bin/npm}"

log() { echo "[$(date '+%H:%M:%S')] $*"; }

log "=== OraSage main + auth + shop 部署 ==="

# ── 1. 拉取最新代码 ──────────────────────────────────────────
if [ -d "$DEPLOY_DIR/.git" ]; then
  log "更新仓库 ($BRANCH)..."
  git -C "$DEPLOY_DIR" fetch origin "$BRANCH"
  git -C "$DEPLOY_DIR" checkout "$BRANCH" 2>/dev/null || git -C "$DEPLOY_DIR" checkout -b "$BRANCH" "origin/$BRANCH"
  git -C "$DEPLOY_DIR" reset --hard "origin/$BRANCH"
elif [ -d "$DEPLOY_DIR/auth-service" ]; then
  log "已有部署目录（无 git），跳过拉取。请用 deploy/deploy-shop.sh 从本地 rsync 同步。"
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

# auth-service 的 .env 常单独存放 JWT_SECRET，构建 admin/shop 前合并进来
if [ -z "${JWT_SECRET:-}" ] && [ -f "$DEPLOY_DIR/auth-service/.env" ]; then
  # shellcheck disable=SC1091
  source "$DEPLOY_DIR/auth-service/.env" 2>/dev/null || true
fi

if [ -z "${JWT_SECRET:-}" ]; then
  log "错误: 缺少 JWT_SECRET。请在 $DEPLOY_DIR/.env 或 auth-service/.env 中配置（与 auth 服务共用同一值）"
  exit 1
fi

export JWT_SECRET
export JWT_COOKIE_NAME="${JWT_COOKIE_NAME:-orasage_token}"
export AUTH_URL="${AUTH_URL:-https://auth.orasage.com}"
export ADMIN_URL="${ADMIN_URL:-https://admin.orasage.com}"

# ── 3. Auth 数据库迁移 ───────────────────────────────────────
log "运行 auth 数据库迁移..."
AUTH_DB_URL="${DATABASE_URL:-postgresql://orasage:orasage_prod_2026@127.0.0.1:5432/orasage_auth}"
if command -v psql >/dev/null 2>&1; then
  sudo -u postgres psql orasage_auth \
    -c "ALTER TYPE app_source ADD VALUE IF NOT EXISTS 'shop';" 2>/dev/null || true
  for mig in 0003_profile_center.sql 0004_backfill_display_id.sql 0005_order_context.sql 0006_reading_report.sql; do
    if [ -f "$DEPLOY_DIR/auth-service/drizzle/$mig" ]; then
      log "  应用 $mig ..."
      psql "$AUTH_DB_URL" -f "$DEPLOY_DIR/auth-service/drizzle/$mig" 2>/dev/null || \
        sudo -u postgres psql orasage_auth -f "$DEPLOY_DIR/auth-service/drizzle/$mig" 2>/dev/null || \
        log "  警告: $mig 可能已应用或需手动执行"
    fi
  done
else
  log "psql 未找到，跳过迁移（请手动执行 auth-service/drizzle/*.sql）"
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

# ── 5. 部署 main 主门户 ──────────────────────────────────────
log "安装 main 依赖..."
cd "$DEPLOY_DIR/main"
"$NPM_BIN" install

log "构建 main..."
export NEXT_PUBLIC_APP_URL="${APP_URL:-https://orasage.com}"
"$NPM_BIN" run build

log "配置 orasage-main 服务..."
sudo cp "$DEPLOY_DIR/deploy/main/orasage-main.service" /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable orasage-main
sudo systemctl restart orasage-main

# ── 6. 部署 admin ────────────────────────────────────────────
log "安装 admin 依赖..."
cd "$DEPLOY_DIR/admin"
"$NPM_BIN" install

log "构建 admin..."
export JWT_SECRET="${JWT_SECRET}"
export JWT_COOKIE_NAME="${JWT_COOKIE_NAME:-orasage_token}"
export AUTH_URL="${AUTH_URL:-https://auth.orasage.com}"
export ADMIN_URL="${ADMIN_URL:-https://admin.orasage.com}"
"$NPM_BIN" run build

log "配置 orasage-admin 服务..."
sudo cp "$DEPLOY_DIR/deploy/admin/orasage-admin.service" /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable orasage-admin
sudo systemctl restart orasage-admin

# ── 7. 部署 shop ─────────────────────────────────────────────
log "安装 shop 依赖..."
cd "$DEPLOY_DIR/shop"
"$NPM_BIN" install

log "构建 shop..."
export JWT_SECRET="${JWT_SECRET:-}"
export AUTH_INTERNAL_URL="${AUTH_INTERNAL_URL:-http://127.0.0.1:3101}"
export SHOP_URL="${SHOP_URL:-https://shop.orasage.com}"
"$NPM_BIN" run build

# ── 8. systemd 服务 ──────────────────────────────────────────
log "配置 orasage-shop 服务..."
sudo cp "$DEPLOY_DIR/deploy/shop/orasage-shop.service" /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable orasage-shop
sudo systemctl restart orasage-shop

# ── 9. 确保 Nginx 配置 ───────────────────────────────────────
if [ -f "$DEPLOY_DIR/deploy/nginx/orasage.conf" ]; then
  log "部署 Nginx 配置..."
  sudo cp "$DEPLOY_DIR/deploy/nginx/orasage.conf" /etc/nginx/sites-available/orasage
  sudo ln -sf /etc/nginx/sites-available/orasage /etc/nginx/sites-enabled/orasage
  sudo nginx -t && sudo systemctl reload nginx
fi

# ── 10. 验证 ─────────────────────────────────────────────────
sleep 2
log "健康检查..."
curl -sf http://127.0.0.1:3100 -o /dev/null -w "main   → HTTP %{http_code}\n" || true
curl -sf http://127.0.0.1:3101/health | head -c 200 && echo ""
curl -sf http://127.0.0.1:3102/api/health && echo ""
curl -sf http://127.0.0.1:3103 -o /dev/null -w "admin  → HTTP %{http_code}\n" || true

for domain in orasage.com auth.orasage.com shop.orasage.com admin.orasage.com; do
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "https://${domain}" || echo "000")
  if [ "$code" = "200" ] || [ "$code" = "307" ] || [ "$code" = "308" ]; then
    log "✅ ${domain} → HTTP $code"
  else
    log "⚠️  ${domain} → HTTP $code，检查 nginx 与 systemd 日志"
  fi
done
sudo journalctl -u orasage-main -n 10 --no-pager 2>/dev/null || true
sudo journalctl -u orasage-admin -n 10 --no-pager 2>/dev/null || true
sudo journalctl -u orasage-shop -n 10 --no-pager 2>/dev/null || true

log "=== 部署完成 ==="

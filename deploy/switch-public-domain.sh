#!/usr/bin/env bash
# 将生产公网根域名切换为新域（如 orcos.win），更新 env / cookie / CORS，并重建核心 App。
#
# 用法（在 VPS 或经 SSH）:
#   SITE_ROOT_DOMAIN=orcos.win bash deploy/switch-public-domain.sh
#   SITE_ROOT_DOMAIN=orcos.win SKIP_BUILD=1 bash deploy/switch-public-domain.sh   # 只改 env
#   SITE_ROOT_DOMAIN=orcos.win APPS="auth main admin shop" bash ...
#
# Cloudflare Tunnel（token 模式）须在 Zero Trust 控制台为新域添加 Public Hostname：
#   orcos.win          → http://127.0.0.1:3100
#   www.orcos.win      → http://127.0.0.1:3100
#   auth.orcos.win     → http://127.0.0.1:3101
#   shop.orcos.win     → http://127.0.0.1:3102
#   admin.orcos.win    → http://127.0.0.1:3103
#   bazi.orcos.win     → http://127.0.0.1:3110
#   ziwei.orcos.win    → http://127.0.0.1:3111
#   tarot.orcos.win    → http://127.0.0.1:3112
# DNS：各主机名 CNAME 到同一 Tunnel（或橙云代理到 Tunnel）。

set -euo pipefail

DEPLOY_DIR="${DEPLOY_DIR:-/opt/orasage}"
SITE_ROOT_DOMAIN="${SITE_ROOT_DOMAIN:?请设置 SITE_ROOT_DOMAIN，例如 orcos.win}"
SITE_ROOT_DOMAIN="${SITE_ROOT_DOMAIN#.}"; SITE_ROOT_DOMAIN="${SITE_ROOT_DOMAIN,,}"
SKIP_BUILD="${SKIP_BUILD:-0}"
APPS="${APPS:-auth main admin shop bazi ziwei tarot}"
NPM_BIN="${NPM_BIN:-$(command -v npm)}"

MAIN_URL="https://${SITE_ROOT_DOMAIN}"
AUTH_URL="https://auth.${SITE_ROOT_DOMAIN}"
SHOP_URL="https://shop.${SITE_ROOT_DOMAIN}"
ADMIN_URL="https://admin.${SITE_ROOT_DOMAIN}"
BAZI_URL="https://bazi.${SITE_ROOT_DOMAIN}"
ZIWEI_URL="https://ziwei.${SITE_ROOT_DOMAIN}"
TAROT_URL="https://tarot.${SITE_ROOT_DOMAIN}"
CMS_PUBLIC_URL="${ADMIN_URL}/cms"
COOKIE_DOMAIN=".${SITE_ROOT_DOMAIN}"
CORS_ORIGINS="${MAIN_URL},https://www.${SITE_ROOT_DOMAIN},${AUTH_URL},${SHOP_URL},${ADMIN_URL},${BAZI_URL},${ZIWEI_URL},${TAROT_URL}"

log() { echo "[$(date '+%H:%M:%S')] [switch-domain] $*"; }

set_kv() {
  local file="$1" key="$2" val="$3"
  mkdir -p "$(dirname "$file")"
  touch "$file"
  if grep -q "^${key}=" "$file" 2>/dev/null; then
    sed -i "s|^${key}=.*|${key}=${val}|" "$file"
  else
    echo "${key}=${val}" >> "$file"
  fi
}

log "目标根域名: ${SITE_ROOT_DOMAIN}"
log "COOKIE_DOMAIN=${COOKIE_DOMAIN}"

# ── 根 .env ─────────────────────────────────────────────────
ROOT_ENV="$DEPLOY_DIR/.env"
set_kv "$ROOT_ENV" SITE_ROOT_DOMAIN "$SITE_ROOT_DOMAIN"
set_kv "$ROOT_ENV" NEXT_PUBLIC_ROOT_DOMAIN "$SITE_ROOT_DOMAIN"
set_kv "$ROOT_ENV" APP_URL "$MAIN_URL"
set_kv "$ROOT_ENV" AUTH_URL "$AUTH_URL"
set_kv "$ROOT_ENV" ADMIN_URL "$ADMIN_URL"
set_kv "$ROOT_ENV" SHOP_URL "$SHOP_URL"
set_kv "$ROOT_ENV" CMS_PUBLIC_URL "$CMS_PUBLIC_URL"
set_kv "$ROOT_ENV" BAZI_PUBLIC_URL "$BAZI_URL"
set_kv "$ROOT_ENV" ZIWEI_PUBLIC_URL "$ZIWEI_URL"
set_kv "$ROOT_ENV" TAROT_PUBLIC_URL "$TAROT_URL"
set_kv "$ROOT_ENV" COOKIE_DOMAIN "$COOKIE_DOMAIN"
set_kv "$ROOT_ENV" CORS_ORIGINS "$CORS_ORIGINS"
set_kv "$ROOT_ENV" AUTH_INTERNAL_URL "http://127.0.0.1:3101"

# ── 各 App .env ─────────────────────────────────────────────
# auth
AUTH_ENV="$DEPLOY_DIR/auth-service/.env"
set_kv "$AUTH_ENV" SITE_ROOT_DOMAIN "$SITE_ROOT_DOMAIN"
set_kv "$AUTH_ENV" COOKIE_DOMAIN "$COOKIE_DOMAIN"
set_kv "$AUTH_ENV" CORS_ORIGINS "$CORS_ORIGINS"
set_kv "$AUTH_ENV" APP_URL "$MAIN_URL"
set_kv "$AUTH_ENV" ADMIN_URL "$ADMIN_URL"
set_kv "$AUTH_ENV" SHOP_URL "$SHOP_URL"
set_kv "$AUTH_ENV" TAROT_PUBLIC_URL "$TAROT_URL"

# main
MAIN_ENV="$DEPLOY_DIR/main/.env.local"
set_kv "$MAIN_ENV" NEXT_PUBLIC_ROOT_DOMAIN "$SITE_ROOT_DOMAIN"
set_kv "$MAIN_ENV" NEXT_PUBLIC_APP_URL "$MAIN_URL"
set_kv "$MAIN_ENV" NEXT_PUBLIC_AUTH_URL "$AUTH_URL"
set_kv "$MAIN_ENV" AUTH_URL "$AUTH_URL"
set_kv "$MAIN_ENV" AUTH_INTERNAL_URL "http://127.0.0.1:3101"
set_kv "$MAIN_ENV" SHOP_URL "$SHOP_URL"
set_kv "$MAIN_ENV" JWT_COOKIE_NAME "orasage_token"

# admin
ADMIN_ENV="$DEPLOY_DIR/admin/.env"
set_kv "$ADMIN_ENV" NEXT_PUBLIC_ROOT_DOMAIN "$SITE_ROOT_DOMAIN"
set_kv "$ADMIN_ENV" SITE_ROOT_DOMAIN "$SITE_ROOT_DOMAIN"
set_kv "$ADMIN_ENV" AUTH_URL "$AUTH_URL"
set_kv "$ADMIN_ENV" ADMIN_URL "$ADMIN_URL"
set_kv "$ADMIN_ENV" AUTH_INTERNAL_URL "http://127.0.0.1:3101"
set_kv "$ADMIN_ENV" JWT_COOKIE_NAME "orasage_token"

# shop
SHOP_ENV="$DEPLOY_DIR/shop/.env"
set_kv "$SHOP_ENV" NEXT_PUBLIC_ROOT_DOMAIN "$SITE_ROOT_DOMAIN"
set_kv "$SHOP_ENV" SITE_ROOT_DOMAIN "$SITE_ROOT_DOMAIN"
set_kv "$SHOP_ENV" AUTH_URL "$AUTH_URL"
set_kv "$SHOP_ENV" AUTH_INTERNAL_URL "http://127.0.0.1:3101"
set_kv "$SHOP_ENV" SHOP_URL "$SHOP_URL"
set_kv "$SHOP_ENV" JWT_COOKIE_NAME "orasage_token"

# bazi
BAZI_ENV="$DEPLOY_DIR/bazi/.env"
set_kv "$BAZI_ENV" SITE_ROOT_DOMAIN "$SITE_ROOT_DOMAIN"
set_kv "$BAZI_ENV" VITE_ROOT_DOMAIN "$SITE_ROOT_DOMAIN"
set_kv "$BAZI_ENV" VITE_AUTH_URL "$AUTH_URL"
set_kv "$BAZI_ENV" BAZI_PUBLIC_URL "$BAZI_URL"
set_kv "$BAZI_ENV" AUTH_URL "$AUTH_URL"

# ziwei
ZIWEI_ENV="$DEPLOY_DIR/ziwei/.env.local"
set_kv "$ZIWEI_ENV" NEXT_PUBLIC_ROOT_DOMAIN "$SITE_ROOT_DOMAIN"
set_kv "$ZIWEI_ENV" NEXT_PUBLIC_SITE_URL "$ZIWEI_URL"
set_kv "$ZIWEI_ENV" AUTH_URL "$AUTH_URL"
set_kv "$ZIWEI_ENV" AUTH_INTERNAL_URL "http://127.0.0.1:3101"
set_kv "$ZIWEI_ENV" PARENT_AUTH_COOKIE_NAME "orasage_token"

# tarot
TAROT_ENV="$DEPLOY_DIR/tarot/.env"
set_kv "$TAROT_ENV" SITE_ROOT_DOMAIN "$SITE_ROOT_DOMAIN"
set_kv "$TAROT_ENV" NEXT_PUBLIC_ROOT_DOMAIN "$SITE_ROOT_DOMAIN"
set_kv "$TAROT_ENV" AUTH_URL "$AUTH_URL"
set_kv "$TAROT_ENV" NEXT_PUBLIC_SITE_URL "$TAROT_URL"

# cms
CMS_ENV="$DEPLOY_DIR/cms/.env"
if [ -f "$CMS_ENV" ]; then
  set_kv "$CMS_ENV" NEXT_PUBLIC_AUTH_URL "$AUTH_URL"
  set_kv "$CMS_ENV" NEXT_PUBLIC_ADMIN_URL "$ADMIN_URL"
  set_kv "$CMS_ENV" NEXT_PUBLIC_SERVER_URL "$CMS_PUBLIC_URL"
fi

log "env 已写入。Cloudflare Tunnel Public Hostname 清单："
cat <<EOF
  ${SITE_ROOT_DOMAIN}       → http://127.0.0.1:3100
  www.${SITE_ROOT_DOMAIN}   → http://127.0.0.1:3100
  auth.${SITE_ROOT_DOMAIN}  → http://127.0.0.1:3101
  shop.${SITE_ROOT_DOMAIN}  → http://127.0.0.1:3102
  admin.${SITE_ROOT_DOMAIN} → http://127.0.0.1:3103
  bazi.${SITE_ROOT_DOMAIN}  → http://127.0.0.1:3110
  ziwei.${SITE_ROOT_DOMAIN} → http://127.0.0.1:3111
  tarot.${SITE_ROOT_DOMAIN} → http://127.0.0.1:3112
EOF

if [ "$SKIP_BUILD" = "1" ]; then
  log "SKIP_BUILD=1，跳过构建。请手动重建后重启服务。"
  exit 0
fi

contains() { case " $APPS " in *" $1 "*) return 0;; *) return 1;; esac; }

if contains auth; then
  log "构建 auth-service..."
  (cd "$DEPLOY_DIR/auth-service" && "$NPM_BIN" run build)
  systemctl restart orasage-auth
fi

if contains main; then
  log "构建 main..."
  (
    cd "$DEPLOY_DIR/main"
    export NEXT_PUBLIC_ROOT_DOMAIN="$SITE_ROOT_DOMAIN"
    export NEXT_PUBLIC_APP_URL="$MAIN_URL"
    export NEXT_PUBLIC_AUTH_URL="$AUTH_URL"
    rm -rf .next
    "$NPM_BIN" run build
  )
  systemctl restart orasage-main
fi

if contains admin; then
  log "构建 admin..."
  (
    cd "$DEPLOY_DIR/admin"
    export NEXT_PUBLIC_ROOT_DOMAIN="$SITE_ROOT_DOMAIN"
    export AUTH_URL="$AUTH_URL"
    export ADMIN_URL="$ADMIN_URL"
    export AUTH_INTERNAL_URL="http://127.0.0.1:3101"
    # 避开历史残留未跟踪页
    rm -rf src/app/readings src/app/shop/channels
    "$NPM_BIN" run build
  )
  systemctl restart orasage-admin
fi

if contains shop; then
  log "构建 shop..."
  (
    cd "$DEPLOY_DIR/shop"
    export NEXT_PUBLIC_ROOT_DOMAIN="$SITE_ROOT_DOMAIN"
    export AUTH_URL="$AUTH_URL"
    export AUTH_INTERNAL_URL="http://127.0.0.1:3101"
    export SHOP_URL="$SHOP_URL"
    "$NPM_BIN" run build
  )
  systemctl restart orasage-shop
fi

if contains bazi; then
  log "构建 bazi..."
  (
    cd "$DEPLOY_DIR/bazi"
    export VITE_ROOT_DOMAIN="$SITE_ROOT_DOMAIN"
    export VITE_AUTH_URL="$AUTH_URL"
    export BAZI_PUBLIC_URL="$BAZI_URL"
    if command -v pnpm >/dev/null 2>&1; then pnpm run build; else "$NPM_BIN" run build; fi
  )
  systemctl restart orasage-bazi || true
fi

if contains ziwei; then
  log "构建 ziwei..."
  (
    cd "$DEPLOY_DIR/ziwei"
    export NEXT_PUBLIC_ROOT_DOMAIN="$SITE_ROOT_DOMAIN"
    export NEXT_PUBLIC_SITE_URL="$ZIWEI_URL"
    export AUTH_URL="$AUTH_URL"
    "$NPM_BIN" run build
  )
  systemctl restart orasage-ziwei || true
fi

if contains tarot; then
  log "构建 tarot..."
  (
    cd "$DEPLOY_DIR/tarot"
    export NEXT_PUBLIC_ROOT_DOMAIN="$SITE_ROOT_DOMAIN"
    export NEXT_PUBLIC_SITE_URL="$TAROT_URL"
    "$NPM_BIN" run build
  )
  systemctl restart orasage-tarot || true
fi

log "完成。请确认 Tunnel/DNS 已指向新域后访问 ${MAIN_URL}"

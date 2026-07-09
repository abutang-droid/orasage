#!/usr/bin/env bash
# VPS 本机一键部署全部 App（在 GCP 控制台 SSH 或已有 VPS 登录后执行）
#
# 用法:
#   curl -fsSL ... | bash   # 需仓库已 clone 到 /opt/orasage
#   ORASAGE_REF=main bash /opt/orasage/deploy/bootstrap-all-on-vps.sh
#   FORTUNE_MODE=proxy bash ...   # bazi/ziwei/tarot 先用 proxy 回滚模式
#
# 环境变量:
#   ORASAGE_REF   — git 分支（默认 main）
#   FORTUNE_MODE  — native | proxy（默认 native；无 .env 时 bazi/tarot 自动降级 proxy）
#   SKIP_CMS      — 设为 1 跳过 cms（默认部署）
#   DEPLOY_DIR    — 默认 /opt/orasage

set -euo pipefail

DEPLOY_DIR="${DEPLOY_DIR:-/opt/orasage}"
ORASAGE_REF="${ORASAGE_REF:-main}"
FORTUNE_MODE="${FORTUNE_MODE:-native}"
REPO_URL="${REPO_URL:-https://github.com/abutang-droid/orasage.git}"

log() { echo "[$(date '+%H:%M:%S')] [all] $*"; }

sync_repo() {
  log "同步仓库 (ref=$ORASAGE_REF)..."
  if [ -d "$DEPLOY_DIR/.git" ]; then
    git -C "$DEPLOY_DIR" fetch --all --prune
    git -C "$DEPLOY_DIR" checkout "$ORASAGE_REF" 2>/dev/null || git -C "$DEPLOY_DIR" checkout main
    git -C "$DEPLOY_DIR" pull --ff-only origin "$ORASAGE_REF" 2>/dev/null \
      || git -C "$DEPLOY_DIR" pull --ff-only || true
  else
    sudo mkdir -p "$DEPLOY_DIR"
    sudo chown "$(whoami):$(whoami)" "$DEPLOY_DIR"
    git clone --branch "$ORASAGE_REF" "$REPO_URL" "$DEPLOY_DIR" \
      || git clone "$REPO_URL" "$DEPLOY_DIR"
  fi
  RUN_USER="$(whoami)"
  if [ "$RUN_USER" != "root" ] && [ -d "$DEPLOY_DIR" ]; then
    log "修正部署目录归属 ($RUN_USER)..."
    sudo chown -R "$RUN_USER:$RUN_USER" "$DEPLOY_DIR"
  fi
}

ensure_nginx() {
  if [ -f "$DEPLOY_DIR/deploy/nginx/orasage.conf" ]; then
    log "更新 Nginx 配置..."
    sudo cp "$DEPLOY_DIR/deploy/nginx/orasage.conf" /etc/nginx/sites-available/orasage
    sudo ln -sf /etc/nginx/sites-available/orasage /etc/nginx/sites-enabled/orasage
    sudo nginx -t && sudo systemctl reload nginx
  fi
}

deploy_cms() {
  if [ "${SKIP_CMS:-0}" = "1" ]; then
    log "跳过 cms（SKIP_CMS=1）"
    return 0
  fi
  if [ ! -f "$DEPLOY_DIR/cms/.env" ]; then
    log "cms: 无 .env，跳过（首次请 cp cms/.env.example cms/.env 并配置 DATABASE_URL）"
    return 0
  fi
  log "部署 cms（含媒体同步）..."
  sudo ORASAGE_REF="$ORASAGE_REF" DEPLOY_DIR="$DEPLOY_DIR" bash "$DEPLOY_DIR/deploy/cms/deploy-cms.sh"
}

fortune_mode_for() {
  local app="$1"
  local mode="$FORTUNE_MODE"
  if [ "$mode" = "native" ] && [ "$app" != "ziwei" ]; then
    if [ ! -f "$DEPLOY_DIR/$app/.env" ]; then
      log "警告: $app 无 .env，降级为 proxy 模式"
      mode="proxy"
    fi
  fi
  echo "$mode"
}

verify_all() {
  log "=== 健康检查 ==="
  local ports="3100:main 3101:auth 3102:shop 3103:admin 3110:bazi 3111:ziwei 3112:tarot 3120:cms"
  for entry in $ports; do
    port="${entry%%:*}"
    name="${entry##*:}"
    code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "http://127.0.0.1:${port}/" 2>/dev/null || echo "000")
    log "  127.0.0.1:${port} (${name}) → HTTP ${code}"
  done
  for domain in orasage.com auth.orasage.com shop.orasage.com admin.orasage.com \
                bazi.orasage.com ziwei.orasage.com tarot.orasage.com cms.orasage.com; do
    code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "https://${domain}" 2>/dev/null || echo "000")
    if [ "$code" = "200" ] || [ "$code" = "302" ] || [ "$code" = "307" ] || [ "$code" = "308" ]; then
      log "  ✅ https://${domain} → HTTP ${code}"
    else
      log "  ⚠️  https://${domain} → HTTP ${code}"
    fi
  done
}

# ── main ──────────────────────────────────────────────────────
log "=== OraSage 全量部署 (ref=$ORASAGE_REF) ==="

sync_repo
ensure_nginx

log "部署 core apps (main + auth + shop + admin)..."
ORASAGE_REF="$ORASAGE_REF" BRANCH="$ORASAGE_REF" bash "$DEPLOY_DIR/deploy/deploy-shop-on-vps.sh"

for app in bazi ziwei tarot; do
  mode="$(fortune_mode_for "$app")"
  log "部署 $app（模式: $mode）..."
  sudo DEPLOY_MODE="$mode" ORASAGE_REF="$ORASAGE_REF" bash "$DEPLOY_DIR/deploy/$app/deploy-$app.sh"
done

deploy_cms
verify_all

log "=== 全量部署完成 ==="

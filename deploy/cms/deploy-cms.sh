#!/usr/bin/env bash
# VPS 端 cms（Payload CMS）部署脚本
# 在 VPS 上执行: sudo bash deploy/cms/deploy-cms.sh
#
# 前置条件:
#   - PostgreSQL 已运行（与 auth/shop 共用实例）
#   - /opt/orasage/cms/.env 已配置 DATABASE_URL / PAYLOAD_SECRET

set -euo pipefail

DEPLOY_DIR="${DEPLOY_DIR:-/opt/orasage}"
APP_DIR="$DEPLOY_DIR/cms"

# shellcheck disable=SC1091
source "$DEPLOY_DIR/deploy/lib/load-env.sh" 2>/dev/null || true

log() { echo "[$(date '+%H:%M:%S')] [cms] $*"; }

# 与 orasage-cms.service 中 User= 保持一致
CMS_RUN_USER="${CMS_RUN_USER:-ubuntu}"

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || { log "缺少命令: $1"; exit 1; }
}

sync_config_repo() {
  log "同步 orasage 仓库..."
  if [ -d "$DEPLOY_DIR/.git" ]; then
    git -C "$DEPLOY_DIR" fetch --all --prune
    git -C "$DEPLOY_DIR" checkout "${ORASAGE_REF:-main}" 2>/dev/null || git -C "$DEPLOY_DIR" checkout main
    git -C "$DEPLOY_DIR" pull --ff-only || true
  fi
}

ensure_env() {
  if [ ! -f "$APP_DIR/.env" ]; then
    if [ -f "$APP_DIR/.env.example" ]; then
      cp "$APP_DIR/.env.example" "$APP_DIR/.env"
      log "已从模板创建 $APP_DIR/.env，请配置 DATABASE_URL 与 PAYLOAD_SECRET 后重试"
      exit 1
    fi
    log "错误: $APP_DIR/.env 不存在"
    exit 1
  fi

  set -a
  load_dotenv "$APP_DIR/.env"
  set +u

  if [ -z "${DATABASE_URL:-}" ]; then
    log "错误: cms/.env 缺少 DATABASE_URL"
    exit 1
  fi
  if [ -z "${PAYLOAD_SECRET:-}" ] || [ "$PAYLOAD_SECRET" = "change-me-to-a-random-string-at-least-32-chars" ]; then
    log "错误: cms/.env 缺少有效的 PAYLOAD_SECRET（至少 32 位随机字符串）"
    exit 1
  fi
  if [ -z "${JWT_SECRET:-}" ]; then
    log "警告: cms/.env 缺少 JWT_SECRET（需与 auth-service 相同，用于 SSO）"
  fi
  export NEXT_PUBLIC_SERVER_URL="${NEXT_PUBLIC_SERVER_URL:-https://admin.orasage.com/cms}"
  export CMS_BASE_PATH="${CMS_BASE_PATH:-/cms}"
  export CMS_MEDIA_DIR="${CMS_MEDIA_DIR:-/var/lib/orasage/cms-media}"
  set -u
}

try_create_database() {
  if psql "$DATABASE_URL" -c "SELECT 1" >/dev/null 2>&1; then
    log "PostgreSQL 连接正常"
    return 0
  fi

  log "无法连接 $DATABASE_URL，尝试创建数据库 orasage_cms..."

  local auth_url=""
  if [ -f "$DEPLOY_DIR/.env" ]; then
    auth_url=$(grep '^DATABASE_URL=' "$DEPLOY_DIR/.env" | cut -d= -f2- | tr -d "'\"")
  fi

  if [ -n "$auth_url" ]; then
    local db_name
    db_name=$(echo "$DATABASE_URL" | sed -E 's|.*/([^/?]+).*|\1|')
    psql "$auth_url" -c "CREATE DATABASE ${db_name};" 2>/dev/null || true
    if psql "$DATABASE_URL" -c "SELECT 1" >/dev/null 2>&1; then
      log "数据库 ${db_name} 已就绪"
      return 0
    fi
  fi

  log "错误: 无法连接 CMS 数据库。请手动执行:"
  log "  sudo -u postgres psql -c \"CREATE DATABASE orasage_cms OWNER orasage;\""
  exit 1
}

sync_media_files() {
  CMS_MEDIA_DIR="${CMS_MEDIA_DIR:-/var/lib/orasage/cms-media}"
  local legacy_dir="$APP_DIR/media"
  mkdir -p "$CMS_MEDIA_DIR"
  if [ -d "$legacy_dir" ] && [ "$(ls -A "$legacy_dir" 2>/dev/null | wc -l)" -gt 0 ]; then
    log "同步媒体文件: $legacy_dir → $CMS_MEDIA_DIR"
    if command -v rsync >/dev/null 2>&1; then
      rsync -a "$legacy_dir/" "$CMS_MEDIA_DIR/"
    else
      cp -a "$legacy_dir/." "$CMS_MEDIA_DIR/"
    fi
  fi
}

ensure_media_permissions() {
  CMS_MEDIA_DIR="${CMS_MEDIA_DIR:-/var/lib/orasage/cms-media}"
  mkdir -p "$CMS_MEDIA_DIR"
  chown -R "${CMS_RUN_USER}:${CMS_RUN_USER}" "$CMS_MEDIA_DIR"
  chmod 775 "$CMS_MEDIA_DIR"
  log "媒体目录权限: ${CMS_MEDIA_DIR} → ${CMS_RUN_USER} (775)"
}

deploy_native() {
  log "部署 cms（Payload）..."
  require_cmd npm

  CMS_MEDIA_DIR="${CMS_MEDIA_DIR:-/var/lib/orasage/cms-media}"
  mkdir -p "$CMS_MEDIA_DIR"
  sync_media_files
  ensure_media_permissions
  if [ -f "$APP_DIR/.env" ]; then
    if grep -q '^CMS_MEDIA_DIR=' "$APP_DIR/.env"; then
      sed -i "s|^CMS_MEDIA_DIR=.*|CMS_MEDIA_DIR=${CMS_MEDIA_DIR}|" "$APP_DIR/.env"
    else
      echo "CMS_MEDIA_DIR=${CMS_MEDIA_DIR}" >> "$APP_DIR/.env"
    fi
  fi

  cd "$APP_DIR"
  npm ci
  npm run migrate
  npm run seed:tarot 2>/dev/null || log "seed:tarot 跳过（需 tsx / 已种子化）"
  npm run seed:tarot-geo 2>/dev/null || log "seed:tarot-geo 跳过（需 tsx / 已种子化）"
  if systemctl is-active --quiet orasage-tarot 2>/dev/null; then
    log "重启 orasage-tarot（刷新 CMS 圣地/信仰 fetch 缓存）..."
    systemctl restart orasage-tarot
  fi
  npm run build

  RUN_USER="${SUDO_USER:-${USER:-ubuntu}}"
  if [ "$(id -u)" -eq 0 ] && [ "$RUN_USER" = "root" ]; then
    RUN_USER="$CMS_RUN_USER"
  fi
  chown -R "$RUN_USER:$RUN_USER" "$APP_DIR"
  ensure_media_permissions

  cp "$DEPLOY_DIR/deploy/cms/orasage-cms.service" /etc/systemd/system/
  systemctl daemon-reload
  systemctl enable orasage-cms
  systemctl restart orasage-cms
}

ensure_nginx() {
  if [ -f "$DEPLOY_DIR/deploy/nginx/orasage.conf" ]; then
    cp "$DEPLOY_DIR/deploy/nginx/orasage.conf" /etc/nginx/sites-available/orasage
    ln -sf /etc/nginx/sites-available/orasage /etc/nginx/sites-enabled/orasage
    nginx -t
    systemctl reload nginx
  fi
}

verify() {
  sleep 3
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 http://127.0.0.1:3120/cms/admin || echo "000")
  log "  127.0.0.1:3120/cms/admin → HTTP $code"
  blocked=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 -L https://cms.orasage.com/admin || echo "000")
  log "  https://cms.orasage.com/admin → HTTP $blocked (期望 301 链至 admin/cms/admin)"
  admin_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 https://admin.orasage.com/cms/admin || echo "000")
  log "  https://admin.orasage.com/cms/admin → HTTP $admin_code"
  sample_file=""
  if [ -d "${CMS_MEDIA_DIR:-/var/lib/orasage/cms-media}" ]; then
    sample_file=$(find "${CMS_MEDIA_DIR:-/var/lib/orasage/cms-media}" -maxdepth 1 -type f -name '*.jpg' | head -1)
    sample_file="${sample_file##*/}"
  fi
  if [ -n "$sample_file" ]; then
    local_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 \
      "http://127.0.0.1:3120/cms/api/media/file/${sample_file}" || echo "000")
    public_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 \
      "https://admin.orasage.com/cms/api/media/file/${sample_file}" || echo "000")
    log "  媒体样本 ${sample_file}: 内网 HTTP $local_code, 公网 HTTP $public_code"
  else
    log "  警告: ${CMS_MEDIA_DIR:-/var/lib/orasage/cms-media} 无 jpg 样本，请确认 CMS 媒体已上传"
  fi
  media_dir="${CMS_MEDIA_DIR:-/var/lib/orasage/cms-media}"
  media_owner=$(stat -c '%U' "$media_dir" 2>/dev/null || echo "unknown")
  if [ "$media_owner" != "$CMS_RUN_USER" ]; then
    log "  警告: 媒体目录属主为 $media_owner（期望 $CMS_RUN_USER），上传可能失败"
  elif sudo -u "$CMS_RUN_USER" test -w "$media_dir" 2>/dev/null; then
    log "  媒体目录可写: $media_dir ($CMS_RUN_USER)"
  else
    log "  警告: $CMS_RUN_USER 无法写入 $media_dir"
  fi
}

# ── main ──────────────────────────────────────────────────────
log "开始部署 cms..."
require_cmd git
require_cmd curl
sync_config_repo
ensure_env
try_create_database
deploy_native
ensure_nginx
verify
log "cms 部署完成 → https://admin.orasage.com/cms/admin（cms.orasage.com 公网已封禁）"

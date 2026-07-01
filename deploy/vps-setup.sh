#!/usr/bin/env bash
# OraSage 方案 B — VPS 一键部署脚本
# 用法: bash vps-setup.sh
# 需在 VPS 上以 root 或 sudo 用户执行

set -euo pipefail

VPS_IP="34.75.40.67"
REPO_URL="https://github.com/abutang-droid/orasage.git"
DEPLOY_DIR="/opt/orasage"
NGINX_CONF="/etc/nginx/sites-available/orasage"
DOMAINS=(
  orasage.com
  www.orasage.com
  auth.orasage.com
  shop.orasage.com
  admin.orasage.com
  bazi.orasage.com
  ziwei.orasage.com
  tarot.orasage.com
  cms.orasage.com
)

log() { echo "[$(date '+%H:%M:%S')] $*"; }

# ── 1. 系统依赖 ──────────────────────────────────────────────
log "安装系统依赖..."
apt-get update -qq
apt-get install -y -qq nginx certbot python3-certbot-nginx git curl

# ── 2. 拉取配置仓库 ──────────────────────────────────────────
log "拉取 orasage 配置..."
mkdir -p "$DEPLOY_DIR"
if [ -d "$DEPLOY_DIR/.git" ]; then
  git -C "$DEPLOY_DIR" pull --ff-only
else
  git clone "$REPO_URL" "$DEPLOY_DIR"
fi

# ── 3. 部署 Nginx 子域配置 ───────────────────────────────────
log "部署 Nginx 配置..."
cp "$DEPLOY_DIR/deploy/nginx/orasage.conf" "$NGINX_CONF"
ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/orasage

# 禁用可能冲突的默认站点
rm -f /etc/nginx/sites-enabled/default

# 先测 HTTP 配置（证书还没申请时 SSL 行会报错，临时处理）
if ! nginx -t 2>/dev/null; then
  log "Nginx 测试失败（可能缺 SSL 证书），先申请证书..."
fi

# ── 4. 申请 SSL 证书 ─────────────────────────────────────────
if [ ! -f /etc/letsencrypt/live/orasage.com/fullchain.pem ]; then
  log "申请 Let's Encrypt 证书..."
  DOMAIN_ARGS=""
  for d in "${DOMAINS[@]}"; do
    DOMAIN_ARGS="$DOMAIN_ARGS -d $d"
  done

  # 临时启用纯 HTTP 配置用于 certbot standalone
  certbot certonly --nginx --non-interactive --agree-tos \
    --email admin@orasage.com \
    $DOMAIN_ARGS || {
      log "certbot --nginx 失败，尝试 standalone 模式..."
      systemctl stop nginx
      certbot certonly --standalone --non-interactive --agree-tos \
        --email admin@orasage.com \
        $DOMAIN_ARGS
      systemctl start nginx
    }
else
  log "SSL 证书已存在，跳过申请"
fi

# ── 5. 重载 Nginx ──────────────────────────────────────────────
log "重载 Nginx..."
nginx -t
systemctl enable nginx
systemctl reload nginx

# ── 6. 验证 ───────────────────────────────────────────────────
log "验证各子域 HTTP 响应..."
for sub in auth bazi tarot ziwei; do
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "http://${sub}.orasage.com" || echo "000")
  log "  ${sub}.orasage.com → HTTP $code"
done

log "完成！下一步：部署各 App 容器到对应端口"
log "  auth  → 3101"
log "  bazi  → 3110"
log "  tarot → 3112"
log "  ziwei → 3111"

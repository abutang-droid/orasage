#!/usr/bin/env bash
# 紫微应用迁移到 VPS 本地 :3111
# 在 VPS 上执行: sudo bash migrate-to-local.sh
#
# 架构: ziwei.orasage.com → Nginx → 127.0.0.1:3111 (Docker) → api2.lilyfunnlove.com
# 后续自托管: 将 ZIWEI_UPSTREAM_URL 去掉，替换为 native 镜像

set -euo pipefail

ZIWEI_DIR="/opt/orasage/ziwei"
UPSTREAM="${ZIWEI_UPSTREAM_URL:-https://api2.lilyfunnlove.com}"

log() { echo "[migrate-local $(date '+%H:%M:%S')] $*"; }

if [ "$(id -u)" -ne 0 ]; then
  log "请使用 sudo 运行: sudo bash $0"
  exit 1
fi

# ── 1. 安装 Docker ───────────────────────────────────────────
if ! command -v docker >/dev/null 2>&1; then
  log "安装 Docker..."
  apt-get update -qq
  apt-get install -y -qq ca-certificates curl
  if [ ! -f /etc/apt/keyrings/docker.asc ]; then
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
    chmod a+r /etc/apt/keyrings/docker.asc
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
      > /etc/apt/sources.list.d/docker.list
    apt-get update -qq
  fi
  apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-compose-plugin 2>/dev/null \
    || apt-get install -y -qq docker.io docker-compose-plugin
  systemctl enable --now docker
fi

# ── 2. 部署本地代理容器 ──────────────────────────────────────
log "部署本地代理 → $UPSTREAM ..."
mkdir -p "$ZIWEI_DIR/proxy"

cat > "$ZIWEI_DIR/proxy/server.js" << 'EOF'
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const PORT = Number(process.env.PORT || 3111);
const UPSTREAM = process.env.ZIWEI_UPSTREAM_URL || 'https://api2.lilyfunnlove.com';
const app = express();
app.get('/health', (_, res) => res.json({ ok: true, service: 'orasage-ziwei-proxy', upstream: UPSTREAM, time: new Date().toISOString() }));
app.use('/', createProxyMiddleware({
  target: UPSTREAM, changeOrigin: true, ws: true, proxyTimeout: 120000, timeout: 120000,
  on: { proxyReq(r) { r.setHeader('X-Forwarded-Host', 'ziwei.orasage.com'); } },
}));
app.listen(PORT, '0.0.0.0', () => console.log(`[ziwei-proxy] :${PORT} → ${UPSTREAM}`));
EOF

cat > "$ZIWEI_DIR/proxy/package.json" << 'EOF'
{"name":"orasage-ziwei-proxy","private":true,"dependencies":{"express":"^4.21.2","http-proxy-middleware":"^3.0.3"}}
EOF

cat > "$ZIWEI_DIR/proxy/Dockerfile" << 'EOF'
FROM node:22-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --production
COPY server.js ./
ENV NODE_ENV=production PORT=3111
EXPOSE 3111
HEALTHCHECK CMD wget -qO- http://127.0.0.1:3111/health || exit 1
CMD ["node", "server.js"]
EOF

cat > "$ZIWEI_DIR/docker-compose.yml" << EOF
services:
  ziwei:
    build: ./proxy
    image: orasage-ziwei-proxy:local
    restart: unless-stopped
    ports:
      - "127.0.0.1:3111:3111"
    environment:
      ZIWEI_UPSTREAM_URL: ${UPSTREAM}
EOF

cd "$ZIWEI_DIR"
docker compose build --quiet
docker compose up -d --remove-orphans

# ── 3. Nginx 改回本地 3111 ───────────────────────────────────
log "配置 Nginx → 127.0.0.1:3111 ..."

# 删除之前手动添加的外网直代配置
rm -f /etc/nginx/conf.d/ziwei-proxy.conf

ORASAGE_CONF="/etc/nginx/sites-available/orasage"
if [ -f "$ORASAGE_CONF" ]; then
  # 将 ziwei 块中的外网代理改回本地
  sed -i 's|proxy_pass https://api2.lilyfunnlove.com;|proxy_pass http://127.0.0.1:3111;|g' "$ORASAGE_CONF"
  sed -i '/server_name ziwei.orasage.com/,/^}/ {
    /proxy_set_header Host api2.lilyfunnlove.com/d
    /proxy_ssl_server_name/d
    /proxy_ssl_name/d
  }' "$ORASAGE_CONF"
  # 确保有 proxy_pass 127.0.0.1:3111
  if ! grep -A20 'server_name ziwei.orasage.com' "$ORASAGE_CONF" | grep -q '127.0.0.1:3111'; then
    log "警告: 请手动检查 $ORASAGE_CONF 中 ziwei 块的 proxy_pass"
  fi
  ln -sf "$ORASAGE_CONF" /etc/nginx/sites-enabled/orasage
fi

nginx -t
systemctl reload nginx

# ── 4. 验证 ──────────────────────────────────────────────────
log "等待服务启动..."
sleep 3

local_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 http://127.0.0.1:3111/health || echo "000")
ext_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 https://ziwei.orasage.com/health || echo "000")
log "  127.0.0.1:3111/health     → HTTP $local_code"
log "  ziwei.orasage.com/health  → HTTP $ext_code"

if [ "$local_code" = "200" ]; then
  log "✅ 本地迁移完成"
  docker compose -f "$ZIWEI_DIR/docker-compose.yml" ps
else
  log "❌ 本地健康检查失败，查看日志:"
  docker compose -f "$ZIWEI_DIR/docker-compose.yml" logs --tail 20
  exit 1
fi

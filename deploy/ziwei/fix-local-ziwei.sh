#!/usr/bin/env bash
# 修复 ziwei 本地部署：确保 Docker :3111 运行 + Nginx 指向本地
# 用法: sudo bash fix-local-ziwei.sh

set -euo pipefail
ZIWEI_DIR="/opt/orasage/ziwei"
UPSTREAM="${ZIWEI_UPSTREAM_URL:-https://api2.lilyfunnlove.com}"
log() { echo "[fix-ziwei] $*"; }

[ "$(id -u)" -eq 0 ] || { log "请 sudo 运行"; exit 1; }

# ── 1. Docker + 本地代理（含 /health）────────────────────────
if ! command -v docker >/dev/null 2>&1; then
  apt-get update -qq && apt-get install -y -qq docker.io docker-compose-plugin
  systemctl enable --now docker
fi

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
echo '{"dependencies":{"express":"^4.21.2","http-proxy-middleware":"^3.0.3"}}' > "$ZIWEI_DIR/proxy/package.json"
cat > "$ZIWEI_DIR/proxy/Dockerfile" << 'EOF'
FROM node:22-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --production
COPY server.js ./
EXPOSE 3111
CMD ["node", "server.js"]
EOF
cat > "$ZIWEI_DIR/docker-compose.yml" << EOF
services:
  ziwei:
    build: ./proxy
    image: orasage-ziwei-proxy:local
    restart: unless-stopped
    ports: ["127.0.0.1:3111:3111"]
    environment:
      ZIWEI_UPSTREAM_URL: ${UPSTREAM}
EOF

cd "$ZIWEI_DIR"
docker compose down 2>/dev/null || true
docker compose build
docker compose up -d

log "等待本地服务..."
for i in 1 2 3 4 5; do
  code=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3111/health 2>/dev/null || echo 000)
  [ "$code" = "200" ] && break
  sleep 2
done
curl -s http://127.0.0.1:3111/health || { log "本地 3111 未就绪"; docker compose logs --tail 20; exit 1; }
echo ""

# ── 2. 删除外网直代配置，写入本地 Nginx ─────────────────────
rm -f /etc/nginx/conf.d/ziwei-proxy.conf

cat > /etc/nginx/conf.d/ziwei-local.conf << 'EOF'
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name ziwei.orasage.com;

    ssl_certificate     /etc/letsencrypt/live/orasage.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/orasage.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3111;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 120s;
    }
}
EOF

# 禁用 orasage.conf 里重复的 ziwei 块（避免冲突）
ORASAGE_CONF="/etc/nginx/sites-available/orasage"
if [ -f "$ORASAGE_CONF" ] && grep -q 'server_name ziwei.orasage.com' "$ORASAGE_CONF"; then
  cp "$ORASAGE_CONF" "${ORASAGE_CONF}.bak.$(date +%s)"
  awk '
    /^server \{/ { inblock=0 }
    /server_name ziwei\.orasage\.com/ { inblock=1 }
    inblock { print "# migrated-to-conf.d " $0; next }
    { print }
  ' "$ORASAGE_CONF" > "${ORASAGE_CONF}.tmp" && mv "${ORASAGE_CONF}.tmp" "$ORASAGE_CONF"
fi

nginx -t
systemctl reload nginx

# ── 3. 验证 ──────────────────────────────────────────────────
log "本地:  $(curl -s http://127.0.0.1:3111/health)"
log "外网 health: HTTP $(curl -s -o /dev/null -w '%{http_code}' https://ziwei.orasage.com/health)"
log "外网 首页: HTTP $(curl -s -o /dev/null -w '%{http_code}' https://ziwei.orasage.com/)"
log "外网 chart: HTTP $(curl -s -o /dev/null -w '%{http_code}' https://ziwei.orasage.com/chart)"
log "✅ 完成"

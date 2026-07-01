const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const PORT = Number(process.env.PORT || 3112);
const UPSTREAM = process.env.TAROT_UPSTREAM_URL;

if (!UPSTREAM) {
  console.error('[tarot-proxy] 缺少 TAROT_UPSTREAM_URL 环境变量，无法确定反代目标，退出。');
  process.exit(1);
}

const app = express();

app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'orasage-tarot-proxy',
    upstream: UPSTREAM,
    time: new Date().toISOString(),
  });
});

app.use(
  '/',
  createProxyMiddleware({
    target: UPSTREAM,
    changeOrigin: true,
    ws: true,
    proxyTimeout: 120_000,
    timeout: 120_000,
    on: {
      proxyReq(proxyReq) {
        proxyReq.setHeader('X-Forwarded-Host', 'tarot.orasage.com');
      },
      error(err, _req, res) {
        console.error('[tarot-proxy] upstream error:', err.message);
        if (!res.headersSent) {
          res.writeHead(502, { 'Content-Type': 'application/json' });
        }
        res.end(JSON.stringify({ error: 'Upstream unavailable', upstream: UPSTREAM }));
      },
    },
  }),
);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[tarot-proxy] listening on :${PORT}, upstream=${UPSTREAM}`);
});

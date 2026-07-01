const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const PORT = Number(process.env.PORT || 3111);
const UPSTREAM = process.env.ZIWEI_UPSTREAM_URL || 'https://api2.lilyfunnlove.com';

const app = express();

app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'orasage-ziwei-proxy',
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
        proxyReq.setHeader('X-Forwarded-Host', 'ziwei.orasage.com');
      },
      error(err, _req, res) {
        console.error('[ziwei-proxy] upstream error:', err.message);
        if (!res.headersSent) {
          res.writeHead(502, { 'Content-Type': 'application/json' });
        }
        res.end(JSON.stringify({ error: 'Upstream unavailable', upstream: UPSTREAM }));
      },
    },
  }),
);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[ziwei-proxy] listening on :${PORT}, upstream=${UPSTREAM}`);
});

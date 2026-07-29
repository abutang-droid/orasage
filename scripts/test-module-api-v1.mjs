#!/usr/bin/env node
/**
 * Phase E 冒烟：Module API 契约（scopes / 模板 / 禁止 finance）
 *
 * 纯单元：始终运行。
 * HTTP 否定用例（可选）：设置 AUTH_URL + MODULE_API_KEY + MODULE_API_PARTNER
 *   AUTH_URL=http://127.0.0.1:3101 \
 *   MODULE_API_KEY=mk_live_… \
 *   MODULE_API_PARTNER=demo-partner \
 *   npx tsx scripts/test-module-api-v1.mjs
 */
import assert from 'node:assert/strict';
import {
  DELIVERY_TEMPLATES,
  effectiveModuleScopes,
  FORBIDDEN_MODULE_API_SCOPES,
  hasModuleScope,
  modulesForTemplate,
  sanitizeApiKeyScopes,
} from '../shared/partners/index.ts';

/* ── 交付模板 ── */
assert.deepEqual(
  [...DELIVERY_TEMPLATES['shop-only']],
  ['shop', 'billing', 'ops', 'analytics'],
);
assert.ok(modulesForTemplate('tarot-only').includes('app.tarot'));
assert.ok(!modulesForTemplate('tarot-only').includes('shop'));
assert.ok(!modulesForTemplate('shop-only').includes('app.tarot'));
assert.ok(!Object.values(DELIVERY_TEMPLATES).flat().includes('finance'));
assert.ok(!Object.values(DELIVERY_TEMPLATES).flat().includes('platform'));

/* ── sanitize：剔除 finance / platform ── */
const cleaned = sanitizeApiKeyScopes([
  'module:shop',
  'module:finance',
  'finance',
  'wallets',
  'module:platform',
  'config:write',
  '  ',
]);
assert.ok(cleaned.includes('module:shop'));
assert.ok(cleaned.includes('config:write'));
for (const bad of FORBIDDEN_MODULE_API_SCOPES) {
  assert.ok(!cleaned.includes(bad), `forbidden scope leaked: ${bad}`);
}
assert.ok(!cleaned.includes('finance'));
assert.ok(!cleaned.includes('wallets'));

const empty = sanitizeApiKeyScopes([]);
assert.deepEqual(empty, ['config:read']);

/* ── effective scopes = key ∩ enabled modules ── */
const eff = effectiveModuleScopes(
  ['module:shop', 'module:billing', 'module:app.tarot', 'config:write'],
  ['shop', 'ops'], // billing/tarot not enabled
);
assert.ok(hasModuleScope(eff, 'shop'));
assert.ok(!hasModuleScope(eff, 'billing'), 'disabled module → no scope');
assert.ok(!hasModuleScope(eff, 'app.tarot'));
assert.ok(eff.has('config:write'));

console.log('OK: module-api-v1 unit matrix passed');

/* ── 可选 HTTP 否定用例 ── */
const base = process.env.AUTH_URL?.replace(/\/$/, '');
const key = process.env.MODULE_API_KEY;
const partner = process.env.MODULE_API_PARTNER;

if (!base || !key || !partner) {
  console.log('SKIP: HTTP denial cases (set AUTH_URL, MODULE_API_KEY, MODULE_API_PARTNER)');
  process.exit(0);
}

async function call(path, opts = {}) {
  const headers = new Headers(opts.headers);
  if (opts.key !== null) {
    headers.set('Authorization', `Bearer ${opts.key ?? key}`);
  }
  if (opts.body) headers.set('Content-Type', 'application/json');
  const res = await fetch(`${base}${path}`, {
    method: opts.method ?? 'GET',
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

{
  const r = await call(`/v1/partners/${partner}`);
  assert.equal(r.status, 200, `meta should 200, got ${r.status}`);
  assert.equal(r.data.partner?.slug, partner);
}

{
  const r = await call(`/v1/partners/${partner}`, { key: 'mk_live_invalid' });
  assert.equal(r.status, 401, 'bad key → 401');
}

{
  const r = await call(`/v1/partners/${partner}`, { key: null });
  assert.equal(r.status, 401, 'missing key → 401');
}

{
  const other = partner === 'orasage' ? 'demo-partner' : 'orasage';
  const r = await call(`/v1/partners/${other}`);
  assert.equal(r.status, 403, 'cross-partner slug → 403');
  assert.equal(r.data.code, 'partner_mismatch');
}

{
  // finance path must not exist / must not succeed
  const r = await call(`/v1/partners/${partner}/finance/wallets`);
  assert.ok(r.status === 404 || r.status === 403, `finance must be denied, got ${r.status}`);
}

{
  // shop without module:shop in effective scopes — if partner lacks shop, expect 403
  const meta = await call(`/v1/partners/${partner}/modules`);
  assert.equal(meta.status, 200);
  const shopScoped = (meta.data.modules ?? []).some(
    (m) => m.moduleKey === 'shop' && m.scoped,
  );
  const shopRes = await call(`/v1/partners/${partner}/shop/products`);
  if (shopScoped) {
    assert.ok([200, 403].includes(shopRes.status));
  } else {
    assert.equal(shopRes.status, 403, 'shop disabled → 403');
    assert.equal(shopRes.data.code, 'module_scope_denied');
  }
}

{
  // write without config:write should 403 if key lacks it
  const r = await call(`/v1/partners/${partner}/shop/storefront`, {
    method: 'PUT',
    body: { homeLayout: 'classic' },
  });
  // 403 (no write / no shop) or 200/422 if key has write+shop
  assert.ok([200, 403, 422].includes(r.status), `unexpected storefront put ${r.status}`);
}

console.log('OK: module-api-v1 HTTP denial cases passed');

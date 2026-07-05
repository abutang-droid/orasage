/**
 * E2E: bazi guest checkout flow (shop email → identify → start → pay)
 *
 * Usage: node bazi-guest-checkout-flow.mjs
 */

const BASE = {
  auth: process.env.E2E_AUTH_URL ?? 'https://auth.orasage.com',
  shop: process.env.E2E_SHOP_URL ?? 'https://shop.orasage.com',
};

function parseSetCookie(headers) {
  const raw = headers.getSetCookie?.() ?? [];
  if (raw.length > 0) return raw;
  const single = headers.get('set-cookie');
  return single ? [single] : [];
}

function extractToken(setCookies) {
  for (const line of setCookies) {
    const match = line.match(/orasage_token=([^;]+)/);
    if (match) return match[1];
  }
  return null;
}

function cookieHeader(token) {
  return `orasage_token=${token}`;
}

async function assertCoupleSkus() {
  for (const sku of [
    'report-bazi-couple-basic',
    'report-bazi-couple-advanced',
    'report-bazi-couple-premium',
  ]) {
    const res = await fetch(`${BASE.auth}/api/products/${encodeURIComponent(sku)}`);
    if (!res.ok) {
      throw new Error(`couple SKU missing: ${sku} (${res.status})`);
    }
    const data = await res.json();
    console.log(`  sku ${sku}: ${data.product?.name} — ${data.product?.priceDisplay}`);
  }
  console.log('[guest-checkout] couple SKUs: ok');
}

async function guestCheckoutFlow({ sku, label }) {
  const email = `e2e-guest-${label}-${Date.now()}@orasage.test`;

  const identifyRes = await fetch(`${BASE.shop}/api/checkout/identify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const identifyData = await identifyRes.json().catch(() => ({}));
  if (!identifyRes.ok) {
    throw new Error(`${label} identify failed: ${identifyRes.status} ${JSON.stringify(identifyData)}`);
  }
  if (identifyData.exists) {
    throw new Error(`${label} expected new user, got exists=true`);
  }

  const cookies = parseSetCookie(identifyRes.headers);
  const token = extractToken(cookies) ?? identifyData.token;
  if (!token) {
    throw new Error(`${label} no token after identify`);
  }
  console.log(`[guest-checkout] ${label}: registered ${email}`);

  const startRes = await fetch(`${BASE.shop}/api/checkout/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      cookie: cookieHeader(token),
    },
    body: JSON.stringify({
      sku,
      appSource: 'bazi',
      planType: 'advanced',
      readingId: `bazi:e2e-${Date.now()}`,
      successUrl: 'https://bazi.orasage.com/?paid=1',
      recommendationContext: `E2E ${label}`,
    }),
  });
  const startData = await startRes.json().catch(() => ({}));
  if (!startRes.ok) {
    throw new Error(`${label} start failed: ${startRes.status} ${JSON.stringify(startData)}`);
  }
  if (!startData.orderNo) {
    throw new Error(`${label} missing orderNo`);
  }
  console.log(`[guest-checkout] ${label}: order ${startData.orderNo}`);

  const orderRes = await fetch(`${BASE.shop}/api/orders/${encodeURIComponent(startData.orderNo)}`, {
    headers: { cookie: cookieHeader(token) },
  });
  const orderData = await orderRes.json().catch(() => ({}));
  if (!orderRes.ok) {
    throw new Error(`${label} load order failed: ${orderRes.status} ${JSON.stringify(orderData)}`);
  }
  if (orderData.order?.status !== 'pending') {
    throw new Error(`${label} expected pending order, got ${orderData.order?.status}`);
  }
  console.log(`[guest-checkout] ${label}: order loaded (${orderData.order.title})`);

  const payRes = await fetch(`${BASE.shop}/api/pay?order=${encodeURIComponent(startData.orderNo)}`, {
    method: 'POST',
    headers: { cookie: cookieHeader(token) },
  });
  const payData = await payRes.json().catch(() => ({}));
  if (!payRes.ok) {
    throw new Error(`${label} pay failed: ${payRes.status} ${JSON.stringify(payData)}`);
  }
  console.log(`[guest-checkout] ${label}: mock pay ok`);
}

async function existingEmailBindFlow() {
  const email = `e2e-existing-${Date.now()}@orasage.test`;
  const password = process.env.E2E_PASSWORD ?? 'E2eTest2026!';

  const regRes = await fetch(`${BASE.auth}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, nickname: 'E2E Existing' }),
  });
  if (!regRes.ok) throw new Error(`register existing user: ${regRes.status}`);

  const identifyRes = await fetch(`${BASE.shop}/api/checkout/identify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const identifyData = await identifyRes.json().catch(() => ({}));
  if (!identifyRes.ok || !identifyData.exists) {
    throw new Error(`expected exists=true for ${email}, got ${JSON.stringify(identifyData)}`);
  }
  console.log('[guest-checkout] existing email identify: ok');

  const bindRes = await fetch(`${BASE.shop}/api/checkout/bind`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const bindData = await bindRes.json().catch(() => ({}));
  if (!bindRes.ok) {
    throw new Error(`bind failed: ${bindRes.status} ${JSON.stringify(bindData)}`);
  }
  const token = extractToken(parseSetCookie(bindRes.headers)) ?? bindData.token;
  if (!token) throw new Error('no token after bind');
  console.log('[guest-checkout] checkout-bind (直接使用): ok');

  const startRes = await fetch(`${BASE.shop}/api/checkout/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie: cookieHeader(token) },
    body: JSON.stringify({
      sku: 'report-bazi-basic',
      appSource: 'bazi',
      planType: 'basic',
      readingId: `bazi:e2e-bind-${Date.now()}`,
    }),
  });
  const startData = await startRes.json().catch(() => ({}));
  if (!startRes.ok || !startData.orderNo) {
    throw new Error(`bind start failed: ${startRes.status} ${JSON.stringify(startData)}`);
  }
  console.log('[guest-checkout] bind + start order:', startData.orderNo);
}

async function main() {
  console.log('=== Bazi guest checkout E2E ===\n');

  console.log('1) Verify couple SKUs in catalog');
  await assertCoupleSkus();

  console.log('\n2) Guest checkout — single advanced');
  await guestCheckoutFlow({ sku: 'report-bazi-advanced', label: 'single' });

  console.log('\n3) Guest checkout — couple advanced');
  await guestCheckoutFlow({ sku: 'report-bazi-couple-advanced', label: 'couple' });

  console.log('\n4) Existing email bind flow');
  await existingEmailBindFlow();

  console.log('\n✅ Bazi guest checkout E2E passed');
}

main().catch((err) => {
  console.error('E2E failed:', err);
  process.exit(1);
});

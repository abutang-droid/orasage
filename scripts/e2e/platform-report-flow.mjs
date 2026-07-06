/**
 * API E2E: bazi / ziwei checkout → mock pay (纯数字报告 SKU，无需收货)
 * Full report generation requires browser flow + reading payload sync.
 * 使用 *-basic SKU：Phase 0 起 *-advanced 含实体需先填收货信息。
 *
 * Usage: node platform-report-flow.mjs
 */

const BASE = {
  auth: process.env.E2E_AUTH_URL ?? 'https://auth.orasage.com',
  bazi: process.env.E2E_BAZI_URL ?? 'https://bazi.orasage.com',
  ziwei: process.env.E2E_ZIWEI_URL ?? 'https://ziwei.orasage.com',
  shop: process.env.E2E_SHOP_URL ?? 'https://shop.orasage.com',
};

const PASSWORD = process.env.E2E_PASSWORD ?? 'E2eTest2026!';

function cookieHeader(token) {
  return `orasage_token=${token}`;
}

async function registerUser() {
  const email = `e2e-platform-${Date.now()}@orasage.test`;
  const res = await fetch(`${BASE.auth}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: PASSWORD, nickname: 'E2E Platform' }),
  });
  if (!res.ok) throw new Error(`register: ${res.status}`);
  const data = await res.json();
  return { token: data.token };
}

async function checkout(app, token, sku) {
  const url = app === 'bazi' ? `${BASE.bazi}/api/checkout` : `${BASE.ziwei}/api/checkout`;
  const successUrl = app === 'bazi' ? `${BASE.bazi}/?paid=1` : `${BASE.ziwei}/chart?paid=1`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie: cookieHeader(token) },
    body: JSON.stringify({
      sku,
      planType: 'advanced',
      readingId: `${app}:e2e-${Date.now()}`,
      recommendationContext: `${app} E2E`,
      successUrl,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${app} checkout ${res.status}: ${JSON.stringify(data)}`);
  if (!data.orderNo) throw new Error(`${app} missing orderNo`);
  return data.orderNo;
}

async function mockPay(token, orderNo) {
  const res = await fetch(`${BASE.shop}/api/pay?order=${encodeURIComponent(orderNo)}`, {
    method: 'POST',
    headers: { cookie: cookieHeader(token) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`pay ${res.status}: ${JSON.stringify(data)}`);
}

async function main() {
  console.log('=== Platform checkout E2E ===\n');
  const user = await registerUser();

  const baziOrder = await checkout('bazi', user.token, 'report-bazi-basic');
  console.log('bazi order:', baziOrder);
  await mockPay(user.token, baziOrder);
  console.log('bazi pay: ok');

  const ziweiOrder = await checkout('ziwei', user.token, 'report-ziwei-basic');
  console.log('ziwei order:', ziweiOrder);
  await mockPay(user.token, ziweiOrder);
  console.log('ziwei pay: ok');

  console.log('\n✅ Platform checkout E2E passed');
}

main().catch((err) => {
  console.error('E2E failed:', err);
  process.exit(1);
});

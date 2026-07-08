/**
 * E2E: UI-001 — double-click mock pay only marks order paid once
 *
 * Usage: node pay-double-click.mjs
 */

import { chromium } from 'playwright';
import { completeShippingIfNeeded } from './lib/checkout-helpers.mjs';

const BASE = {
  auth: process.env.E2E_AUTH_URL ?? 'https://auth.orasage.com',
  shop: process.env.E2E_SHOP_URL ?? 'https://shop.orasage.com',
};

const PASSWORD = process.env.E2E_PASSWORD ?? 'E2eTest2026!';
const SKU = process.env.E2E_PAY_SKU ?? 'crystal-wood';

async function registerUser() {
  const email = `e2e-dblpay-${Date.now()}@orasage.test`;
  const res = await fetch(`${BASE.auth}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: PASSWORD, nickname: 'E2E DblPay' }),
  });
  if (!res.ok) throw new Error(`register failed: ${res.status}`);
  const data = await res.json();
  return { token: data.token };
}

async function createPendingOrder(token) {
  const res = await fetch(`${BASE.shop}/api/checkout`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Cookie: `orasage_token=${token}`,
    },
    body: JSON.stringify({ sku: SKU }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`checkout PUT failed: ${res.status} ${JSON.stringify(data)}`);
  if (!data.orderNo) throw new Error('missing orderNo');
  return data.orderNo;
}

async function fetchOrder(token, orderNo) {
  const res = await fetch(`${BASE.auth}/auth/me/orders`, {
    headers: { Cookie: `orasage_token=${token}` },
  });
  if (!res.ok) throw new Error(`orders ${res.status}`);
  const data = await res.json();
  return (data.orders ?? []).find((o) => o.orderNo === orderNo);
}

async function main() {
  const user = await registerUser();
  const orderNo = await createPendingOrder(user.token);
  console.log(`[pay-dbl] pending order ${orderNo}`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ locale: 'zh-CN' });
  await context.addCookies([
    {
      name: 'orasage_token',
      value: user.token,
      domain: '.orasage.com',
      path: '/',
      secure: true,
      sameSite: 'Lax',
    },
  ]);
  const page = await context.newPage();

  const payResponses = [];
  page.on('response', (res) => {
    if (res.url().includes('/api/pay?order=')) {
      payResponses.push({ status: res.status(), url: res.url() });
    }
  });

  await page.goto(`${BASE.shop}/checkout?order=${encodeURIComponent(orderNo)}`, {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });

  await completeShippingIfNeeded(page);
  const payBtn = page.getByTestId('checkout-mock-pay');
  await payBtn.waitFor({ state: 'visible', timeout: 15000 });

  console.log('[pay-dbl] rapid double-click pay button');
  await Promise.all([
    payBtn.click({ force: true }),
    payBtn.click({ force: true }),
  ]);

  await page.waitForTimeout(2500);

  const successes = payResponses.filter((r) => r.status === 200).length;
  const conflicts = payResponses.filter((r) => r.status === 409).length;
  console.log(`[pay-dbl] pay API responses: ${JSON.stringify(payResponses)}`);

  const order = await fetchOrder(user.token, orderNo);
  if (!order || order.status !== 'paid') {
    throw new Error(`order not paid once: ${JSON.stringify(order)}`);
  }

  const paidCount = (await fetch(`${BASE.auth}/auth/me/orders`, {
    headers: { Cookie: `orasage_token=${user.token}` },
  }).then((r) => r.json())).orders.filter((o) => o.orderNo === orderNo && o.status === 'paid').length;

  if (paidCount !== 1) {
    throw new Error(`expected exactly 1 paid row for ${orderNo}, got ${paidCount}`);
  }

  if (successes > 1) {
    throw new Error(`UI-001 FAIL: multiple successful pay responses (${successes})`);
  }

  console.log(`[pay-dbl] OK — successes=${successes}, conflicts=${conflicts}, order paid once`);
  await browser.close();
}

main().catch((err) => {
  console.error('[pay-dbl] FAIL', err);
  process.exit(1);
});

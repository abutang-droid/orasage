/**
 * E2E: NET-002 — pay fails offline (order stays pending), retry succeeds online
 *
 * Usage: node pay-network-retry.mjs
 */

import { chromium } from 'playwright';
import { completeShippingIfNeeded, mockPayButton } from './lib/checkout-helpers.mjs';

const BASE = {
  auth: process.env.E2E_AUTH_URL ?? 'https://auth.orasage.com',
  shop: process.env.E2E_SHOP_URL ?? 'https://shop.orasage.com',
};

const PASSWORD = process.env.E2E_PASSWORD ?? 'E2eTest2026!';
const SKU = process.env.E2E_PAY_SKU ?? 'crystal-wood';

async function registerUser() {
  const email = `e2e-net-${Date.now()}@orasage.test`;
  const res = await fetch(`${BASE.auth}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: PASSWORD, nickname: 'E2E Net' }),
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
  console.log(`[pay-net] pending order ${orderNo}`);

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

  await page.goto(`${BASE.shop}/checkout?order=${encodeURIComponent(orderNo)}`, {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });

  await completeShippingIfNeeded(page);
  const payBtn = page.getByTestId('checkout-mock-pay');
  await payBtn.waitFor({ state: 'visible', timeout: 15000 });

  console.log('[pay-net] go offline and attempt pay');
  await context.setOffline(true);
  await payBtn.click();

  const errorLine = page.locator('main p.text-red-400, main p[class*="red"]');
  await errorLine.waitFor({ state: 'visible', timeout: 15000 });
  const errorText = await errorLine.textContent();
  if (!errorText?.trim()) {
    throw new Error('expected visible pay error while offline');
  }
  console.log(`[pay-net] offline error shown: ${errorText.trim()}`);

  await payBtn.waitFor({ state: 'visible', timeout: 5000 });
  const disabled = await payBtn.isDisabled();
  if (disabled) {
    throw new Error('pay button should be re-enabled for retry after network failure');
  }

  let order = await fetchOrder(user.token, orderNo);
  if (!order || order.status !== 'pending') {
    throw new Error(`NET-002 FAIL: order should stay pending offline, got ${JSON.stringify(order)}`);
  }
  console.log('[pay-net] order still pending after offline attempt OK');

  console.log('[pay-net] restore network and retry pay');
  await context.setOffline(false);
  await payBtn.click();

  await page.waitForURL(/shop\.orasage\.com\/success/, { timeout: 60000 }).catch(async () => {
    await page.getByText(/支付成功/).waitFor({ timeout: 10000 });
  });

  for (let i = 0; i < 10; i++) {
    order = await fetchOrder(user.token, orderNo);
    if (order?.status === 'paid') break;
    await new Promise((r) => setTimeout(r, 1500));
  }
  if (!order || order.status !== 'paid') {
    throw new Error(`retry pay did not mark order paid: ${JSON.stringify(order)}`);
  }

  console.log('[pay-net] NET-002 passed — pending → retry → paid');
  await browser.close();
}

main().catch((err) => {
  console.error('[pay-net] FAIL', err);
  process.exit(1);
});

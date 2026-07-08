/**
 * E2E: TC-SHOP-001 — shop direct crystal purchase (logged in)
 *
 * Usage: node shop-crystal-flow.mjs
 */

import { chromium } from 'playwright';
import { BUY_BUTTON, clickMockPay } from './lib/checkout-helpers.mjs';

const BASE = {
  auth: process.env.E2E_AUTH_URL ?? 'https://auth.orasage.com',
  shop: process.env.E2E_SHOP_URL ?? 'https://shop.orasage.com',
};

const PASSWORD = process.env.E2E_PASSWORD ?? 'E2eTest2026!';

async function registerUser() {
  const email = `e2e-shop-${Date.now()}@orasage.test`;
  const res = await fetch(`${BASE.auth}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: PASSWORD, nickname: 'E2E Shop' }),
  });
  if (!res.ok) throw new Error(`register failed: ${res.status}`);
  const data = await res.json();
  return { email, token: data.token, userId: data.user.id };
}

async function setAuthCookie(context, token) {
  await context.addCookies([
    {
      name: 'orasage_token',
      value: token,
      domain: '.orasage.com',
      path: '/',
      secure: true,
      sameSite: 'Lax',
    },
  ]);
}

async function fetchOrders(token) {
  const res = await fetch(`${BASE.auth}/auth/me/orders`, {
    headers: { Cookie: `orasage_token=${token}` },
  });
  if (!res.ok) throw new Error(`orders fetch ${res.status}`);
  const data = await res.json();
  return data.orders ?? [];
}

async function main() {
  const user = await registerUser();
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ locale: 'zh-CN' });
  await setAuthCookie(context, user.token);
  const page = await context.newPage();

  const ordersBefore = await fetchOrders(user.token);
  const paidBefore = ordersBefore.filter((o) => o.status === 'paid').length;

  console.log('[shop-crystal] browse crystal category');
  await page.goto(`${BASE.shop}/?cat=crystal`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => null);

  const buyButton = page.getByRole('button', { name: BUY_BUTTON }).first();
  await buyButton.waitFor({ state: 'visible', timeout: 20000 });
  await buyButton.click();

  await page.waitForURL(/shop\.orasage\.com\/(checkout|success)/, { timeout: 60000 });
  if (page.url().includes('/checkout')) {
    console.log('[shop-crystal] on checkout — mock pay');
    await clickMockPay(page);
    await page.waitForURL(/shop\.orasage\.com\/success/, { timeout: 60000 });
  } else {
    console.log('[shop-crystal] direct success (inline mock pay)');
  }

  await page.getByText(/支付成功|订单已完成|success/i).first().waitFor({ timeout: 15000 }).catch(() => null);

  let paidAfter = paidBefore;
  for (let i = 0; i < 12; i++) {
    const orders = await fetchOrders(user.token);
    paidAfter = orders.filter((o) => o.status === 'paid').length;
    if (paidAfter > paidBefore) break;
    await new Promise((r) => setTimeout(r, 2000));
  }
  if (paidAfter <= paidBefore) {
    throw new Error('no new paid order after shop crystal purchase');
  }

  console.log(`[shop-crystal] paid orders ${paidBefore} → ${paidAfter}`);
  await browser.close();
  console.log('[shop-crystal] TC-SHOP-001 passed');
}

main().catch((err) => {
  console.error('[shop-crystal] FAIL', err);
  process.exit(1);
});

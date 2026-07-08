/**
 * Browser E2E: ziwei single + couple → paywall → mock pay → report
 * Usage: node ziwei-shop-flow.mjs
 */

import { chromium } from 'playwright';
import { clickMockPay } from './lib/checkout-helpers.mjs';

const BASE = {
  auth: process.env.E2E_AUTH_URL ?? 'https://auth.orasage.com',
  ziwei: process.env.E2E_ZIWEI_URL ?? 'https://ziwei.orasage.com',
  shop: process.env.E2E_SHOP_URL ?? 'https://shop.orasage.com',
};

const PASSWORD = 'E2eTest2026!';
const LANG = 'zh-CN';

const L = {
  planSingle: '定制专属能量手串',
  planCouple: '定制双人能量手串',
  demoPay: '模拟支付（完成订单）',
  hemingTab: '双人合盘',
  person1: '第一人',
  person2: '第二人',
  submitCouple: '开始合盘',
};

async function registerUser() {
  const email = `e2e-ziwei-${Date.now()}@orasage.test`;
  const res = await fetch(`${BASE.auth}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: PASSWORD, nickname: 'E2E Ziwei' }),
  });
  if (!res.ok) throw new Error(`register failed: ${res.status}`);
  const data = await res.json();
  return { token: data.token };
}

async function setAuthCookie(context, token) {
  await context.addCookies([{
    name: 'orasage_token',
    value: token,
    domain: '.orasage.com',
    path: '/',
    secure: true,
    sameSite: 'Lax',
  }]);
}

async function waitForReport(token, { titleIncludes, maxWaitMs = 120000 } = {}) {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    const res = await fetch(`${BASE.auth}/auth/me/readings`, {
      headers: { Cookie: `orasage_token=${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      const readings = data.readings ?? [];
      const match = titleIncludes
        ? readings.find((r) => r.reportUrl && r.title?.includes(titleIncludes))
        : readings.find((r) => r.reportUrl && r.title?.includes('紫微'));
      if (match) return match;
    }
    await new Promise((r) => setTimeout(r, 5000));
  }
  return null;
}

async function fillBirthDate(page, { year, month, day }) {
  const selects = page.getByText('出生日期（公历）').locator('..').locator('select');
  await selects.nth(0).selectOption(String(year));
  await selects.nth(1).selectOption(String(month));
  await selects.nth(2).selectOption(String(day));
}

async function runSingleFlow(page) {
  // URL params y/m/d/h/g auto-trigger chart (see ziwei/lib/ziwei/share.ts)
  await page.goto(
    `${BASE.ziwei}/chart?lang=${LANG}&y=1990&m=6&d=15&h=8&g=m`,
    { waitUntil: 'domcontentloaded', timeout: 60000 },
  );
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => null);

  const planButton = page.getByRole('button', { name: L.planSingle });
  await planButton.waitFor({ timeout: 60000 });

  await planButton.click();
  await page.waitForURL(/shop\.orasage\.com\/checkout/, { timeout: 60000 });
  await page.getByTestId('checkout-mock-pay').click();
  await page.waitForURL(/ziwei\.orasage\.com.*paid=1/, { timeout: 90000 });
}

async function runCoupleFlow(page) {
  await page.goto(`${BASE.ziwei}/chart?lang=${LANG}&mode=heming`, {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => null);

  await page.getByRole('button', { name: L.person1, exact: true }).click();
  await fillBirthDate(page, { year: 1990, month: 6, day: 15 });

  await page.getByRole('button', { name: L.person2, exact: true }).click();
  await fillBirthDate(page, { year: 1992, month: 3, day: 20 });

  await page.getByRole('button', { name: L.submitCouple }).click();

  const planButton = page.getByRole('button', { name: L.planCouple });
  await planButton.waitFor({ timeout: 60000 });
  await planButton.click();

  await page.waitForURL(/shop\.orasage\.com\/checkout/, { timeout: 60000 });
  await page.getByTestId('checkout-mock-pay').click();
  await page.waitForURL(/ziwei\.orasage\.com.*paid=1/, { timeout: 90000 });
}

async function main() {
  console.log('=== Ziwei browser E2E ===\n');
  const user = await registerUser();
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ locale: 'zh-CN' });
  await setAuthCookie(context, user.token);
  const page = await context.newPage();

  try {
    console.log('--- Single ziwei flow ---');
    await runSingleFlow(page);
    console.log('Single: paid + returned to chart');

    const singleReading = await waitForReport(user.token, { titleIncludes: '紫微' });
    if (!singleReading?.reportUrl) throw new Error('Single ziwei report URL not ready');
    console.log(`Single report: ${singleReading.title} → ${singleReading.reportUrl}`);
    const singleRes = await fetch(singleReading.reportUrl);
    console.log(`Single report HTTP: ${singleRes.status}`);
    if (singleRes.status !== 200) throw new Error('Single report not accessible');

    console.log('\n--- Couple ziwei flow ---');
    await runCoupleFlow(page);
    console.log('Couple: paid + returned to chart');

    const coupleReading = await waitForReport(user.token, { titleIncludes: '合盘', maxWaitMs: 120000 });
    if (!coupleReading?.reportUrl) throw new Error('Couple ziwei report URL not ready');
    console.log(`Couple report: ${coupleReading.title} → ${coupleReading.reportUrl}`);
    const coupleRes = await fetch(coupleReading.reportUrl);
    console.log(`Couple report HTTP: ${coupleRes.status}`);
    if (coupleRes.status !== 200) throw new Error('Couple report not accessible');

    console.log('\n✅ Ziwei browser E2E passed (single + couple)');
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error('E2E failed:', err);
  process.exit(1);
});

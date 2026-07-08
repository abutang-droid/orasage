/**
 * Browser E2E: ziwei single + couple → checkout → mock pay → report
 * Usage: node ziwei-shop-flow.mjs
 */

import { chromium } from 'playwright';

const BASE = {
  auth: process.env.E2E_AUTH_URL ?? 'https://auth.orasage.com',
  ziwei: process.env.E2E_ZIWEI_URL ?? 'https://ziwei.orasage.com',
  shop: process.env.E2E_SHOP_URL ?? 'https://shop.orasage.com',
};

const PASSWORD = 'E2eTest2026!';
const LANG = 'zh-CN';

const L = {
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

async function waitForReport(token, { titleIncludes, maxWaitMs = 180000 } = {}) {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    const res = await fetch(`${BASE.auth}/auth/me/readings`, {
      headers: { Cookie: `orasage_token=${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      const readings = data.readings ?? [];
      const match = titleIncludes
        ? readings.find((r) => (r.detailUrl || r.reportUrl) && r.title?.includes(titleIncludes))
        : readings.find((r) => (r.detailUrl || r.reportUrl) && r.title?.includes('紫微'));
      if (match) {
        return { ...match, reportUrl: match.detailUrl || match.reportUrl };
      }
    }
    await new Promise((r) => setTimeout(r, 5000));
  }
  return null;
}

async function fillBirthDate(page, { year, month, day }) {
  const selects = page.locator('select.ziwei-field-select--compact');
  await selects.first().waitFor({ state: 'visible', timeout: 20000 });
  await selects.nth(0).selectOption(String(year));
  await selects.nth(1).selectOption(String(month));
  await selects.nth(2).selectOption(String(day));
}

async function waitForReadingId(page, timeoutMs = 90000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const readingId = await page.evaluate(() => sessionStorage.getItem('ziwei:lastReadingId'));
    if (readingId) return readingId;
    await page.waitForTimeout(500);
  }
  throw new Error('ziwei:lastReadingId not set after chart load');
}

async function startZiweiCheckout(page, token, { sku = 'report-ziwei-basic' } = {}) {
  const readingId = await waitForReadingId(page);
  const orderNo = await page.evaluate(async ({ sku }) => {
    const readingId = sessionStorage.getItem('ziwei:lastReadingId');
    if (!readingId) throw new Error('missing ziwei:lastReadingId');
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        sku,
        readingId,
        recommendationContext: 'E2E ziwei browser flow',
        successUrl: `${window.location.origin}/chart?paid=1`,
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.orderNo) {
      throw new Error(`checkout failed: ${res.status} ${JSON.stringify(data)}`);
    }
    return data.orderNo;
  }, { sku });

  console.log(`[ziwei-flow] order ${orderNo} (${sku})`);
  const payRes = await fetch(`${BASE.shop}/api/pay?order=${encodeURIComponent(orderNo)}`, {
    method: 'POST',
    headers: { Cookie: `orasage_token=${token}` },
  });
  const payData = await payRes.json().catch(() => ({}));
  if (!payRes.ok) {
    throw new Error(`mock pay failed: ${payRes.status} ${JSON.stringify(payData)}`);
  }

  await page.goto(
    `${BASE.ziwei}/chart?rid=${encodeURIComponent(readingId)}&paid=1&focus=chat`,
    { waitUntil: 'domcontentloaded', timeout: 60000 },
  );
  await page.locator('.ziwei-result-chart').waitFor({ state: 'visible', timeout: 90000 });
}

async function runSingleFlow(page, token) {
  await page.goto(
    `${BASE.ziwei}/chart?lang=${LANG}&y=1990&m=6&d=15&h=8&g=m`,
    { waitUntil: 'domcontentloaded', timeout: 60000 },
  );
  await page.locator('.ziwei-result-chart').waitFor({ state: 'visible', timeout: 90000 });
  await startZiweiCheckout(page, token);
}

async function runCoupleFlow(page, token) {
  await page.evaluate(() => {
    sessionStorage.removeItem('ziwei:chartSession');
    sessionStorage.removeItem('ziwei:lastReadingId');
  });
  await page.goto(`${BASE.ziwei}/chart?lang=${LANG}&mode=heming`, {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => null);

  await page.getByRole('button', { name: L.person1, exact: true }).waitFor({
    state: 'visible',
    timeout: 30000,
  });
  await fillBirthDate(page, { year: 1990, month: 6, day: 15 });

  await page.getByRole('button', { name: L.person2, exact: true }).click();
  await fillBirthDate(page, { year: 1992, month: 3, day: 20 });

  await page.getByRole('button', { name: L.submitCouple }).click();
  await page.locator('.ziwei-result-chart').waitFor({ state: 'visible', timeout: 90000 });
  await startZiweiCheckout(page, token, { sku: 'report-ziwei-basic' });
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
    await runSingleFlow(page, user.token);
    console.log('Single: paid + returned to chart');

    const singleReading = await waitForReport(user.token, { titleIncludes: '紫微' });
    if (!singleReading?.reportUrl) throw new Error('Single ziwei report URL not ready');
    console.log(`Single report: ${singleReading.title} → ${singleReading.reportUrl}`);
    const singleRes = await fetch(singleReading.reportUrl);
    console.log(`Single report HTTP: ${singleRes.status}`);
    if (singleRes.status !== 200) throw new Error('Single report not accessible');

    console.log('\n--- Couple ziwei flow ---');
    await runCoupleFlow(page, user.token);
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

/**
 * Browser E2E: bazi shop pay → profile report link
 * Single + couple flows against production (orasage.com)
 *
 * Usage: node profile-shop-flow.mjs
 * Env:   E2E_BASE=https://... (optional, defaults to production)
 */

import { chromium } from 'playwright';

const BASE = {
  auth: process.env.E2E_AUTH_URL ?? 'https://auth.orasage.com',
  bazi: process.env.E2E_BAZI_URL ?? 'https://bazi.orasage.com',
  shop: process.env.E2E_SHOP_URL ?? 'https://shop.orasage.com',
  main: process.env.E2E_MAIN_URL ?? 'https://orasage.com',
};

const PASSWORD = 'E2eTest2026!';

async function registerUser() {
  const email = `e2e-ui-${Date.now()}@orasage.test`;
  const res = await fetch(`${BASE.auth}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: PASSWORD, nickname: 'E2E UI' }),
  });
  if (!res.ok) throw new Error(`register failed: ${res.status} ${await res.text()}`);
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

/** Click date field by label (年/月/日) and type value */
async function setDateField(page, label, value) {
  const col = page.locator('span').filter({ hasText: new RegExp(`^${label}$`) }).first().locator('xpath=..');
  await col.click();
  const input = col.locator('input');
  await input.waitFor({ state: 'visible', timeout: 5000 });
  await input.fill(value);
  await input.press('Enter');
}

async function fillPerson(page, { name, gender = '男', personTab }) {
  if (personTab) {
    await page.getByRole('button', { name: personTab, exact: true }).click();
  }
  await page.locator('input[type="text"]').first().fill(name);
  await page.getByRole('button', { name: gender, exact: true }).first().click();
  await setDateField(page, '年', '1990');
  await setDateField(page, '月', '06');
  await setDateField(page, '日', '15');
}

async function runBaziFlow(page, { mode, person1, person2, planName }) {
  await page.goto(BASE.bazi, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => null);

  if (mode === 'couple') {
    await page.getByRole('button', { name: '双人合盘' }).click();
    await fillPerson(page, { ...person1, personTab: '第一位' });
    await fillPerson(page, { ...person2, personTab: '第二位' });
    await page.getByRole('button', { name: '开始合盘' }).click();
  } else {
    await fillPerson(page, person1);
    await page.getByRole('button', { name: '开始排盘' }).click();
  }

  await page.waitForSelector('text=日主', { timeout: 45000 });

  const planButton = page.getByRole('button', { name: planName });
  await planButton.waitFor({ timeout: 20000 });
  await planButton.click();

  await page.waitForURL(/shop\.orasage\.com\/checkout/, { timeout: 30000 });
  await page.getByRole('button', { name: '演示支付（完成订单）' }).click();

  await page.waitForURL(/bazi\.orasage\.com.*paid=1/, { timeout: 60000 });
  await page.waitForSelector('text=支付成功', { timeout: 15000 }).catch(() => null);

  // Wait for report-job (server-side) — poll profile API
  return page.url();
}

async function waitForReportLink(token, { titleIncludes, maxWaitMs = 120000 } = {}) {
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
        : readings.find((r) => r.reportUrl);
      if (match) return match;
    }
    await new Promise((r) => setTimeout(r, 5000));
  }
  return null;
}

async function checkProfileUI(page) {
  await page.goto(`${BASE.main}/zh-CN/profile/readings`, { waitUntil: 'networkidle', timeout: 60000 });
  const link = page.getByRole('link', { name: '查看报告' });
  await link.first().waitFor({ timeout: 30000 });
  const href = await link.first().getAttribute('href');
  return href;
}

async function main() {
  console.log('=== OraSage browser E2E: profile shop flow ===\n');
  const user = await registerUser();
  console.log(`Registered: ${user.email} (id=${user.userId})`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  await setAuthCookie(context, user.token);
  const page = await context.newPage();

  const results = { single: false, couple: false, profileLink: null, reportUrl: null };

  try {
    console.log('\n--- Single bazi flow ---');
    await runBaziFlow(page, {
      mode: 'single',
      person1: { name: 'UI单人测试' },
      planName: '定制专属能量手串',
    });
    console.log('Single: paid + returned to bazi');
    results.single = true;

    const reading = await waitForReportLink(user.token);
    if (reading?.reportUrl) {
      results.reportUrl = reading.reportUrl;
      console.log(`Report URL: ${reading.reportUrl}`);
      const reportRes = await fetch(reading.reportUrl);
      console.log(`Report HTTP: ${reportRes.status}`);
    } else {
      console.warn('Report URL not ready within timeout');
    }

    console.log('\n--- Profile UI ---');
    results.profileLink = await checkProfileUI(page);
    console.log(`Profile link: ${results.profileLink}`);
    results.profileLink = !!results.profileLink;

    console.log('\n--- Couple bazi flow ---');
    await page.goto(BASE.bazi, { waitUntil: 'networkidle' });
    await runBaziFlow(page, {
      mode: 'couple',
      person1: { name: 'UI甲' },
      person2: { name: 'UI乙' },
      planName: '定制双人能量手串',
    });
    console.log('Couple: paid + returned to bazi');
    results.couple = true;

    const coupleReading = await waitForReportLink(user.token, { titleIncludes: '合盘', maxWaitMs: 90000 });
    if (coupleReading?.title?.includes('合盘')) {
      console.log(`Couple report: ${coupleReading.title} → ${coupleReading.reportUrl ?? 'pending'}`);
    }
  } finally {
    await browser.close();
  }

  console.log('\n=== RESULTS ===');
  console.log(JSON.stringify(results, null, 2));

  const ok = results.single && results.couple && results.profileLink && results.reportUrl;
  if (!ok) process.exit(1);
  console.log('\n✅ All browser E2E checks passed');
}

main().catch((err) => {
  console.error('E2E failed:', err);
  process.exit(1);
});

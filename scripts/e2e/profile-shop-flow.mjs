/**
 * Browser E2E: bazi shop pay → profile report link
 * Single + couple flows against production (orasage.com)
 *
 * Usage: node profile-shop-flow.mjs
 */

import { chromium } from 'playwright';
import { fillBaziPerson } from './lib/bazi-helpers.mjs';
import { clickMockPay } from './lib/checkout-helpers.mjs';

const BASE = {
  auth: process.env.E2E_AUTH_URL ?? 'https://auth.orasage.com',
  bazi: process.env.E2E_BAZI_URL ?? 'https://bazi.orasage.com',
  shop: process.env.E2E_SHOP_URL ?? 'https://shop.orasage.com',
  main: process.env.E2E_MAIN_URL ?? 'https://orasage.com',
};

const PASSWORD = 'E2eTest2026!';
const LANG = 'zh-CN';

const L = {
  modeSingle: '单人排盘',
  modeCouple: '双人合盘',
  person1: '第一位',
  person2: '第二位',
  submitSingle: '开始排盘',
  submitCouple: '开始合盘',
  genderM: '男',
  planSingle: '定制专属能量手串',
  planCouple: '定制双人能量手串',
  dayMaster: '日主',
  coupleScore: '双人合盘综合评分',
  demoPay: '模拟支付（完成订单）',
  viewReport: '查看报告',
  paidToast: '支付成功',
};

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

async function fillPerson(page, opts) {
  await fillBaziPerson(page, {
    ...opts,
    genderLabel: L.genderM,
  });
}

async function selectPlanAndPay(page, planType = 'advanced') {
  await page.locator('[data-testid="bazi-paywall"]').waitFor({ state: 'visible', timeout: 60000 });
  await page.locator(`[data-plan="${planType}"]`).click();
  await page.locator('[data-testid="bazi-paywall-unlock"]').click();
}

async function runBaziFlow(page, { mode, person1, person2, planType, resultHint }) {
  await page.goto(`${BASE.bazi}?lang=${LANG}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => null);

  if (mode === 'couple') {
    await page.getByRole('button', { name: L.modeCouple }).click();
    await fillPerson(page, { ...person1, personTab: L.person1 });
    await fillPerson(page, { ...person2, personTab: L.person2 });
    await page.getByRole('button', { name: L.submitCouple }).click();
  } else {
    await fillPerson(page, person1);
    await page.getByRole('button', { name: L.submitSingle }).click();
  }

  await page.getByText(resultHint, { exact: false }).first().waitFor({ timeout: 90000 });

  await selectPlanAndPay(page, planType ?? 'advanced');

  await page.waitForURL(/shop\.orasage\.com\/checkout/, { timeout: 60000 });
  await clickMockPay(page);

  await page.waitForURL(/bazi\.orasage\.com.*paid=1/, { timeout: 90000 });
  await page.getByText(L.paidToast).waitFor({ timeout: 15000 }).catch(() => null);
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
  for (let attempt = 0; attempt < 6; attempt++) {
    await page.goto(`${BASE.main}/zh-CN/profile/readings`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => null);
    const link = page.getByRole('link', { name: L.viewReport });
    if ((await link.count()) > 0) {
      await link.first().waitFor({ state: 'visible', timeout: 10000 });
      return await link.first().getAttribute('href');
    }
    await new Promise((r) => setTimeout(r, 5000));
  }
  throw new Error('Profile view report link not visible after retries');
}

async function main() {
  console.log('=== OraSage browser E2E: profile shop flow ===\n');
  const user = await registerUser();
  console.log(`Registered: ${user.email} (id=${user.userId})`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ locale: 'zh-CN' });
  await setAuthCookie(context, user.token);
  const page = await context.newPage();

  const results = { single: false, couple: false, profileLink: null, reportUrl: null, coupleReport: null };

  try {
    console.log('\n--- Single bazi flow ---');
    await runBaziFlow(page, {
      mode: 'single',
      person1: { name: 'UI单人测试' },
      planType: 'advanced',
      resultHint: L.dayMaster,
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
      throw new Error('Single report URL not ready');
    }

    console.log('\n--- Profile UI ---');
    const href = await checkProfileUI(page);
    results.profileLink = href;
    console.log(`Profile link: ${href}`);
    if (!href) throw new Error('Profile view report link missing');

    console.log('\n--- Couple bazi flow ---');
    await runBaziFlow(page, {
      mode: 'couple',
      person1: { name: 'UI甲' },
      person2: { name: 'UI乙' },
      planType: 'advanced',
      resultHint: L.coupleScore,
    });
    console.log('Couple: paid + returned to bazi');
    results.couple = true;

    const coupleReading = await waitForReportLink(user.token, { titleIncludes: '合盘', maxWaitMs: 180000 });
    if (coupleReading?.reportUrl) {
      results.coupleReport = coupleReading.reportUrl;
      console.log(`Couple report: ${coupleReading.title} → ${coupleReading.reportUrl}`);
      const reportRes = await fetch(coupleReading.reportUrl);
      console.log(`Couple report HTTP: ${reportRes.status}`);
    } else {
      throw new Error('Couple report URL not ready');
    }
  } finally {
    await browser.close();
  }

  console.log('\n=== RESULTS ===');
  console.log(JSON.stringify(results, null, 2));
  console.log('\n✅ All browser E2E checks passed');
}

main().catch((err) => {
  console.error('E2E failed:', err);
  process.exit(1);
});

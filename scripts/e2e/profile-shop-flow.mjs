/**
 * Browser E2E: bazi shop pay → profile report link
 * Single + couple flows against production (orasage.com)
 *
 * Usage: node profile-shop-flow.mjs
 */

import { chromium } from 'playwright';

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

async function fillPerson(page, { name, personTab }) {
  if (personTab) {
    await page.getByRole('button', { name: personTab, exact: true }).click();
  }
  await page.locator('input[type="text"]').first().fill(name);
  await page.getByRole('button', { name: L.genderM, exact: true }).first().click();
}

async function runBaziFlow(page, { mode, person1, person2, planName, resultHint }) {
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

  await page.waitForSelector(`text=${resultHint}`, { timeout: 60000 });

  const planButton = page.getByRole('button', { name: planName });
  await planButton.waitFor({ timeout: 20000 });
  await planButton.click();

  await page.waitForURL(/shop\.orasage\.com\/checkout/, { timeout: 60000 });
  await page.getByRole('button', { name: L.demoPay }).click();

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
  await page.goto(`${BASE.main}/zh-CN/profile/readings`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => null);
  const link = page.getByRole('link', { name: L.viewReport });
  await link.first().waitFor({ timeout: 30000 });
  return await link.first().getAttribute('href');
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
      planName: L.planSingle,
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
      planName: L.planCouple,
      resultHint: L.coupleScore,
    });
    console.log('Couple: paid + returned to bazi');
    results.couple = true;

    const coupleReading = await waitForReportLink(user.token, { titleIncludes: '合盘', maxWaitMs: 90000 });
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

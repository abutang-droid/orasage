#!/usr/bin/env node
/**
 * 全站底栏自检：除 Main 门户首页外，所有页面应有固定底栏
 */
import { chromium } from 'playwright';

const MAIN = process.env.MAIN_URL || 'http://127.0.0.1:3100';
const SHOP = process.env.SHOP_URL || 'http://127.0.0.1:3102';
const ZIWEI = process.env.ZIWEI_URL || 'http://127.0.0.1:3111';
const AUTH = process.env.AUTH_URL || 'http://127.0.0.1:3101';

const failures = [];

function check(name, ok, detail = '') {
  if (!ok) failures.push({ name, detail });
  console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`);
}

async function expectNav(page, label) {
  const nav = page.locator('.orasage-app-bottomnav');
  let visible = false;
  try {
    await nav.waitFor({ state: 'visible', timeout: 10000 });
    visible = true;
  } catch {
    visible = false;
  }
  check(`${label} bottom nav visible`, visible);
  if (visible) {
    const pos = await nav.evaluate((el) => getComputedStyle(el).position);
    check(`${label} bottom nav fixed`, pos === 'fixed', pos);
  }
}

async function expectNoNav(page, label) {
  const count = await page.locator('.orasage-app-bottomnav').count();
  check(`${label} NO bottom nav`, count === 0, `count=${count}`);
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

  const mainPagesWithNav = [
    '/zh-CN/famous',
    '/zh-CN/daozang',
    '/zh-CN/about',
    '/zh-CN/terms',
    '/zh-CN/privacy',
    '/zh-CN/faq',
    '/zh-CN/profile',
    '/zh-CN/profile/about',
    '/zh-CN/profile/terms',
    '/zh-CN/profile/privacy',
    '/zh-CN/profile/orders',
    '/zh-CN/profile/readings',
  ];

  await page.goto(`${MAIN}/zh-CN`, { waitUntil: 'domcontentloaded' });
  await expectNoNav(page, 'main homepage');

  for (const path of mainPagesWithNav) {
    await page.goto(`${MAIN}${path}`, { waitUntil: 'domcontentloaded' });
    await expectNav(page, path);
  }

  await page.goto(`${SHOP}/`, { waitUntil: 'domcontentloaded' });
  await expectNav(page, 'shop home');

  await page.goto(`${SHOP}/success?order=demo`, { waitUntil: 'domcontentloaded' });
  await expectNav(page, 'shop success');

  await page.goto(`${ZIWEI}/chart?lang=zh-CN`, { waitUntil: 'domcontentloaded' });
  await expectNav(page, 'ziwei chart');

  try {
    await page.goto(`${AUTH}/login`, { waitUntil: 'domcontentloaded', timeout: 8000 });
    await expectNav(page, 'auth login');
  } catch {
    check('auth login (skipped — server not running)', true, 'skipped');
  }

  await browser.close();

  if (failures.length) {
    console.error('\nFAILED:', failures);
    process.exit(1);
  }
  console.log('\nAll portal bottom-nav checks passed.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

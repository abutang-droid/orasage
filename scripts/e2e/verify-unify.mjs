#!/usr/bin/env node
/**
 * 本地自检：固定底栏 + Ziwei 合盘 Tab
 * 用法：node scripts/e2e/verify-unify.mjs
 */
import { chromium } from 'playwright';

const ZIWEI = process.env.ZIWEI_URL || 'http://127.0.0.1:3111';
const MAIN = process.env.MAIN_URL || 'http://127.0.0.1:3100';

const failures = [];

function check(name, ok, detail = '') {
  if (!ok) failures.push({ name, detail });
  console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`);
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

  // 1. Ziwei /chart 有固定底栏
  await page.goto(`${ZIWEI}/chart?lang=zh-CN`, { waitUntil: 'domcontentloaded' });
  const chartNav = page.locator('.orasage-app-bottomnav');
  check('ziwei /chart bottom nav visible', await chartNav.isVisible());
  const chartNavPos = await chartNav.evaluate((el) => getComputedStyle(el).position);
  check('ziwei /chart bottom nav position fixed', chartNavPos === 'fixed', chartNavPos);

  // 2. Ziwei 合盘 Tab 切换
  await page.getByRole('button', { name: /双人合盘|合盘/ }).click();
  await page.waitForTimeout(300);
  const personTabs = page.getByRole('button', { name: /第一人|第二人/ });
  const tabCount = await personTabs.count();
  check('ziwei heming has person tabs', tabCount >= 2, `count=${tabCount}`);
  const formCount = await page.locator('form').count();
  check('ziwei heming shows one form at a time', formCount === 1, `forms=${formCount}`);
  await personTabs.nth(1).click();
  await page.waitForTimeout(200);
  check('ziwei heming tab switch works', await personTabs.nth(1).evaluate((el) => {
    const bg = getComputedStyle(el).backgroundImage;
    return bg.includes('gradient') || getComputedStyle(el).color === 'rgb(255, 255, 255)';
  }));

  // 3. Ziwei 子页底栏
  await page.goto(`${ZIWEI}/knowledge?lang=zh-CN`, { waitUntil: 'domcontentloaded' });
  check('ziwei /knowledge bottom nav', await page.locator('.orasage-app-bottomnav').isVisible());

  // 4. Main 首页无底栏，profile 有底栏
  await page.goto(`${MAIN}/zh-CN`, { waitUntil: 'domcontentloaded' });
  check('main homepage NO bottom nav', (await page.locator('.orasage-app-bottomnav').count()) === 0);
  await page.goto(`${MAIN}/zh-CN/profile`, { waitUntil: 'domcontentloaded' });
  check('main /profile bottom nav', await page.locator('.orasage-app-bottomnav').isVisible());

  await browser.close();

  if (failures.length) {
    console.error('\nFAILED:', failures);
    process.exit(1);
  }
  console.log('\nAll unify checks passed.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

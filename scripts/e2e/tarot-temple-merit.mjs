/**
 * E2E: TC-TAROT-002 — temple worship + merit accumulation (guest)
 *
 * Usage: node tarot-temple-merit.mjs
 */

import { chromium } from 'playwright';

const BASE = {
  tarot: process.env.E2E_TAROT_URL ?? 'https://tarot.orasage.com',
};

async function readMerit(page) {
  return page.evaluate(async () => {
    const res = await fetch('/api/merit', { credentials: 'include' });
    const data = await res.json();
    return {
      total: data.summary?.total ?? 0,
      prayedToday: data.summary?.prayedToday ?? false,
      checkins: data.recentCheckins?.length ?? 0,
    };
  });
}

async function holdWorship(page, holdMs = 3500) {
  const hold = page.getByText('感受临在').locator('..');
  await hold.waitFor({ state: 'visible', timeout: 20000 });
  const box = await hold.boundingBox();
  if (!box) throw new Error('worship hold area not found');
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.waitForTimeout(holdMs);
  await page.mouse.up();
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ locale: 'zh-CN' });
  const page = await context.newPage();

  console.log('[tarot-temple] bootstrap guest session');
  await page.goto(`${BASE.tarot}/`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(1500);

  const meritBefore = await readMerit(page);
  console.log(`[tarot-temple] merit before worship: total=${meritBefore.total}`);

  console.log('[tarot-temple] open /temple');
  await page.goto(`${BASE.tarot}/temple`, { waitUntil: 'domcontentloaded', timeout: 60000 });

  await page.getByRole('heading', { name: /选择信仰|选择朝拜圣地/ }).waitFor({ state: 'visible', timeout: 30000 });

  if (await page.getByText('第一步 · 选择信仰').isVisible().catch(() => false)) {
    console.log('[tarot-temple] select faith: 佛教');
    await page.getByRole('button', { name: '佛教' }).click();
    await page.getByRole('button', { name: '下一步 · 选择圣地' }).click();
  }

  await page.getByRole('heading', { name: '选择朝拜圣地' }).waitFor({ state: 'visible', timeout: 30000 });
  await page.getByText(/正在从 CMS 加载圣地/).waitFor({ state: 'hidden', timeout: 30000 }).catch(() => null);

  const deityButton = page.locator('button').filter({ has: page.locator('img[alt]') }).first();
  await deityButton.waitFor({ state: 'visible', timeout: 30000 });
  const deityName = await deityButton.locator('div').filter({ hasText: /.+/ }).first().textContent();
  console.log(`[tarot-temple] select deity: ${deityName?.trim() ?? 'first sanctuary'}`);
  await deityButton.click();

  console.log('[tarot-temple] hold worship ≥3s');
  await holdWorship(page, 3500);

  await page.getByText(/参拜完成|深度参拜|虔诚之巅|今日功德已记录|\+[\d]+ 功德/).first().waitFor({
    state: 'visible',
    timeout: 30000,
  });
  const blessingText = await page.locator('body').innerText();
  const meritMatch = blessingText.match(/\+(\d+)\s*功德/);
  console.log(`[tarot-temple] blessing screen OK${meritMatch ? ` (+${meritMatch[1]} merit)` : ''}`);

  const meritAfter = await readMerit(page);
  if (meritAfter.total < meritBefore.total && !blessingText.includes('今日功德已记录')) {
    throw new Error(
      `merit did not increase: before=${meritBefore.total} after=${meritAfter.total}`,
    );
  }
  if (!meritAfter.prayedToday) {
    throw new Error('expected prayedToday=true after worship');
  }
  console.log(`[tarot-temple] merit after: total=${meritAfter.total} prayedToday=${meritAfter.prayedToday}`);

  await browser.close();
  console.log('[tarot-temple] TC-TAROT-002 passed');
}

main().catch((err) => {
  console.error('[tarot-temple] FAIL', err);
  process.exit(1);
});

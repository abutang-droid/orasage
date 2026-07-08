/**
 * E2E: TC-TAROT-002 — temple worship + merit accumulation (guest)
 *
 * Usage: node tarot-temple-merit.mjs
 */

import { chromium } from 'playwright';
import { holdWorship, seedTempleJourney } from './lib/tarot-helpers.mjs';

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

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ locale: 'zh-CN' });
  const page = await context.newPage();

  console.log('[tarot-temple] bootstrap guest session');
  await page.goto(`${BASE.tarot}/`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(1500);

  const meritBefore = await readMerit(page);
  console.log(`[tarot-temple] merit before worship: total=${meritBefore.total}`);

  console.log('[tarot-temple] seed geo/faith/deity and open /temple');
  await seedTempleJourney(page);
  await page.goto(`${BASE.tarot}/temple`, { waitUntil: 'domcontentloaded', timeout: 60000 });

  await page.getByRole('button', { name: /今日参拜|再次参拜/ }).waitFor({
    state: 'visible',
    timeout: 45000,
  });
  console.log('[tarot-temple] temple home ready');
  await page.getByRole('button', { name: /今日参拜|再次参拜/ }).click();

  console.log('[tarot-temple] hold worship ≥3s');
  await holdWorship(page, 3500);

  await page.getByText(/参拜礼成|深度参拜|诚心礼成|今日功德已记录|\+[\d]+ 功德/).first().waitFor({
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

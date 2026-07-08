/**
 * E2E: TC-TAROT-001 — guest auto-create + daily card draw
 *
 * Usage: node tarot-daily-card-guest.mjs
 */

import { chromium } from 'playwright';

const BASE = {
  tarot: process.env.E2E_TAROT_URL ?? 'https://tarot.orasage.com',
};

async function readDailyCard(page) {
  return page.evaluate(async () => {
    const res = await fetch('/api/daily-card', { credentials: 'include' });
    return { status: res.status, data: await res.json() };
  });
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ locale: 'zh-CN' });
  const page = await context.newPage();

  console.log('[tarot-daily] visit tarot home (auto guest via /api/auth/me)');
  await page.goto(`${BASE.tarot}/`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(1500);

  const guest = await page.evaluate(async () => {
    const res = await fetch('/api/auth/me', { credentials: 'include' });
    return res.json();
  });
  const userId = guest?.user?.id;
  if (!userId || userId === 'guest') {
    throw new Error(`expected auto guest user, got: ${JSON.stringify(guest)}`);
  }
  console.log(`[tarot-daily] guest user id=${userId}`);

  const cookies = await context.cookies('https://tarot.orasage.com');
  const tarotToken = cookies.find((c) => c.name === 'tarot_token');
  if (!tarotToken?.value) {
    throw new Error('tarot_token cookie not set after guest bootstrap');
  }
  console.log('[tarot-daily] tarot_token cookie OK');

  console.log('[tarot-daily] open daily-card page');
  await page.goto(`${BASE.tarot}/daily-card`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.getByRole('heading', { name: '每日抽卡' }).waitFor({ state: 'visible', timeout: 30000 });
  await page.locator('.spinner').waitFor({ state: 'hidden', timeout: 60000 }).catch(() => null);

  const firstDraw = await readDailyCard(page);
  if (firstDraw.status !== 200 || !firstDraw.data?.cardName) {
    throw new Error(`daily-card API failed: ${JSON.stringify(firstDraw)}`);
  }
  console.log(`[tarot-daily] draw card=${firstDraw.data.cardName} alreadyDrew=${firstDraw.data.alreadyDrew}`);

  await page.waitForTimeout(800);
  const secondDraw = await readDailyCard(page);
  if (secondDraw.status !== 200 || !secondDraw.data?.cardName) {
    throw new Error(`daily-card API retry failed: ${JSON.stringify(secondDraw)}`);
  }
  if (!secondDraw.data.alreadyDrew) {
    throw new Error(`expected alreadyDrew=true on second fetch, got ${JSON.stringify(secondDraw.data)}`);
  }
  if (secondDraw.data.cardName !== firstDraw.data.cardName) {
    throw new Error(
      `card changed between draws: ${firstDraw.data.cardName} → ${secondDraw.data.cardName}`,
    );
  }

  console.log(`[tarot-daily] persisted card=${secondDraw.data.cardName}`);

  await browser.close();
  console.log('[tarot-daily] TC-TAROT-001 passed');
}

main().catch((err) => {
  console.error('[tarot-daily] FAIL', err);
  process.exit(1);
});

/**
 * E2E: TC-TAROT-001 — guest auto-create + daily card draw
 *
 * Usage: node tarot-daily-card-guest.mjs
 */

import { chromium } from 'playwright';
import { flipDailyCard } from './lib/tarot-helpers.mjs';

const BASE = {
  tarot: process.env.E2E_TAROT_URL ?? 'https://tarot.orasage.com',
};

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

  await page.getByText(/轻触卡牌|点击卡牌翻转|这是你今天抽到的牌/).waitFor({
    state: 'visible',
    timeout: 60000,
  });

  const alreadyDrew = await page.getByText('这是你今天抽到的牌').isVisible().catch(() => false);
  if (!alreadyDrew) {
    console.log('[tarot-daily] flip card');
    await flipDailyCard(page);
  } else {
    console.log('[tarot-daily] already drew today — verifying persisted card');
  }

  await page.getByText(/每日仅限抽取一次/).waitFor({ state: 'visible', timeout: 15000 });

  const cardApi = await page.evaluate(async () => {
    const res = await fetch('/api/daily-card', { credentials: 'include' });
    return { status: res.status, data: await res.json() };
  });
  if (cardApi.status !== 200 || !cardApi.data?.cardName) {
    throw new Error(`daily-card API failed: ${JSON.stringify(cardApi)}`);
  }
  console.log(`[tarot-daily] card=${cardApi.data.cardName} alreadyDrew=${cardApi.data.alreadyDrew}`);

  await browser.close();
  console.log('[tarot-daily] TC-TAROT-001 passed');
}

main().catch((err) => {
  console.error('[tarot-daily] FAIL', err);
  process.exit(1);
});

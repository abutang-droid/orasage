/** Shared tarot E2E helpers (temple journey seed, daily card flip, worship hold) */

export const TEMPLE_SEED = {
  faith: { id: 'buddhism' },
  geo: { continentCode: 'asia', countryCode: 'CN' },
  deity: { id: 'guanyin', name: '观音' },
};

export async function seedTempleJourney(page) {
  await page.evaluate((seed) => {
    localStorage.setItem('manto:faith', JSON.stringify(seed.faith));
    localStorage.setItem('manto:geo', JSON.stringify(seed.geo));
    localStorage.setItem('manto:deity', JSON.stringify(seed.deity));
  }, TEMPLE_SEED);
}

export async function flipDailyCard(page) {
  await page.addStyleTag({
    content: '.animate-scale-in, .animate-scale-in * { animation: none !important; }',
  });
  const card = page.locator('.animate-scale-in');
  await card.click({ force: true, timeout: 15000 });
  await page.waitForTimeout(600);
}

export async function holdWorship(page, holdMs = 3500) {
  const hold = page.locator('.temple-worship-stage').first();
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

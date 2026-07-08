/** Shared tarot E2E helpers (temple journey seed, worship hold) */

export const TEMPLE_SEED = {
  faith: { id: 'buddhism' },
  geo: { continentCode: 'asia', countryCode: 'CN' },
  deity: { id: 'guanyin', name: '观音' },
};

export async function bootstrapTempleGuest(page, seed = TEMPLE_SEED) {
  await page.evaluate(async (stored) => {
    localStorage.setItem('manto:faith', JSON.stringify(stored.faith));
    localStorage.setItem('manto:geo', JSON.stringify(stored.geo));
    localStorage.setItem('manto:deity', JSON.stringify(stored.deity));
    const res = await fetch('/api/profile/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        faith: stored.faith.id,
        preferredDeity: stored.deity.id,
        continentCode: stored.geo.continentCode,
        countryCode: stored.geo.countryCode,
        onboardingCompleted: true,
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.saved) {
      throw new Error(`profile save failed: ${res.status} ${JSON.stringify(data)}`);
    }
  }, seed);
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

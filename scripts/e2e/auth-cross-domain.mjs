/**
 * E2E: TC-AUTH-001 — register via bazi login, SSO on ziwei
 *
 * Usage: node auth-cross-domain.mjs
 */

import { chromium } from 'playwright';

const BASE = {
  auth: process.env.E2E_AUTH_URL ?? 'https://auth.orasage.com',
  bazi: process.env.E2E_BAZI_URL ?? 'https://bazi.orasage.com',
  ziwei: process.env.E2E_ZIWEI_URL ?? 'https://ziwei.orasage.com',
};

const PASSWORD = process.env.E2E_PASSWORD ?? 'E2eTest2026!';

async function main() {
  const email = `e2e-sso-${Date.now()}@orasage.test`;
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ locale: 'zh-CN' });
  const page = await context.newPage();

  console.log('[auth-sso] open bazi (no cookie)');
  await page.goto(`${BASE.bazi}?lang=zh-CN`, { waitUntil: 'domcontentloaded', timeout: 60000 });

  console.log('[auth-sso] click login chip → auth');
  await page.getByRole('link', { name: '登录' }).click();
  await page.waitForURL(/auth\.orasage\.com\/login/, { timeout: 30000 });

  await page.getByRole('link', { name: '立即注册' }).click();
  await page.waitForURL(/auth\.orasage\.com\/register/, { timeout: 30000 });

  await page.locator('#reg-email').fill(email);
  await page.locator('#reg-password').fill(PASSWORD);
  await page.locator('#register-form button[type="submit"]').click();

  await page.waitForURL(/bazi\.orasage\.com/, { timeout: 60000 });
  console.log('[auth-sso] returned to bazi after register');

  const chip = page.locator('.orasage-auth-chip--signed-in');
  await chip.waitFor({ state: 'visible', timeout: 15000 });
  const chipText = await chip.textContent();
  if (!chipText || chipText.includes('登录')) {
    throw new Error(`expected signed-in chip on bazi, got: ${chipText}`);
  }
  console.log(`[auth-sso] bazi chip: ${chipText.trim()}`);

  const cookies = await context.cookies('https://orasage.com');
  const token = cookies.find((c) => c.name === 'orasage_token');
  if (!token) throw new Error('orasage_token cookie missing');
  if (token.domain !== '.orasage.com') {
    throw new Error(`unexpected cookie domain: ${token.domain}`);
  }
  console.log('[auth-sso] orasage_token domain=.orasage.com OK');

  const ziweiPage = await context.newPage();
  await ziweiPage.goto(`${BASE.ziwei}/chart?lang=zh-CN`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  const me = await ziweiPage.evaluate(async () => {
    const res = await fetch('/api/auth/me', { credentials: 'include' });
    return res.json();
  });
  if (!me?.user?.id) {
    throw new Error(`ziwei /api/auth/me missing user: ${JSON.stringify(me)}`);
  }
  console.log(`[auth-sso] ziwei recognizes orasage user id=${me.user.id}`);

  await browser.close();
  console.log('[auth-sso] TC-AUTH-001 passed');
}

main().catch((err) => {
  console.error('[auth-sso] FAIL', err);
  process.exit(1);
});

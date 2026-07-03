/**
 * E2E: TC-AUTH-003 — login redirect whitelist (evil.com / javascript:)
 *
 * Usage: node auth-redirect-security.mjs
 */

import { chromium } from 'playwright';

const BASE = {
  auth: process.env.E2E_AUTH_URL ?? 'https://auth.orasage.com',
};

const PASSWORD = process.env.E2E_PASSWORD ?? 'E2eTest2026!';
const SAFE_REDIRECT = 'https://orasage.com/zh-CN/profile';

async function assertLoginRedirectSanitized(page, evilRedirect) {
  const url = `${BASE.auth}/login?redirect=${encodeURIComponent(evilRedirect)}`;
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  const form = page.locator('#login-form');
  await form.waitFor({ state: 'visible', timeout: 15000 });
  const dataRedirect = await form.getAttribute('data-redirect');
  if (!dataRedirect || !dataRedirect.includes('orasage.com')) {
    throw new Error(`expected safe redirect for ${evilRedirect}, got: ${dataRedirect}`);
  }
  if (dataRedirect.includes('evil.com') || dataRedirect.startsWith('javascript:')) {
    throw new Error(`unsafe redirect leaked: ${dataRedirect}`);
  }
}

async function loginAndAssertLanding(page, evilRedirect) {
  const email = `e2e-redirect-${Date.now()}@orasage.test`;
  await page.goto(`${BASE.auth}/register?redirect=${encodeURIComponent(evilRedirect)}`, {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });
  const form = page.locator('#register-form');
  await form.waitFor({ state: 'visible', timeout: 15000 });
  const dataRedirect = await form.getAttribute('data-redirect');
  if (!dataRedirect?.includes('orasage.com') || dataRedirect.includes('evil.com')) {
    throw new Error(`register form has unsafe data-redirect: ${dataRedirect}`);
  }
  await page.locator('#reg-email').fill(email);
  await page.locator('#reg-password').fill(PASSWORD);
  await page.locator('#register-form button[type="submit"]').click();
  await page.waitForURL((url) => {
    try {
      const host = new URL(url).hostname;
      return host.endsWith('orasage.com') && host !== 'auth.orasage.com';
    } catch {
      return false;
    }
  }, { timeout: 60000 });
  const finalHost = new URL(page.url()).hostname;
  if (finalHost === 'evil.com' || !finalHost.endsWith('orasage.com')) {
    throw new Error(`unsafe landing host: ${finalHost} (${page.url()})`);
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('[auth-redirect] evil.com redirect sanitized in form');
  await assertLoginRedirectSanitized(page, 'https://evil.com/phish');

  console.log('[auth-redirect] javascript: redirect sanitized in form');
  await assertLoginRedirectSanitized(page, 'javascript:alert(1)');

  console.log('[auth-redirect] register with evil redirect lands on orasage');
  await loginAndAssertLanding(page, 'https://evil.com/steal');

  console.log('[auth-redirect] register with javascript redirect lands on profile');
  await loginAndAssertLanding(page, 'javascript:alert(1)');

  console.log(`[auth-redirect] OK — safe default is ${SAFE_REDIRECT}`);
  await browser.close();
}

main().catch((err) => {
  console.error('[auth-redirect] FAIL', err);
  process.exit(1);
});

/**
 * E2E: TC-AUTH-002 — auth /center redirects logged-in users to main profile
 *
 * Usage: node auth-center-redirect.mjs
 */

import { chromium } from 'playwright';

const BASE = {
  auth: process.env.E2E_AUTH_URL ?? 'https://auth.orasage.com',
  main: process.env.E2E_MAIN_URL ?? 'https://orasage.com',
};

const PASSWORD = process.env.E2E_PASSWORD ?? 'E2eTest2026!';
const PROFILE_URL = `${BASE.main}/zh-CN/profile`;

async function registerUser() {
  const email = `e2e-center-${Date.now()}@orasage.test`;
  const res = await fetch(`${BASE.auth}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: PASSWORD, nickname: 'E2E Center' }),
  });
  if (!res.ok) throw new Error(`register failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return { email, token: data.token, displayName: data.user.displayName ?? 'E2E Center' };
}

function cookieHeader(token) {
  return `orasage_token=${token}`;
}

async function assertCenterRedirectApi(token) {
  const res = await fetch(`${BASE.auth}/center`, {
    redirect: 'manual',
    headers: { cookie: cookieHeader(token) },
  });
  const location = res.headers.get('location') ?? '';
  if (res.status !== 302 && res.status !== 307) {
    throw new Error(`expected 302/307 from /center, got ${res.status} location=${location}`);
  }
  if (!location.includes('orasage.com/zh-CN/profile')) {
    throw new Error(`unexpected /center redirect: ${location}`);
  }
  console.log(`[auth-center] API /center → ${res.status} ${location}`);
}

async function assertGuestCenterRedirect() {
  const res = await fetch(`${BASE.auth}/center`, { redirect: 'manual' });
  const location = res.headers.get('location') ?? '';
  if (res.status !== 302 && res.status !== 307) {
    throw new Error(`guest /center expected redirect, got ${res.status}`);
  }
  if (!location.includes('/login') || !location.includes('profile')) {
    throw new Error(`guest /center should redirect to login with profile target: ${location}`);
  }
  console.log(`[auth-center] guest /center → login OK (${location.slice(0, 80)}…)`);
}

async function main() {
  const user = await registerUser();
  await assertGuestCenterRedirect();
  await assertCenterRedirectApi(user.token);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ locale: 'zh-CN' });
  await context.addCookies([
    {
      name: 'orasage_token',
      value: user.token,
      domain: '.orasage.com',
      path: '/',
      secure: true,
      sameSite: 'Lax',
    },
  ]);
  const page = await context.newPage();

  console.log('[auth-center] browser GET /center');
  await page.goto(`${BASE.auth}/center`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForURL(/orasage\.com\/zh-CN\/profile\/?$/, { timeout: 60000 });

  await page.getByText(user.email, { exact: false }).waitFor({ state: 'visible', timeout: 20000 });
  console.log(`[auth-center] profile shows email ${user.email}`);

  await page.getByRole('link', { name: '占卜记录' }).waitFor({ state: 'visible', timeout: 10000 });
  await page.getByRole('link', { name: '订单' }).waitFor({ state: 'visible', timeout: 10000 });
  console.log('[auth-center] profile hub links (readings/orders) visible');

  if (page.url() !== PROFILE_URL && !page.url().startsWith(`${PROFILE_URL}?`)) {
    console.log(`[auth-center] note: landed on ${page.url()} (expected ${PROFILE_URL})`);
  }

  await browser.close();
  console.log('[auth-center] TC-AUTH-002 passed');
}

main().catch((err) => {
  console.error('[auth-center] FAIL', err);
  process.exit(1);
});

/**
 * E2E: TC-ADMIN-001 / TC-ADMIN-002 — admin role gate (API + browser)
 *
 * - API: unauthenticated → 401; regular user → 403 on /api/admin/*
 * - Browser: regular user sees gate card, not dashboard; /products → auth login
 * - Optional happy path when E2E_ADMIN_EMAIL + E2E_ADMIN_PASSWORD are set
 *
 * Usage: node admin-gate.mjs
 */

import { chromium } from 'playwright';

const BASE = {
  auth: process.env.E2E_AUTH_URL ?? 'https://auth.orasage.com',
  admin: process.env.E2E_ADMIN_URL ?? 'https://admin.orasage.com',
};

const PASSWORD = process.env.E2E_PASSWORD ?? 'E2eTest2026!';
const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD;

function cookieHeader(token) {
  return `orasage_token=${token}`;
}

async function registerUser() {
  const email = `e2e-admin-gate-${Date.now()}@orasage.test`;
  const res = await fetch(`${BASE.auth}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: PASSWORD, nickname: 'E2E Admin Gate' }),
  });
  if (!res.ok) throw new Error(`register failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return { email, token: data.token };
}

async function assertApiUnauthenticated() {
  const res = await fetch(`${BASE.auth}/api/admin/stats`);
  const body = await res.json();
  if (res.status !== 401) {
    throw new Error(`expected 401 without auth, got ${res.status}: ${JSON.stringify(body)}`);
  }
  if (body.error !== '未登录') {
    throw new Error(`expected 未登录, got ${JSON.stringify(body)}`);
  }
  console.log('[admin-gate] API /api/admin/stats without auth → 401 OK');
}

async function assertApiRegularUserForbidden(token) {
  const res = await fetch(`${BASE.auth}/api/admin/stats`, {
    headers: { cookie: cookieHeader(token) },
  });
  const body = await res.json();
  if (res.status !== 403) {
    throw new Error(`expected 403 for regular user, got ${res.status}: ${JSON.stringify(body)}`);
  }
  const forbiddenErrors = new Set(['需要管理员权限', '权限不足']);
  if (!forbiddenErrors.has(body.error)) {
    throw new Error(`expected admin forbidden error, got ${JSON.stringify(body)}`);
  }
  console.log('[admin-gate] API /api/admin/stats regular user → 403 OK');
}

async function assertBrowserRegularUserGate(token) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ locale: 'zh-CN' });
  await context.addCookies([
    {
      name: 'orasage_token',
      value: token,
      domain: '.orasage.com',
      path: '/',
      secure: true,
      sameSite: 'Lax',
    },
  ]);
  const page = await context.newPage();

  console.log('[admin-gate] browser GET admin home (regular user)');
  await page.goto(`${BASE.admin}/`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.getByRole('heading', { name: 'OraSage 管理后台' }).waitFor({ state: 'visible', timeout: 20000 });
  await page.getByText('使用 orasage 管理员账号登录').waitFor({ state: 'visible', timeout: 20000 });
  const overview = page.getByRole('heading', { name: '后台首页' });
  if (await overview.count()) {
    throw new Error('regular user must not see 运营概览 dashboard');
  }
  console.log('[admin-gate] admin home shows gate card for regular user');

  console.log('[admin-gate] browser GET /products → auth login redirect');
  await page.goto(`${BASE.admin}/products`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForURL(/auth\.orasage\.com\/login/, { timeout: 60000 });
  const url = page.url();
  if (!url.includes('redirect=') || !decodeURIComponent(url).includes('admin.orasage.com')) {
    throw new Error(`login redirect should target admin: ${url}`);
  }
  console.log('[admin-gate] /products redirects to auth login with admin redirect');

  await browser.close();
}

async function assertAdminHappyPath() {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.log('[admin-gate] skip admin happy path — set E2E_ADMIN_EMAIL + E2E_ADMIN_PASSWORD');
    return;
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ locale: 'zh-CN' });
  const page = await context.newPage();

  console.log('[admin-gate] browser admin login happy path');
  await page.goto(`${BASE.auth}/login?redirect=${encodeURIComponent(BASE.admin)}`, {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });
  await page.getByLabel(/邮箱|Email/i).fill(ADMIN_EMAIL);
  await page.getByLabel(/密码|Password/i).fill(ADMIN_PASSWORD);
  await page.getByRole('button', { name: /登录|Sign in/i }).click();
  await page.waitForURL(/admin\.orasage\.com/, { timeout: 60000 });

  await page.getByRole('heading', { name: '运营概览' }).waitFor({ state: 'visible', timeout: 20000 });
  await page.getByRole('link', { name: '商品' }).waitFor({ state: 'visible', timeout: 10000 });

  await page.goto(`${BASE.admin}/products`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.getByRole('heading', { name: '商品管理' }).waitFor({ state: 'visible', timeout: 20000 });
  console.log('[admin-gate] admin user sees dashboard and /products');

  const res = await page.request.get(`${BASE.auth}/api/admin/stats`);
  if (res.status() !== 200) {
    throw new Error(`admin API stats expected 200, got ${res.status()}`);
  }
  const stats = await res.json();
  if (typeof stats.users !== 'number') {
    throw new Error(`unexpected stats payload: ${JSON.stringify(stats)}`);
  }
  console.log(`[admin-gate] admin API stats → 200 (users=${stats.users})`);

  await browser.close();
}

async function main() {
  await assertApiUnauthenticated();

  const user = await registerUser();
  await assertApiRegularUserForbidden(user.token);
  await assertBrowserRegularUserGate(user.token);
  await assertAdminHappyPath();

  console.log('[admin-gate] TC-ADMIN-001/002 passed');
}

main().catch((err) => {
  console.error('[admin-gate] FAIL', err);
  process.exit(1);
});

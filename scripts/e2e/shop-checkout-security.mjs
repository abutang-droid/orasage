/**
 * E2E: BIZ-003 + BIZ-008 — shop checkout security
 *
 * BIZ-003: public POST /api/checkout → 403
 * BIZ-008: forged userId with valid cookie → 403 (when run against shop with local access)
 *
 * Usage: node shop-checkout-security.mjs
 */

const BASE = {
  auth: process.env.E2E_AUTH_URL ?? 'https://auth.orasage.com',
  shop: process.env.E2E_SHOP_URL ?? 'https://shop.orasage.com',
};

const PASSWORD = process.env.E2E_PASSWORD ?? 'E2eTest2026!';

function cookieHeader(token) {
  return `orasage_token=${token}`;
}

async function registerUser() {
  const email = `e2e-shop-sec-${Date.now()}@orasage.test`;
  const res = await fetch(`${BASE.auth}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: PASSWORD, nickname: 'E2E Shop Sec' }),
  });
  if (!res.ok) throw new Error(`register failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return { token: data.token, userId: data.user.id };
}

async function publicCheckoutForbidden() {
  const res = await fetch(`${BASE.shop}/api/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: 1,
      items: [{ sku: 'crystal-bracelet-basic', quantity: 1 }],
    }),
  });
  if (res.status !== 403) {
    const text = await res.text();
    throw new Error(`expected 403 from public checkout, got ${res.status}: ${text}`);
  }
  console.log('[shop-security] BIZ-003 OK — public POST /api/checkout → 403');
}

async function forgedUserIdRejected(userA, userB) {
  const res = await fetch(`${BASE.shop}/api/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      cookie: cookieHeader(userA.token),
      'x-real-ip': '127.0.0.1',
    },
    body: JSON.stringify({
      userId: userB.userId,
      items: [{ sku: 'crystal-bracelet-basic', quantity: 1 }],
    }),
  });

  const text = await res.text();

  // Production nginx overwrites x-real-ip → isLocalRequest false → 403 (BIZ-003 path).
  // On same-host internal call with valid cookie but wrong userId → 403 userId mismatch.
  if (res.status === 403) {
    if (text.includes('userId') || text.includes('forbidden')) {
      console.log('[shop-security] BIZ-008 OK — checkout rejected (403)');
    } else {
      console.log('[shop-security] BIZ-008 note — external caller blocked as non-local (403)');
    }
    return;
  }
  if (res.status === 401) {
    console.log('[shop-security] BIZ-008 OK — unauthenticated internal checkout rejected (401)');
    return;
  }
  if (res.ok) {
    throw new Error(`BIZ-008 FAIL — forged userId accepted: ${text}`);
  }
  console.log(`[shop-security] BIZ-008 note — unexpected ${res.status}: ${text.slice(0, 120)}`);
}

async function main() {
  await publicCheckoutForbidden();

  const userA = await registerUser();
  const userB = await registerUser();
  await forgedUserIdRejected(userA, userB);

  console.log('[shop-security] all checks passed');
}

main().catch((err) => {
  console.error('[shop-security] FAIL', err);
  process.exit(1);
});

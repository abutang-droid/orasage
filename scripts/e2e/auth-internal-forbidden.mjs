/**
 * E2E: BIZ-004 — public POST auth /internal/* forbidden
 *
 * Usage: node auth-internal-forbidden.mjs
 */

const BASE = {
  auth: process.env.E2E_AUTH_URL ?? 'https://auth.orasage.com',
};

async function expectForbidden(path, body) {
  const res = await fetch(`${BASE.auth}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (res.status !== 403) {
    throw new Error(`expected 403 for ${path}, got ${res.status}: ${text}`);
  }
  console.log(`[auth-internal] ${path} → 403 OK`);
}

async function main() {
  await expectForbidden('/internal/orders', {
    userId: 1,
    orderNo: 'E2E-FAKE-001',
    title: 'test',
    sku: 'crystal-wood',
    amountCents: 100,
    status: 'pending',
  });

  await expectForbidden('/internal/readings', {
    userId: 1,
    appSource: 'bazi',
    readingId: 'e2e:fake',
    title: 'fake',
  });

  console.log('[auth-internal] BIZ-004 passed');
}

main().catch((err) => {
  console.error('[auth-internal] FAIL', err);
  process.exit(1);
});

/**
 * API E2E: shop mock pay (tarot order) → tarot MeritLog / referrer bonus
 *
 * Usage (local):
 *   AUTH_URL=http://127.0.0.1:3101 \
 *   SHOP_URL=http://127.0.0.1:3102 \
 *   TAROT_URL=http://127.0.0.1:3112 \
 *   JWT_SECRET=... \
 *   node tarot-offer-merit.mjs
 *
 * Usage (production smoke):
 *   node tarot-offer-merit.mjs
 */

const BASE = {
  auth: process.env.E2E_AUTH_URL ?? 'https://auth.orasage.com',
  shop: process.env.E2E_SHOP_URL ?? 'https://shop.orasage.com',
  tarot: process.env.E2E_TAROT_URL ?? 'https://tarot.orasage.com',
};

const PASSWORD = process.env.E2E_PASSWORD ?? 'E2eTest2026!';

function cookieHeader(token) {
  return `orasage_token=${token}`;
}

async function registerUser(label) {
  const email = `e2e-tarot-${label}-${Date.now()}@orasage.test`;
  const res = await fetch(`${BASE.auth}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: PASSWORD, nickname: `E2E ${label}` }),
  });
  if (!res.ok) throw new Error(`register ${label} failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return { email, token: data.token, userId: data.user.id };
}

async function tarotFetch(path, token, init = {}) {
  const res = await fetch(`${BASE.tarot}${path}`, {
    ...init,
    headers: {
      ...(init.headers ?? {}),
      cookie: cookieHeader(token),
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
    },
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }
  return { res, data };
}

async function ensureReferralCode(token) {
  const { res, data } = await tarotFetch('/api/merit/referral', token);
  if (!res.ok) throw new Error(`referral GET failed: ${res.status} ${JSON.stringify(data)}`);
  if (!data.referralCode) throw new Error('referral code missing — tarot user not created?');
  return data.referralCode;
}

async function bindReferral(refereeToken, code) {
  const { res, data } = await tarotFetch('/api/merit/referral', refereeToken, {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
  if (!res.ok) throw new Error(`referral bind failed: ${res.status} ${JSON.stringify(data)}`);
}

async function getMeritSummary(token) {
  const { res, data } = await tarotFetch('/api/merit', token);
  if (!res.ok) throw new Error(`merit GET failed: ${res.status}`);
  return data.summary;
}

async function checkoutTarot(token, sku) {
  const { res, data } = await tarotFetch('/api/checkout', token, {
    method: 'POST',
    body: JSON.stringify({ sku }),
  });
  if (!res.ok) throw new Error(`checkout failed: ${res.status} ${JSON.stringify(data)}`);
  if (!data.orderNo) throw new Error(`checkout missing orderNo: ${JSON.stringify(data)}`);
  return data.orderNo;
}

async function mockPay(token, orderNo) {
  const res = await fetch(`${BASE.shop}/api/pay?order=${encodeURIComponent(orderNo)}`, {
    method: 'POST',
    headers: { cookie: cookieHeader(token) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`mock pay failed: ${res.status} ${JSON.stringify(data)}`);
  return data;
}

async function sleep(ms) {
  await new Promise((r) => setTimeout(r, ms));
}

async function waitForMeritChange(token, predicate, { label, maxWaitMs = 15000 } = {}) {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    const summary = await getMeritSummary(token);
    if (summary && predicate(summary)) return summary;
    await sleep(1000);
  }
  throw new Error(`timeout waiting for merit change: ${label}`);
}

async function main() {
  console.log('=== Tarot offer merit E2E ===');
  console.log(`auth=${BASE.auth} shop=${BASE.shop} tarot=${BASE.tarot}\n`);

  const referrer = await registerUser('referrer');
  const referee = await registerUser('referee');
  console.log(`Referrer auth id=${referrer.userId}`);
  console.log(`Referee auth id=${referee.userId}`);

  const referralCode = await ensureReferralCode(referrer.token);
  console.log(`Referral code: ${referralCode}`);
  await bindReferral(referee.token, referralCode);
  console.log('Referral bound');

  const referrerBefore = await getMeritSummary(referrer.token);
  const refereeBefore = await getMeritSummary(referee.token);
  const shareBefore = referrerBefore?.meritShare ?? 0;
  const offerBefore = refereeBefore?.meritOffer ?? 0;
  console.log(`Before — referrer share=${shareBefore}, referee offer=${offerBefore}`);

  const orderNo = await checkoutTarot(referee.token, 'report-tarot');
  console.log(`Order created: ${orderNo}`);
  await mockPay(referee.token, orderNo);
  console.log('Mock pay completed');

  const refereeAfter = await waitForMeritChange(
    referee.token,
    (s) => (s.meritOffer ?? 0) > offerBefore,
    { label: 'referee offer merit' },
  );
  const offerDelta = (refereeAfter.meritOffer ?? 0) - offerBefore;
  console.log(`Referee offer merit +${offerDelta}`);

  const expectReferralBonus = process.env.E2E_EXPECT_REFERRAL_BONUS === '1';
  let shareDelta = 0;
  if (expectReferralBonus) {
    const referrerAfter = await waitForMeritChange(
      referrer.token,
      (s) => (s.meritShare ?? 0) >= shareBefore + 50,
      { label: 'referrer referral_first_paid_reading +50' },
    );
    shareDelta = (referrerAfter.meritShare ?? 0) - shareBefore;
    console.log(`Referrer share merit +${shareDelta}`);
  } else {
    const referrerAfter = await getMeritSummary(referrer.token);
    shareDelta = (referrerAfter?.meritShare ?? 0) - shareBefore;
    console.log(
      `Referrer share merit +${shareDelta} (referral bonus check skipped — set E2E_EXPECT_REFERRAL_BONUS=1 after deploy)`,
    );
  }

  const results = {
    orderNo,
    refereeOfferDelta: offerDelta,
    referrerShareDelta: shareDelta,
    pass: offerDelta >= 2 && (!expectReferralBonus || shareDelta >= 50),
  };

  console.log('\n=== RESULTS ===');
  console.log(JSON.stringify(results, null, 2));

  if (!results.pass) {
    throw new Error('E2E assertions failed');
  }
  console.log('\n✅ Tarot offer merit E2E passed');
}

main().catch((err) => {
  console.error('E2E failed:', err);
  process.exit(1);
});

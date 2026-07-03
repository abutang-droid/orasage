/**
 * API E2E: free reading credit grant + consume
 *
 * Usage: node tarot-free-readings.mjs
 */

const BASE = {
  auth: process.env.E2E_AUTH_URL ?? 'https://auth.orasage.com',
  tarot: process.env.E2E_TAROT_URL ?? 'https://tarot.orasage.com',
};

const PASSWORD = process.env.E2E_PASSWORD ?? 'E2eTest2026!';

function cookieHeader(token) {
  return `orasage_token=${token}`;
}

async function registerUser() {
  const email = `e2e-free-${Date.now()}@orasage.test`;
  const res = await fetch(`${BASE.auth}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: PASSWORD, nickname: 'E2E Free' }),
  });
  if (!res.ok) throw new Error(`register failed: ${res.status}`);
  const data = await res.json();
  return { token: data.token };
}

async function main() {
  console.log('=== Tarot free readings E2E ===\n');
  const user = await registerUser();

  const eligibility = await fetch(`${BASE.tarot}/api/reading`, {
    headers: { cookie: cookieHeader(user.token) },
  });
  const eligData = await eligibility.json();
  console.log('Eligibility:', eligData);
  if (eligData.freeReadingsRemaining !== 1) {
    throw new Error(`expected initial 1 free reading, got ${eligData.freeReadingsRemaining}`);
  }

  const first = await fetch(`${BASE.tarot}/api/reading`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie: cookieHeader(user.token) },
    body: JSON.stringify({ spreadType: 'three' }),
  });
  const firstData = await first.json();
  if (!first.ok) throw new Error(`first reading failed: ${first.status} ${JSON.stringify(firstData)}`);
  console.log('First reading:', { accessSource: firstData.accessSource, remaining: firstData.freeReadingsRemaining });

  const second = await fetch(`${BASE.tarot}/api/reading`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie: cookieHeader(user.token) },
    body: JSON.stringify({ spreadType: 'three' }),
  });
  if (second.status !== 402) {
    const body = await second.text();
    throw new Error(`expected 402 paywall, got ${second.status}: ${body}`);
  }
  console.log('Second reading: 402 paywall ✅');

  const board = await fetch(`${BASE.tarot}/api/merit/leaderboard?limit=5`);
  const boardData = await board.json();
  console.log('Leaderboard entries:', boardData.entries?.length ?? 0);

  console.log('\n✅ Free readings E2E passed');
}

main().catch((err) => {
  console.error('E2E failed:', err);
  process.exit(1);
});

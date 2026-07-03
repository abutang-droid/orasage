/**
 * Run full production smoke suite in recommended order.
 * Usage: npm run test:smoke-all
 */

import { spawn } from 'node:child_process';

const STEPS = [
  'npm run test:platform-report',
  'npm run test:shop-security',
  'npm run test:auth-internal',
  'npm run test:admin-gate',
  'npm run test:auth-redirect',
  'npm run test:auth-sso',
  'npm run test:auth-center',
  'npm run test:tarot-offer',
  'npm run test:tarot-free',
  'npm run test:tarot-daily',
  'npm run test:tarot-temple',
  'npm run test:shop-crystal',
  'npm run test:pay-double',
  'npm run test:pay-network',
  'npm run test:shop-flow',
  'npm run test:ziwei-flow',
];

function run(cmd) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, {
      shell: true,
      stdio: 'inherit',
      env: process.env,
    });
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`exit ${code}`));
    });
  });
}

async function main() {
  console.log('=== OraSage smoke-all ===\n');
  const started = Date.now();
  for (const step of STEPS) {
    console.log(`\n>>> ${step}`);
    await run(step);
  }
  console.log('\n>>> verify-unify');
  await run(
    'MAIN_URL=https://orasage.com SHOP_URL=https://shop.orasage.com ZIWEI_URL=https://ziwei.orasage.com AUTH_URL=https://auth.orasage.com node verify-unify.mjs',
  );
  const sec = Math.round((Date.now() - started) / 1000);
  console.log(`\n✅ smoke-all passed (${sec}s)`);
}

main().catch((err) => {
  console.error('\n❌ smoke-all failed:', err.message);
  process.exit(1);
});

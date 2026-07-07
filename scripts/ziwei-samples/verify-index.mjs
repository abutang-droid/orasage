#!/usr/bin/env node
/**
 * 校验紫微 51 万样本库完整性，并输出 birthInfo 索引统计。
 * 在 VPS 上执行（需已解压 samples-out）：
 *   node scripts/ziwei-samples/verify-index.mjs
 *   ZIWEI_SAMPLES_DIR=/opt/orasage/data/ziwei-samples/ziwei-samples-toolkit node scripts/ziwei-samples/verify-index.mjs
 */
import { createReadStream } from 'node:fs';
import { readdir, access } from 'node:fs/promises';
import { join } from 'node:path';
import { createGunzip } from 'node:zlib';
import { createInterface } from 'node:readline';

const ROOT =
  process.env.ZIWEI_SAMPLES_DIR ||
  '/opt/orasage/data/ziwei-samples/ziwei-samples-toolkit';
const SAMPLES_OUT = join(ROOT, 'samples-out');

async function countLinesInGz(filePath) {
  return new Promise((resolve, reject) => {
    let count = 0;
    const input = createReadStream(filePath);
    const gunzip = createGunzip();
    const rl = createInterface({ input: gunzip, crlfDelay: Infinity });
    input.on('error', reject);
    gunzip.on('error', reject);
    rl.on('line', (line) => {
      if (line.trim()) count++;
    });
    rl.on('close', () => resolve(count));
    rl.on('error', reject);
    input.pipe(gunzip);
  });
}

async function main() {
  try {
    await access(SAMPLES_OUT);
  } catch {
    console.error(`[verify] samples-out not found: ${SAMPLES_OUT}`);
    process.exit(1);
  }

  const years = (await readdir(SAMPLES_OUT))
    .filter((n) => n.startsWith('year-'))
    .sort();

  let files = 0;
  let records = 0;
  let bad = 0;

  for (const yearDir of years) {
    const dir = join(SAMPLES_OUT, yearDir);
    const monthFiles = (await readdir(dir)).filter((f) => f.endsWith('.jsonl.gz'));
    for (const mf of monthFiles) {
      files++;
      const n = await countLinesInGz(join(dir, mf));
      records += n;
      if (n !== 720) {
        bad++;
        console.warn(`[verify] ${yearDir}/${mf}: ${n} lines (expected 720)`);
      }
    }
  }

  console.log(`[verify] root: ${ROOT}`);
  console.log(`[verify] year dirs: ${years.length}`);
  console.log(`[verify] month archives: ${files}`);
  console.log(`[verify] total records: ${records}`);
  console.log(`[verify] bad archives: ${bad}`);
  console.log(`[verify] index key: year×month×day(1-30)×hour(0-11)×gender → line in YYYY-MM.jsonl.gz`);
  process.exit(bad > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('[verify] failed:', err);
  process.exit(1);
});

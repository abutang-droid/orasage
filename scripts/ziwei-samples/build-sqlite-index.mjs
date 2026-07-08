#!/usr/bin/env node
/**
 * 将 samples-out/*.jsonl.gz 构建为 SQLite 索引，加速冷启动查询。
 *
 * 用法（VPS，需已解压 samples-out）：
 *   node scripts/ziwei-samples/build-sqlite-index.mjs
 *   ZIWEI_SAMPLES_DIR=/opt/orasage/data/ziwei-samples/ziwei-samples-toolkit node scripts/ziwei-samples/build-sqlite-index.mjs
 *
 * 输出：$ZIWEI_SAMPLES_DIR/samples-index.sqlite
 * 运行时设置 ZIWEI_SAMPLES_INDEX 指向该文件（或默认自动探测同目录）。
 */
import { createReadStream } from 'node:fs';
import { readdir, access } from 'node:fs/promises';
import { join } from 'node:path';
import { createGunzip } from 'node:zlib';
import { createInterface } from 'node:readline';
import { DatabaseSync } from 'node:sqlite';

const ROOT =
  process.env.ZIWEI_SAMPLES_DIR ||
  '/opt/orasage/data/ziwei-samples/ziwei-samples-toolkit';
const SAMPLES_OUT = join(ROOT, 'samples-out');
const OUT_DB =
  process.env.ZIWEI_SAMPLES_INDEX || join(ROOT, 'samples-index.sqlite');

function lookupKeyString(key) {
  return `${key.year}-${key.month}-${key.day}-h${key.hour}-${key.gender}`;
}

function normalizeYear(year) {
  const offset = ((year - 1924) % 60 + 60) % 60;
  let y = 1924 + offset;
  if (y > 1983) y -= 60;
  return y;
}

function normalizeKey(birthInfo) {
  return {
    year: normalizeYear(birthInfo.year),
    month: birthInfo.month,
    day: Math.min(Math.max(birthInfo.day, 1), 30),
    hour: Math.min(Math.max(birthInfo.hour, 0), 11),
    gender: birthInfo.gender,
  };
}

async function* iterArchives() {
  const years = (await readdir(SAMPLES_OUT))
    .filter((n) => n.startsWith('year-'))
    .sort();
  for (const yearDir of years) {
    const dir = join(SAMPLES_OUT, yearDir);
    const files = (await readdir(dir)).filter((f) => f.endsWith('.jsonl.gz')).sort();
    for (const f of files) {
      yield join(dir, f);
    }
  }
}

async function readGzLines(filePath) {
  return new Promise((resolve, reject) => {
    const rows = [];
    const input = createReadStream(filePath);
    const gunzip = createGunzip();
    const rl = createInterface({ input: gunzip, crlfDelay: Infinity });
    input.on('error', reject);
    gunzip.on('error', reject);
    rl.on('line', (line) => {
      if (!line.trim()) return;
      try {
        rows.push(JSON.parse(line));
      } catch {
        // skip
      }
    });
    rl.on('close', () => resolve(rows));
    rl.on('error', reject);
    input.pipe(gunzip);
  });
}

async function main() {
  try {
    await access(SAMPLES_OUT);
  } catch {
    console.error(`[build-index] samples-out not found: ${SAMPLES_OUT}`);
    process.exit(1);
  }

  const db = new DatabaseSync(OUT_DB);
  db.exec('DROP TABLE IF EXISTS samples');
  db.exec(`
    CREATE TABLE samples (
      lookup_key TEXT PRIMARY KEY,
      topics_json TEXT NOT NULL
    );
  `);
  db.exec('PRAGMA journal_mode = OFF');
  db.exec('PRAGMA synchronous = OFF');

  const insert = db.prepare(
    'INSERT OR REPLACE INTO samples (lookup_key, topics_json) VALUES (?, ?)',
  );

  let files = 0;
  let records = 0;

  for await (const archive of iterArchives()) {
    files++;
    const rows = await readGzLines(archive);
    for (const row of rows) {
      const key = normalizeKey(row.birthInfo);
      insert.run(lookupKeyString(key), JSON.stringify(row.topics));
      records++;
    }
    if (files % 60 === 0) {
      console.log(`[build-index] ${files} archives, ${records} records…`);
    }
  }

  db.exec('CREATE INDEX IF NOT EXISTS idx_samples_key ON samples(lookup_key)');
  console.log(`[build-index] done: ${OUT_DB}`);
  console.log(`[build-index] archives: ${files}, records: ${records}`);
}

main().catch((err) => {
  console.error('[build-index] failed:', err);
  process.exit(1);
});

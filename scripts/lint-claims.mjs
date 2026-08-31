#!/usr/bin/env node
/**
 * R3 anti-regression: forbid efficacy / superstition claim wording in product copy.
 * Scans shop/main product sources and active drizzle migrations (0040+).
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const FORBIDDEN = [
  /\battracts?\s+wealth\b/gi,
  /\bgood\s+fortune\b/gi,
  /\bgathering\s+wealth\b/gi,
  /\bwards?\s+off\b/gi,
  /\bprotects?\s+against\b/gi,
  /\bbenefiting\s+your\s+career\b/gi,
  /\bresonates?\s+with\s+the\s+heart\s+chakra\b/gi,
  /\bprized\s+for\s+attracting\b/gi,
  /\bexpel\s+.{0,30}?\bvibes?\b/gi,
  /\bestablishes\s+boundaries\b/gi,
  /\bpurifies\s+energy\b/gi,
  /\bvoluntary\s+gift\b/gi,
  /\bevery\s+offering\s+links\b/gi,
  /\btemple\s+blessing\b/gi,
  /招财/g,
  /旺运/g,
  /辟邪/g,
  /护身/g,
  /聚财/g,
  /净化能量/g,
  /提振活力/g,
];

const EXT = new Set(['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.sql']);

/** Paths relative to repo root */
const SCAN_ROOTS = [
  'shop/src',
  'shop/messages',
  'main/src/lib/shop-products.ts',
  'main/messages/zh-CN.json',
  'shared/shop-crystal',
  'auth-service/drizzle/0041_r3_efficacy_sync.sql',
];

const SKIP_DIRS = new Set(['node_modules', '.next', '.git', 'dist']);

const repoRoot = new URL('..', import.meta.url).pathname.replace(/\/$/, '');

let hits = 0;

function walk(absPath) {
  if (!existsSync(absPath)) return;
  const st = statSync(absPath);
  if (st.isDirectory()) {
    for (const name of readdirSync(absPath)) {
      if (SKIP_DIRS.has(name)) continue;
      walk(join(absPath, name));
    }
    return;
  }
  const ext = absPath.slice(absPath.lastIndexOf('.'));
  if (!EXT.has(ext)) return;
  const rel = relative(repoRoot, absPath);
  // Skip historical drizzle migrations (0040+ are the active copy)
  if (/auth-service\/drizzle\/00[0-3]\d_/.test(rel)) return;
  const source = readFileSync(absPath, 'utf8');
  for (const re of FORBIDDEN) {
    re.lastIndex = 0;
    const m = source.match(re);
    if (m) {
      console.error(`[CLAIM] ${rel}: ${m[0]}`);
      hits += 1;
    }
  }
}

for (const root of SCAN_ROOTS) {
  walk(join(repoRoot, root));
}

if (hits) {
  console.error(`\n${hits} forbidden claim term(s).`);
  process.exit(1);
}
console.log('Claims lint passed.');

#!/usr/bin/env node
/**
 * P0 claims lint: forbid efficacy / superstition wording in product & shop copy.
 * Extended to BaZi / Zi Wei / Tarot per doc 20 §6.
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
  /\bcareer\s+expansion\b/gi,
  /\bresonates?\s+with\s+the\s+(heart|root|solar\s+plexus|crown)\s+chakra\b/gi,
  /\bprized\s+for\s+attracting\b/gi,
  /\bexpel\s+.{0,40}?\b(vibes?|energy)\b/gi,
  /\bestablishes\s+boundaries\b/gi,
  /\bpurifies?\s+energy\b/gi,
  /\babsorb(?:ing|s)?\s+energy\b/gi,
  /\bvoluntary\s+gift\b/gi,
  /\bevery\s+offering\s+links\b/gi,
  /\btemple\s+blessing\b/gi,
  /\bdivination\s+tools\b/gi,
  /\bdestiny\s+&\s+energy\b/gi,
  /\bintended\s+to\s+provide\b/gi,
  /\bcareer-related\b/gi,
  /\bvital\s+energy\b/gi,
  /\benergy\s+bracelet\b/gi,
  /\bgrowth\s+&\s+prosperity\b/gi,
  /\bcourageous\s+movement\b/gi,
  /\bsteady\s+grounding\b/gi,
  /\bpsychological\s+anchor\b/gi,
  /\bprotection\s+&\s+boundaries\b/gi,
  /\benergy\s+shop\b/gi,
  /\bresonates?\s+with\b/gi,
  /\bchakra\b/gi,
  /\bcleanse\s+(?:the\s+)?(?:energy|aura|crystal)/gi,
  /\bpurify\s+(?:the\s+)?(?:energy|aura|crystal)/gi,
  /\battracts?\s+abundance\b/gi,
  /\battracts?\s+prosperity\b/gi,
  /\bbrings?\s+fortune\b/gi,
  /\bbrings?\s+wealth\b/gi,
  /\bbrings?\s+luck\b/gi,
  /招财/g,
  /旺运/g,
  /辟邪/g,
  /护身/g,
  /聚财/g,
  /净化能量/g,
  /提振活力/g,
  /消磁/g,
  /左进右出/g,
  /开光/g,
  /加持/g,
  /定命(?:切片|论|书)/g,
  /因现果/g,
  /星途/g,
  /能量手串/g,
  /能量商城/g,
  /能量法器/g,
  /能量概率/g,
  /能量流动/g,
  /能量地图/g,
  /命理工具平台/g,
  /divination platform/gi,
  /解读很准/g,
  /按八字推荐/g,
  /解命运密码/g,
  /批命用/g,
  /磁场玄学/g,
];

/** Allowlisted substrings — if a hit is only inside these phrases, skip. */
const ALLOWLIST = [
  /in crystal tradition/gi,
  /symbol of/gi,
  /a prompt to/gi,
  /for entertainment purposes only/gi,
  /entertainment-only notice/gi,
  /cultural-entertainment/gi,
  /self-exploration/gi,
  /Self & Energy/gi,
  /Crystal Shop/gi,
  /crystal bracelet/gi,
  /Five Elements/gi,
  /for entertainment and cultural reference only/gi,
];

const EXT = new Set(['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.sql']);

const SCAN_ROOTS = [
  'shop/src',
  'shop/messages',
  'main/src',
  'main/messages/en.json',
  'main/messages/zh-CN.json',
  'shared/shop-crystal',
  'shared/shop-fulfillment',
  'shared/origins-making',
  'bazi/client/src',
  'ziwei/app',
  'ziwei/lib',
  'ziwei/components',
  'tarot/src',
  'auth-service/drizzle/0017_temple_donation.sql',
  'auth-service/drizzle/0046_disable_temple_donation.sql',
];

const SKIP_DIRS = new Set(['node_modules', '.next', '.git', 'dist', 'orasage-app-shell']);

const repoRoot = new URL('..', import.meta.url).pathname.replace(/\/$/, '');

let hits = 0;

function isAllowlisted(source, matchIndex, matchLen) {
  for (const re of ALLOWLIST) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(source))) {
      if (matchIndex >= m.index && matchIndex + matchLen <= m.index + m[0].length) return true;
    }
  }
  return false;
}

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
  if (/auth-service\/drizzle\/00[0-3]\d_/.test(rel)) return;
  if (/scripts\/cms\//.test(rel)) return;
  if (/ziwei\/lib\/classics\//.test(rel)) return;
  if (/ziwei\/lib\/classics\//.test(rel)) return;
  if (/privacy\/page\.tsx$/.test(rel)) return;
  // Vendored disclaimer copies may mention brand phrases; still scan product copy.
  const source = readFileSync(absPath, 'utf8');
  for (const re of FORBIDDEN) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(source))) {
      if (isAllowlisted(source, m.index, m[0].length)) continue;
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

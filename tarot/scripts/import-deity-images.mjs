#!/usr/bin/env node
/**
 * Import formal deity images from tarot/tarot_pic/god/incoming/
 * into tarot/public/gods/{code}.webp and update shared/tarot-faith-seed.ts.
 *
 * Usage: node tarot/scripts/import-deity-images.mjs [--dry-run]
 */
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '../..');
const INCOMING = join(__dirname, '../tarot_pic/god/incoming');
const OUT_DIR = join(__dirname, '../public/gods');
const SEED_FILE = join(ROOT, 'shared/tarot-faith-seed.ts');

const DRY_RUN = process.argv.includes('--dry-run');

/** @type {Record<string, string>} */
const ALIASES = {
  fatima: 'fatima',
  'fatima zahra': 'fatima',
  法蒂玛: 'fatima',
  shiva: 'shiva',
  湿婆: 'shiva',
  lakshmi: 'lakshmi',
  拉克什米: 'lakshmi',
  shakyamuni: 'shakyamuni',
  'shakyamuni buddha': 'shakyamuni',
  释迦牟尼: 'shakyamuni',
  释迦: 'shakyamuni',
  ksitigarbha: 'ksitigarbha',
  地藏菩萨: 'ksitigarbha',
  地藏: 'ksitigarbha',
  guan_yu: 'guan_yu',
  'guan yu': 'guan_yu',
  关公: 'guan_yu',
  关羽: 'guan_yu',
  jade_emperor: 'jade_emperor',
  'jade emperor': 'jade_emperor',
  玉皇大帝: 'jade_emperor',
  玉皇: 'jade_emperor',
  ogun: 'ogun',
  奥贡: 'ogun',
  guru_nanak: 'guru_nanak',
  'guru nanak': 'guru_nanak',
  '古鲁·那纳克': 'guru_nanak',
  古鲁那纳克: 'guru_nanak',
  allan_kardec: 'allan_kardec',
  'allan kardec': 'allan_kardec',
  '阿兰·卡里德': 'allan_kardec',
  阿兰卡里德: 'allan_kardec',
  elijah: 'elijah',
  以利亚: 'elijah',
  amaterasu: 'amaterasu',
  天照大神: 'amaterasu',
  天照: 'amaterasu',
  bahaullah: 'bahaullah',
  "baha'u'llah": 'bahaullah',
  巴哈欧拉: 'bahaullah',
  mahavira: 'mahavira',
  大雄: 'mahavira',
  ahura_mazda: 'ahura_mazda',
  'ahura mazda': 'ahura_mazda',
  '阿胡拉·马兹达': 'ahura_mazda',
  阿胡拉马兹达: 'ahura_mazda',
  confucius: 'confucius',
  孔子: 'confucius',
  dangun: 'dangun',
  檀君王: 'dangun',
  檀君: 'dangun',
  pachamama: 'pachamama',
  '帕查 mama': 'pachamama',
  帕查mama: 'pachamama',
  帕查: 'pachamama',
  iemanja: 'iemanja',
  yemanja: 'iemanja',
  yemanjá: 'iemanja',
  伊曼雅: 'iemanja',
  oyasama: 'oyasama',
  天理王母: 'oyasama',
  cao_dai_mother: 'cao_dai_mother',
  'cao dai mother': 'cao_dai_mother',
  'cao dai mother goddess': 'cao_dai_mother',
  母道: 'cao_dai_mother',
};

const PENDING_CODES = new Set(Object.values(ALIASES));

function normalizeKey(name) {
  return name
    .normalize('NFC')
    .replace(/\.[^.]+$/, '')
    .replace(/[_-]+/g, ' ')
    .trim()
    .toLowerCase();
}

function resolveCode(filename) {
  const base = filename.replace(/\.[^.]+$/, '');
  const key = normalizeKey(base);
  if (ALIASES[key]) return ALIASES[key];
  if (ALIASES[base]) return ALIASES[base];
  if (PENDING_CODES.has(key)) return key;
  if (PENDING_CODES.has(base)) return base;
  return null;
}

function main() {
  if (!existsSync(INCOMING)) {
    mkdirSync(INCOMING, { recursive: true });
    console.log(`已创建目录: ${INCOMING}`);
    console.log('请把正式图放入该目录后重新运行。');
    return;
  }

  const files = readdirSync(INCOMING).filter((f) => {
    const ext = extname(f).toLowerCase();
    return ['.webp', '.png', '.jpg', '.jpeg'].includes(ext);
  });

  if (files.length === 0) {
    console.log(`[import] ${INCOMING} 中暂无图片文件`);
    return;
  }

  mkdirSync(OUT_DIR, { recursive: true });
  const imported = new Set();
  const unmatched = [];

  for (const file of files) {
    const code = resolveCode(file);
    if (!code) {
      unmatched.push(file);
      continue;
    }
    const dest = join(OUT_DIR, `${code}.webp`);
    const src = join(INCOMING, file);
    const ext = extname(file).toLowerCase();

    if (DRY_RUN) {
      console.log(`[dry-run] ${file} → ${code}.webp`);
    } else {
      if (ext !== '.webp') {
        console.warn(`[warn] ${file} 非 webp，仍复制为 ${code}.webp（建议本地先转 webp）`);
      }
      copyFileSync(src, dest);
      const svgPath = join(OUT_DIR, `${code}.svg`);
      if (existsSync(svgPath)) {
        unlinkSync(svgPath);
        console.log(`[import] removed placeholder ${code}.svg`);
      }
    }
    console.log(`[import] ${file} → public/gods/${code}.webp`);
    imported.add(code);
  }

  if (imported.size > 0 && existsSync(SEED_FILE)) {
    let text = readFileSync(SEED_FILE, 'utf8');
    for (const code of imported) {
      const svg = `imageUrl: '/gods/${code}.svg'`;
      const webp = `imageUrl: '/gods/${code}.webp'`;
      if (text.includes(svg)) {
        text = text.replace(svg, webp);
      } else if (!text.includes(webp)) {
        console.warn(`[warn] seed 中未找到 ${code} 的 imageUrl`);
      }
    }
    if (!DRY_RUN) writeFileSync(SEED_FILE, text);
    console.log(`[import] updated ${SEED_FILE}`);
  }

  const missing = [...PENDING_CODES].filter((c) => !imported.has(c));
  if (missing.length) {
    console.log(`[import] 仍缺 ${missing.length} 位: ${missing.join(', ')}`);
  }
  if (unmatched.length) {
    console.log(`[import] 无法识别文件名: ${unmatched.join(', ')}`);
  }
  console.log(`[import] 完成: ${imported.size} 张${DRY_RUN ? ' (dry-run)' : ''}`);
}

main();

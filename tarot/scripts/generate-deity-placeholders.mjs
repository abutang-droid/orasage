#!/usr/bin/env node
/**
 * Generate simple placeholder SVG sketches for deities without real images.
 * Run: node tarot/scripts/generate-deity-placeholders.mjs
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '../public/gods');

/** @type {Array<{code:string,nameZh:string,color:string,colorLight?:string,icon:string}>} */
const DEITIES = [
  {
    code: 'fatima',
    nameZh: '法蒂玛',
    color: '#1B5E4A',
    colorLight: '#2D8A6E',
    icon: `
      <path d="M88 118c0-22 18-40 40-40s40 18 40 40" />
      <circle cx="168" cy="96" r="10" fill="#fff" stroke="none" opacity="0.9" />
      <path d="M128 158v36M108 182h40" opacity="0.6" />`,
  },
  {
    code: 'shiva',
    nameZh: '湿婆',
    color: '#4A5568',
    colorLight: '#718096',
    icon: `
      <path d="M128 72v112M108 96l40 24M148 96l-40 24" stroke-width="4" />
      <circle cx="128" cy="64" r="8" fill="#fff" stroke="none" />`,
  },
  {
    code: 'lakshmi',
    nameZh: '拉克什米',
    color: '#C9954A',
    colorLight: '#E8C878',
    icon: `
      <path d="M128 168c-28-16-44-36-44-56 0-22 20-36 44-36s44 14 44 36c0 20-16 40-44 56z" />
      <path d="M128 76v20M96 108c12-8 24-12 32-12s20 4 32 12" opacity="0.7" />`,
  },
  {
    code: 'shakyamuni',
    nameZh: '释迦牟尼',
    color: '#B8943F',
    colorLight: '#D4B86A',
    icon: `
      <circle cx="128" cy="128" r="44" />
      <circle cx="128" cy="128" r="10" fill="#fff" stroke="none" />
      <path d="M128 84v-12M128 172v12M84 128h-12M172 128h12M98 98l-8-8M158 158l8 8M158 98l8-8M98 158l-8 8" />`,
  },
  {
    code: 'ksitigarbha',
    nameZh: '地藏菩萨',
    color: '#6B5344',
    colorLight: '#8B7058',
    icon: `
      <path d="M128 72v96" stroke-width="4" />
      <ellipse cx="128" cy="72" rx="20" ry="8" />
      <path d="M104 100h48M104 124h48M104 148h48" opacity="0.75" />`,
  },
  {
    code: 'guan_yu',
    nameZh: '关公',
    color: '#8B2020',
    colorLight: '#B03030',
    icon: `
      <path d="M96 176l64-96M96 80l32 32M160 80l-32 32" stroke-width="4" />
      <path d="M88 184h80" stroke-width="5" />`,
  },
  {
    code: 'jade_emperor',
    nameZh: '玉皇大帝',
    color: '#D4AF37',
    colorLight: '#F0D878',
    icon: `
      <path d="M88 148c16-40 64-40 80 0" />
      <circle cx="128" cy="108" r="28" />
      <path d="M108 88c8-12 32-12 40 0" opacity="0.7" />`,
  },
  {
    code: 'ogun',
    nameZh: '奥贡',
    color: '#2D5016',
    colorLight: '#3D6B22',
    icon: `
      <path d="M108 80l40 96M148 80l-40 96" stroke-width="4" />
      <path d="M88 176h80" stroke-width="6" />
      <path d="M96 168h64" opacity="0.5" />`,
  },
  {
    code: 'guru_nanak',
    nameZh: '古鲁·那纳克',
    color: '#F59E0B',
    colorLight: '#FCD34D',
    icon: `
      <circle cx="128" cy="128" r="36" />
      <path d="M128 92v72M104 116h48M104 140h48" stroke-width="3" />
      <path d="M152 104l16-16M104 152l-16 16" opacity="0.7" />`,
  },
  {
    code: 'allan_kardec',
    nameZh: '阿兰·卡里德',
    color: '#6366F1',
    colorLight: '#818CF8',
    icon: `
      <path d="M88 120h80v64H88z" />
      <path d="M104 136h48M104 156h32" opacity="0.7" />
      <path d="M128 72c0 16-8 28-16 36M128 72c0 16 8 28 16 36" />`,
  },
  {
    code: 'elijah',
    nameZh: '以利亚',
    color: '#1E3A5F',
    colorLight: '#2E5A8C',
    icon: `
      <path d="M128 64c-20 32-20 64 0 96 20-32 20-64 0-96z" fill="#fff" stroke="none" opacity="0.35" />
      <path d="M128 64c-20 32-20 64 0 96 20-32 20-64 0-96z" />
      <path d="M108 176h40" stroke-width="4" />`,
  },
  {
    code: 'amaterasu',
    nameZh: '天照大神',
    color: '#DC2626',
    colorLight: '#F87171',
    icon: `
      <circle cx="128" cy="120" r="48" />
      <circle cx="128" cy="120" r="32" fill="none" opacity="0.6" />
      <path d="M128 56v16M128 168v16M72 120h16M168 120h16" />`,
  },
  {
    code: 'bahaullah',
    nameZh: '巴哈欧拉',
    color: '#7C3AED',
    colorLight: '#A78BFA',
    icon: `
      <path d="M128 72l14 40h44l-36 26 14 40-36-26-36 26 14-40-36-26h44z" />`,
  },
  {
    code: 'mahavira',
    nameZh: '大雄',
    color: '#8B8378',
    colorLight: '#E8E4D0',
    icon: `
      <path d="M128 80c-28 0-48 24-48 52 0 32 48 56 48 56s48-24 48-56c0-28-20-52-48-52z" />
      <path d="M108 132h40M118 148h20" opacity="0.7" />`,
  },
  {
    code: 'ahura_mazda',
    nameZh: '阿胡拉·马兹达',
    color: '#FBBF24',
    colorLight: '#FDE68A',
    icon: `
      <circle cx="128" cy="120" r="32" />
      <path d="M72 120h112M128 72v96M96 88l64 64M160 88l-64 64" opacity="0.75" />`,
  },
  {
    code: 'confucius',
    nameZh: '孔子',
    color: '#78350F',
    colorLight: '#A16207',
    icon: `
      <path d="M96 96h64v88H96z" />
      <path d="M108 112h40M108 132h32M108 152h40" opacity="0.7" />
      <path d="M120 184v16M136 184v16" />`,
  },
  {
    code: 'dangun',
    nameZh: '檀君王',
    color: '#059669',
    colorLight: '#34D399',
    icon: `
      <path d="M64 168 L128 88 L192 168 Z" />
      <path d="M96 168c16-24 48-24 64 0" opacity="0.6" />
      <circle cx="128" cy="108" r="10" fill="#fff" stroke="none" opacity="0.8" />`,
  },
  {
    code: 'pachamama',
    nameZh: '帕查 Mama',
    color: '#65A30D',
    colorLight: '#84CC16',
    icon: `
      <path d="M64 160c24-48 48-64 64-64s40 16 64 64" />
      <path d="M88 160c12-20 28-28 40-28s28 8 40 28" opacity="0.6" />
      <circle cx="128" cy="108" r="12" fill="#fff" stroke="none" opacity="0.7" />`,
  },
  {
    code: 'iemanja',
    nameZh: '伊曼雅',
    color: '#0EA5E9',
    colorLight: '#38BDF8',
    icon: `
      <path d="M56 148c24-16 48-16 72 0s48 16 72 0" />
      <path d="M72 148c16 24 32 36 56 36s40-12 56-36" opacity="0.6" />
      <path d="M168 88a20 20 0 1 1-40 0 20 20 0 0 1 40 0z" />`,
  },
  {
    code: 'oyasama',
    nameZh: '天理王母',
    color: '#EC4899',
    colorLight: '#F9A8D4',
    icon: `
      <circle cx="128" cy="120" r="40" fill="#fff" stroke="none" opacity="0.2" />
      <path d="M128 88c-16 0-28 12-28 28 0 20 28 44 28 44s28-24 28-44c0-16-12-28-28-28z" />`,
  },
  {
    code: 'cao_dai_mother',
    nameZh: '母道',
    color: '#A855F7',
    colorLight: '#D8B4FE',
    icon: `
      <path d="M128 80 L176 168 H80 Z" opacity="0.35" fill="#fff" stroke="none" />
      <path d="M128 80 L176 168 H80 Z" />
      <circle cx="128" cy="128" r="16" fill="#fff" stroke="none" opacity="0.85" />`,
  },
];

function svgFor({ nameZh, color, colorLight, icon }) {
  const light = colorLight ?? color;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256" role="img" aria-label="${nameZh} 简图">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${light}"/>
      <stop offset="100%" stop-color="${color}"/>
    </linearGradient>
    <radialGradient id="halo" cx="50%" cy="40%" r="55%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.28"/>
      <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="256" height="256" rx="20" fill="url(#bg)"/>
  <circle cx="128" cy="112" r="88" fill="url(#halo)"/>
  <g fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" opacity="0.88">
    ${icon.trim()}
  </g>
  <text x="128" y="230" text-anchor="middle" font-family="Georgia, 'Noto Serif SC', serif" font-size="11" fill="rgba(255,255,255,0.55)">简图 · 待替换</text>
</svg>
`;
}

mkdirSync(OUT_DIR, { recursive: true });

for (const deity of DEITIES) {
  const path = join(OUT_DIR, `${deity.code}.svg`);
  writeFileSync(path, svgFor(deity), 'utf8');
  console.log('wrote', path);
}

console.log(`done — ${DEITIES.length} placeholder sketches`);

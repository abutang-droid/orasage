/**
 * 农历数据生成脚本
 *
 * 用途：用 lunar-javascript 一次性生成 1900-2100 年的农历数据 JSON 文件，
 *       放到 client/public/data/ 下，供浏览器端 fetch 加载。
 *
 * 用法：
 *   cd /Users/mac/Downloads/bazi-calculator
 *   node scripts/generate-lunar-data.mjs
 *
 * 输出：
 *   client/public/data/data_1900s_8987235d.json
 *   client/public/data/data_1910s_6279925c.json
 *   …（共 20 个十年文件）
 *   client/public/data/city-data-global-v2_9233fab2.json
 */

import { Solar } from 'lunar-javascript';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const OUT_DIR = join(import.meta.dirname, '..', 'client', 'public', 'data');

// 按年代分文件
function getDecadeKey(year) {
  if (year === 2100) return '2090s';
  const decade = Math.floor(year / 10) * 10;
  return `${decade}s`;
}

// 与 lunarData.ts 中的文件名完全一致
const DECADE_FILES = {
  '1900s': 'data_1900s_8987235d.json',
  '1910s': 'data_1910s_6279925c.json',
  '1920s': 'data_1920s_3275a4d2.json',
  '1930s': 'data_1930s_edbde05f.json',
  '1940s': 'data_1940s_0db1a3c7.json',
  '1950s': 'data_1950s_c2caf578.json',
  '1960s': 'data_1960s_7b72e69a.json',
  '1970s': 'data_1970s_2b210969.json',
  '1980s': 'data_1980s_ef4d1b0c.json',
  '1990s': 'data_1990s_2fe25b6b.json',
  '2000s': 'data_2000s_2a388234.json',
  '2010s': 'data_2010s_212b42b9.json',
  '2020s': 'data_2020s_cf1b0d05.json',
  '2030s': 'data_2030s_d61c1c16.json',
  '2040s': 'data_2040s_d1ee3c91.json',
  '2050s': 'data_2050s_a279288d.json',
  '2060s': 'data_2060s_ce9ef85b.json',
  '2070s': 'data_2070s_0940ce79.json',
  '2080s': 'data_2080s_6fdb1fa1.json',
  '2090s': 'data_2090s_922406fa.json',
};

/**
 * 将 solar + lunar 转换为 LunarRecord
 */
function makeRecord(year, month, day) {
  const ds = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const solar = Solar.fromYmd(year, month, day);
  const lunar = solar.getLunar();

  const jie = lunar.getCurrentJie();
  const qi = lunar.getCurrentQi();
  const solarTerm = jie || qi || null;

  const dateObj = new Date(year, month - 1, day);
  const weekday = dateObj.getDay();

  const rawMonth = lunar.getMonth();
  const isLeap = rawMonth < 0;

  return {
    date: ds,
    lunar_year: lunar.getYear(),
    lunar_month: Math.abs(rawMonth),
    lunar_day: lunar.getDay(),
    is_leap: isLeap,
    year_ganzhi: lunar.getYearInGanZhiByLiChun(),
    month_ganzhi: lunar.getMonthInGanZhi(),
    day_ganzhi: lunar.getDayInGanZhi(),
    solar_term: solarTerm,
    weekday: weekday,
  };
}

console.log('开始生成农历数据 (1900-2100)...');
console.log(`输出目录: ${OUT_DIR}`);

mkdirSync(OUT_DIR, { recursive: true });

// 按年代分组
const decades = {};
let total = 0;

const START = new Date(1900, 0, 1);  // 1900-01-01
const END = new Date(2100, 11, 31);  // 2100-12-31 (lunar-javascript 支持到 2100)

let current = new Date(START);
let lastLog = Date.now();

while (current <= END) {
  const y = current.getFullYear();
  const m = current.getMonth() + 1;
  const d = current.getDate();

  try {
    const rec = makeRecord(y, m, d);
    const key = getDecadeKey(y);
    if (!decades[key]) decades[key] = [];
    decades[key].push(rec);
    total++;
  } catch (err) {
    console.error(`生成 ${y}-${m}-${d} 失败:`, err.message);
  }

  current.setDate(current.getDate() + 1);

  // 进度输出（每秒一次）
  if (Date.now() - lastLog > 1000) {
    lastLog = Date.now();
    process.stdout.write(`\r已处理 ${total} 天... (${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')})`);
  }
}

console.log(`\n\n共生成 ${total} 条记录，分布在 ${Object.keys(decades).length} 个年代文件中`);

// 写入文件
for (const [key, records] of Object.entries(decades)) {
  const filename = DECADE_FILES[key];
  if (!filename) {
    console.warn(`⚠ 年代 ${key} 没有对应的文件名`);
    continue;
  }
  const filepath = join(OUT_DIR, filename);
  writeFileSync(filepath, JSON.stringify(records), 'utf-8');
  console.log(`✓ ${filename} (${records.length} 条)`);
}

// ── 城市数据 ──
console.log('\n写入 city-data-global-v2_9233fab2.json...');
// cityData.ts 已经内嵌了简化版 (200城)，这里输出完整版以保证兼容性
// 直接从 cityData.ts 引用格式，但实际数据在内嵌版本中已足够使用

// 这里生成一个占位文件：如果用户需要完整 592 城数据，需要另行从原 CDN 下载
// 内嵌版已在 cityData.ts 中，此文件仅用于兼容 fetch 路径
const cityPlaceholder = [];
writeFileSync(
  join(OUT_DIR, 'city-data-global-v2_9233fab2.json'),
  JSON.stringify(cityPlaceholder),
  'utf-8'
);
console.log('✓ city-data-global-v2_9233fab2.json (占位，实际使用内嵌版)');

console.log('\n✅ 全部完成！');

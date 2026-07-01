/**
 * 农历静态数据查询模块（浏览器版）
 * 数据来源：lunar-data-v1.0.1（1900-2100年，QA Round 2 通过）
 * 策略：按年代按需 fetch，内存缓存，O(1) 查表
 */

export interface SolarTermInfo {
  /** 节气名称，如"小暑"、"大寒" */
  name: string;
  /** 是否为"节"（月令分界点，如立春、惊蛰、清明等） */
  jie: boolean;
  /** 是否为"气"（月中点，如雨水、春分、谷雨等） */
  qi: boolean;
}

export interface LunarRecord {
  date: string;
  lunar_year: number;
  lunar_month: number;
  lunar_day: number;
  is_leap: boolean;
  year_ganzhi: string;
  month_ganzhi: string;
  day_ganzhi: string;
  /** 节气信息（仅节气日有值） */
  solar_term: SolarTermInfo | null;
  weekday: number;
}

// ── 数据路径 ──────────────────────────────────
// 本地开发时可通过 VITE_LUNAR_DATA_DIR 环境变量指定本地 JSON 目录
const LUNAR_DATA_DIR = import.meta.env.VITE_LUNAR_DATA_DIR ?? '/manus-storage';

const DECADE_URLS: Record<string, string> = {
  '1900s': `${LUNAR_DATA_DIR}/data_1900s_8987235d.json`,
  '1910s': `${LUNAR_DATA_DIR}/data_1910s_6279925c.json`,
  '1920s': `${LUNAR_DATA_DIR}/data_1920s_3275a4d2.json`,
  '1930s': `${LUNAR_DATA_DIR}/data_1930s_edbde05f.json`,
  '1940s': `${LUNAR_DATA_DIR}/data_1940s_0db1a3c7.json`,
  '1950s': `${LUNAR_DATA_DIR}/data_1950s_c2caf578.json`,
  '1960s': `${LUNAR_DATA_DIR}/data_1960s_7b72e69a.json`,
  '1970s': `${LUNAR_DATA_DIR}/data_1970s_2b210969.json`,
  '1980s': `${LUNAR_DATA_DIR}/data_1980s_ef4d1b0c.json`,
  '1990s': `${LUNAR_DATA_DIR}/data_1990s_2fe25b6b.json`,
  '2000s': `${LUNAR_DATA_DIR}/data_2000s_2a388234.json`,
  '2010s': `${LUNAR_DATA_DIR}/data_2010s_212b42b9.json`,
  '2020s': `${LUNAR_DATA_DIR}/data_2020s_cf1b0d05.json`,
  '2030s': `${LUNAR_DATA_DIR}/data_2030s_d61c1c16.json`,
  '2040s': `${LUNAR_DATA_DIR}/data_2040s_d1ee3c91.json`,
  '2050s': `${LUNAR_DATA_DIR}/data_2050s_a279288d.json`,
  '2060s': `${LUNAR_DATA_DIR}/data_2060s_ce9ef85b.json`,
  '2070s': `${LUNAR_DATA_DIR}/data_2070s_0940ce79.json`,
  '2080s': `${LUNAR_DATA_DIR}/data_2080s_6fdb1fa1.json`,
  '2090s': `${LUNAR_DATA_DIR}/data_2090s_922406fa.json`,
};

const START_YEAR = 1900;
const END_YEAR = 2100;

// 内存缓存：decadeKey -> Promise（防止并发重复 fetch）
const fetchCache = new Map<string, Promise<LunarRecord[]>>();
// 内存索引：dateStr -> LunarRecord（O(1) 查表）
const memoryIndex = new Map<string, LunarRecord>();

function getDecadeKey(year: number): string {
  if (year === 2100) return '2090s';
  const decade = Math.floor(year / 10) * 10;
  return `${decade}s`;
}

async function loadDecade(year: number): Promise<LunarRecord[]> {
  const key = getDecadeKey(year);
  if (fetchCache.has(key)) {
    return fetchCache.get(key)!;
  }
  const url = DECADE_URLS[key];
  if (!url) {
    console.warn(`lunarData: 未找到年代 ${key} 的数据 URL`);
    return [];
  }
  const promise = fetch(url)
    .then(r => r.json() as Promise<any[]>)
    .then(records => {
      for (const rec of records) {
        // 数据规范化：solar_term 的 _p 包装解包
        if (rec.solar_term && typeof rec.solar_term === 'object') {
          const raw = rec.solar_term;
          const inner = raw._p ?? raw;
          rec.solar_term = {
            name: (inner.name as string) ?? '',
            jie: (inner.jie as boolean) ?? false,
            qi: (inner.qi as boolean) ?? false,
          };
        }
        memoryIndex.set(rec.date, rec as LunarRecord);
      }
      return records as LunarRecord[];
    })
    .catch(err => {
      console.error(`lunarData: 加载 ${key} 失败`, err);
      fetchCache.delete(key); // 失败时清除，允许重试
      return [] as LunarRecord[];
    });
  fetchCache.set(key, promise);
  return promise;
}

/**
 * 查询指定公历日期的农历数据
 * @param dateStr "YYYY-MM-DD" 格式
 * @returns LunarRecord 或 null（超出范围 / 加载失败）
 */
export async function getLunarData(dateStr: string): Promise<LunarRecord | null> {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (!match) return null;
  const year = parseInt(match[1], 10);
  if (year < START_YEAR || year > END_YEAR) return null;

  // 已在索引中
  if (memoryIndex.has(dateStr)) return memoryIndex.get(dateStr)!;

  // 按需加载
  await loadDecade(year);
  return memoryIndex.get(dateStr) ?? null;
}

/**
 * 预加载指定年份所在年代的数据（可在排盘前调用）
 */
export function preloadDecade(year: number): void {
  loadDecade(year);
}

/**
 * 预加载常用年代（1950-2030）以提升首次排盘速度
 */
export function preloadCommonDecades(): void {
  for (let y = 1950; y <= 2030; y += 10) {
    loadDecade(y);
  }
}

/**
 * 计算时柱（根据日柱天干、出生小时和分钟）
 * @param dayGanzhi 日柱干支（如 "丁巳"）
 * @param hour 出生小时（真太阳时，0-23）
 * @param minute 出生分钟（真太阳时，0-59），默认 0
 *
 * 传统命理时辰划分（以总分钟数精确判断）：
 *   子时：23:01–01:00（跨午夜，23:00 整点归亥时）
 *   丑时：01:01–03:00
 *   寅时：03:01–05:00
 *   卯时：05:01–07:00
 *   辰时：07:01–09:00
 *   巳时：09:01–11:00
 *   午时：11:01–13:00
 *   未时：13:01–15:00
 *   申时：15:01–17:00
 *   酉时：17:01–19:00
 *   戌时：19:01–21:00
 *   亥时：21:01–23:00（含 23:00 整点）
 */
export function getShiZhu(dayGanzhi: string, hour: number, minute: number = 0): string {
  const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

  const gan = dayGanzhi[0];
  const ganIdx = TIAN_GAN.indexOf(gan);
  if (ganIdx === -1) return '';

  // 以总分钟数精确判断时辰
  const totalMins = hour * 60 + minute;
  let zhiIdx: number;
  if (totalMins <= 60) {
    // 00:00–01:00 → 子时
    zhiIdx = 0;
  } else if (totalMins <= 180) {
    // 01:01–03:00 → 丑时
    zhiIdx = 1;
  } else if (totalMins <= 300) {
    // 03:01–05:00 → 寅时
    zhiIdx = 2;
  } else if (totalMins <= 420) {
    // 05:01–07:00 → 卯时
    zhiIdx = 3;
  } else if (totalMins <= 540) {
    // 07:01–09:00 → 辰时
    zhiIdx = 4;
  } else if (totalMins <= 660) {
    // 09:01–11:00 → 巳时
    zhiIdx = 5;
  } else if (totalMins <= 780) {
    // 11:01–13:00 → 午时
    zhiIdx = 6;
  } else if (totalMins <= 900) {
    // 13:01–15:00 → 未时
    zhiIdx = 7;
  } else if (totalMins <= 1020) {
    // 15:01–17:00 → 申时
    zhiIdx = 8;
  } else if (totalMins <= 1140) {
    // 17:01–19:00 → 酉时
    zhiIdx = 9;
  } else if (totalMins <= 1260) {
    // 19:01–21:00 → 戌时
    zhiIdx = 10;
  } else {
    // 21:01–23:00（含 23:00 整点）及 23:01–23:59 → 亥时/子时
    // 23:01 及之后为子时（晚子时），但日柱仍用当日
    zhiIdx = totalMins <= 1380 ? 11 : 0; // ≤23:00 亥时，>23:00 子时
  }

  // 甲己日起甲子，乙庚日起丙子，丙辛日起戊子，丁壬日起庚子，戊癸日起壬子
  const startGanIdx = (ganIdx % 5) * 2;
  const shiGanIdx = (startGanIdx + zhiIdx) % 10;

  return TIAN_GAN[shiGanIdx] + DI_ZHI[zhiIdx];
}

/**
 * 同步查询（仅在已缓存时有效，否则返回 null）
 */
export function getLunarDataSync(dateStr: string): LunarRecord | null {
  return memoryIndex.get(dateStr) ?? null;
}

/**
 * 查询某农历年是否有闰月，返回闰月的月份（0 表示无闰月）
 * 内部扫描该农历年对应公历年份范围内的已缓存数据
 * 如果数据尚未加载，则先加载再查询
 */
export async function getLeapMonthOfYear(lunarYear: number): Promise<number> {
  // 确保该年对应的公历年份数据已加载
  await loadDecade(lunarYear);
  await loadDecade(lunarYear + 1); // 农历年可能跨公历年

  const records = Array.from(memoryIndex.values());
  for (const rec of records) {
    if (rec.lunar_year === lunarYear && rec.is_leap) {
      return rec.lunar_month;
    }
  }
  return 0; // 无闰月
}

/**
 * 同步版查询某农历年的闰月（仅在数据已缓存时有效）
 */
export function getLeapMonthOfYearSync(lunarYear: number): number {
  const records = Array.from(memoryIndex.values());
  for (const rec of records) {
    if (rec.lunar_year === lunarYear && rec.is_leap) {
      return rec.lunar_month;
    }
  }
  return 0;
}

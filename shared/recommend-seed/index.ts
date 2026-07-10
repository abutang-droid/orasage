import { createHash } from 'crypto';

/** 五行 → 计费槽位后缀（bazi / ziwei 共用 element 槽位） */
export const WUXING_ELEMENT_SLOT: Record<string, string> = {
  木: 'wood',
  火: 'fire',
  土: 'earth',
  金: 'metal',
  水: 'water',
};

export function billingSlotKeyForElement(element: string): string | null {
  const code = WUXING_ELEMENT_SLOT[element];
  return code ? `recommend.element.${code}` : null;
}

export function deficientWuXingElement(wuXing: Record<string, number>): string | null {
  const entries = Object.entries(wuXing).filter(([, v]) => Number.isFinite(v));
  if (entries.length === 0) return null;
  let minWx = entries[0][0];
  let minCount = entries[0][1];
  for (const [wx, count] of entries) {
    if (count < minCount) {
      minWx = wx;
      minCount = count;
    }
  }
  return minWx;
}

export function wuxingElementFromZiweiJu(juName: string | null | undefined): string | null {
  const wx = juName?.trim()?.[0];
  return wx && WUXING_ELEMENT_SLOT[wx] ? wx : null;
}

function hashParts(parts: Record<string, string>): string {
  const payload = Object.keys(parts)
    .sort()
    .map((key) => `${key}=${parts[key]}`)
    .join('\n');
  return createHash('sha256').update(payload).digest('hex').slice(0, 32);
}

/** 塔罗：推荐饰品与注册账号绑定 */
export function buildTarotAccountRecommendSeed(userId: string): string {
  return hashParts({ purpose: 'tarot-account', userId });
}

/** 八字 / 紫微：推荐饰品与命盘（出生信息 + 五行结论）绑定 */
export function buildChartRecommendSeed(parts: Record<string, string>): string {
  return hashParts({ purpose: 'chart-recommend', ...parts });
}

export function buildBaziChartRecommendSeed(input: {
  birthStr: string;
  gender: string;
  name?: string;
  wuXing: Record<string, number>;
}): string {
  const wuXingStr = Object.entries(input.wuXing)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}:${v}`)
    .join(',');
  return buildChartRecommendSeed({
    app: 'bazi',
    birth: input.birthStr.trim(),
    gender: input.gender,
    name: (input.name ?? '').trim(),
    wuxing: wuXingStr,
  });
}

export function buildZiweiChartRecommendSeed(input: {
  year: number;
  month: number;
  day: number;
  hour: number;
  gender: string;
  name?: string;
  city?: string;
  wuxingJuName: string;
}): string {
  return buildChartRecommendSeed({
    app: 'ziwei',
    birth: `${input.year}-${input.month}-${input.day}@${input.hour}`,
    gender: input.gender,
    name: (input.name ?? '').trim(),
    city: (input.city ?? '').trim(),
    wuxingJu: input.wuxingJuName.trim(),
  });
}

import type { ZiweiChart } from '@/lib/ziwei/types';
import { newReadingId, syncReading, WUXING_CRYSTAL_SKU, type ReadingSyncPayload } from '../../shared/reading-sync/sync';

export { newReadingId, syncReading };
export type { ReadingSyncPayload };

export const PLAN_REPORT_SKU: Record<string, string> = {
  basic: 'report-ziwei-basic',
  advanced: 'report-ziwei-advanced',
  premium: 'report-ziwei-premium',
};

export function planToReportSku(plan: string): string {
  return PLAN_REPORT_SKU[plan] ?? 'report-ziwei-advanced';
}

function ziweiSummary(chart: ZiweiChart): string {
  const ming = chart.palaces.find((p) => p.name === '命宫');
  const stars = ming?.stars?.map((s) => s.name).join('、') ?? '';
  const parts = [chart.wuxingJuName];
  if (stars) parts.push(`命宫 ${stars}`);
  return parts.join(' · ');
}

function ziweiWuxing(chart: ZiweiChart): string | null {
  const wx = chart.wuxingJuName?.[0];
  return wx && WUXING_CRYSTAL_SKU[wx] ? wx : null;
}

export function ziweiCrystalRecommendation(chart: ZiweiChart) {
  const wuxing = ziweiWuxing(chart);
  if (!wuxing) return null;
  const crystalSku = WUXING_CRYSTAL_SKU[wuxing];
  return {
    wuxing,
    crystalSku,
    reason: `根据${chart.wuxingJuName}命盘能量，推荐佩戴补${wuxing}属性的水晶手串。`,
  };
}

export function syncZiweiReading(
  chart: ZiweiChart,
  options?: { label?: string; existingReadingId?: string; couplePartner?: ZiweiChart },
) {
  const name = chart.birthInfo.name?.trim() || '命主';
  const readingId = options?.existingReadingId ?? newReadingId('ziwei');

  if (options?.couplePartner) {
    const partner = options.couplePartner;
    const nameB = partner.birthInfo.name?.trim() || '对方';
    const payloadJson = JSON.stringify({ type: 'couple', chartA: chart, chartB: partner });
    void syncReading({
      appSource: 'ziwei',
      readingId,
      title: `紫微合盘 · ${name} & ${nameB}`,
      summary: `${ziweiSummary(chart)} × ${ziweiSummary(partner)}`,
      payloadJson,
    });
    return readingId;
  }

  const title = options?.label
    ? `紫微合盘 · ${options.label} · ${name}`
    : `紫微排盘 · ${name}`;
  const crystal = ziweiCrystalRecommendation(chart);
  const payloadJson = JSON.stringify({ type: 'single', chart });
  void syncReading({
    appSource: 'ziwei',
    readingId,
    title,
    summary: ziweiSummary(chart),
    recommendationReason: crystal?.reason,
    crystalSku: crystal?.crystalSku,
    payloadJson,
  });
  return readingId;
}

import type { ZiweiChart } from '@/lib/ziwei/types';
import { newReadingId, syncReading, WUXING_CRYSTAL_SKU, type ReadingSyncPayload } from '../../shared/reading-sync/sync';

export { newReadingId, syncReading };
export type { ReadingSyncPayload };

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

export function syncZiweiReading(chart: ZiweiChart, options?: { label?: string }) {
  const name = chart.birthInfo.name?.trim() || '命主';
  const title = options?.label
    ? `紫微合盘 · ${options.label} · ${name}`
    : `紫微排盘 · ${name}`;
  const crystal = ziweiCrystalRecommendation(chart);
  return syncReading({
    appSource: 'ziwei',
    readingId: newReadingId('ziwei'),
    title,
    summary: ziweiSummary(chart),
    recommendationReason: crystal?.reason,
    crystalSku: crystal?.crystalSku,
  });
}

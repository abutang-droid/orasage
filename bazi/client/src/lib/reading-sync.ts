import type { SingleBaziResult, DoubleBaziResult, BraceletRecommendation } from '@/lib/bazi';
import { newReadingId, syncReading, WUXING_CRYSTAL_SKU } from '../../../../shared/reading-sync/sync';

export { newReadingId, syncReading, WUXING_CRYSTAL_SKU };

export function braceletToCrystalSku(rec: BraceletRecommendation | null): string | undefined {
  if (!rec) return undefined;
  return WUXING_CRYSTAL_SKU[rec.deficiencyWx];
}

export function syncBaziSingleReading(
  name: string,
  data: SingleBaziResult,
  braceletRec?: BraceletRecommendation | null,
) {
  const displayName = name.trim() || '访客';
  const crystalSku = braceletToCrystalSku(braceletRec ?? null);
  const readingId = newReadingId('bazi');
  const payloadJson = JSON.stringify({ type: 'single', lang: 'zh-CN', resultData: data });
  void syncReading({
    appSource: 'bazi',
    readingId,
    title: `八字排盘 · ${displayName}`,
    summary: `日主 ${data.riZhu} · ${data.strength} · 喜用 ${data.favorable?.join('、') || '—'}`,
    recommendationReason: braceletRec?.reason,
    crystalSku,
    payloadJson,
  });
  return readingId;
}

export const PLAN_REPORT_SKU: Record<string, string> = {
  basic: 'report-bazi-basic',
  advanced: 'report-bazi-advanced',
  premium: 'report-bazi-premium',
};

export function planToReportSku(plan: string): string {
  return PLAN_REPORT_SKU[plan] ?? 'report-bazi-advanced';
}

export function syncBaziDoubleReading(nameA: string, nameB: string, data: DoubleBaziResult) {
  const readingId = newReadingId('bazi');
  const payloadJson = JSON.stringify({ type: 'couple', lang: 'zh-CN', resultData: data });
  void syncReading({
    appSource: 'bazi',
    readingId,
    title: `八字合盘 · ${nameA.trim() || '甲'} & ${nameB.trim() || '乙'}`,
    summary: `契合度 ${data.score} 分 · ${data.rating}`,
    payloadJson,
  });
  return readingId;
}

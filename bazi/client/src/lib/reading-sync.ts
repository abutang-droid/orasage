import type { SingleBaziResult, DoubleBaziResult, BraceletRecommendation } from '@/lib/bazi';
import { newReadingId, syncReading, WUXING_CRYSTAL_SKU } from '../../../../shared/reading-sync/sync';

export { newReadingId, syncReading, WUXING_CRYSTAL_SKU };

export function braceletToCrystalSku(rec: BraceletRecommendation | null): string | undefined {
  if (!rec) return undefined;
  return WUXING_CRYSTAL_SKU[rec.deficiencyWx];
}

import type { CoreLocale } from '@orasage/i18n';

export function syncBaziSingleReading(
  name: string,
  data: SingleBaziResult,
  braceletRec?: BraceletRecommendation | null,
  existingReadingId?: string,
  lang: CoreLocale = 'zh-CN',
) {
  const displayName = name.trim() || '访客';
  const crystalSku = braceletToCrystalSku(braceletRec ?? null);
  const readingId = existingReadingId ?? newReadingId('bazi');
  const payloadJson = JSON.stringify({ type: 'single', lang, resultData: data });
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

export const PLAN_COUPLE_REPORT_SKU: Record<string, string> = {
  basic: 'report-bazi-couple-basic',
  advanced: 'report-bazi-couple-advanced',
  premium: 'report-bazi-couple-premium',
};

export function planToReportSku(plan: string, mode: 'single' | 'couple' = 'single'): string {
  const map = mode === 'couple' ? PLAN_COUPLE_REPORT_SKU : PLAN_REPORT_SKU;
  return map[plan] ?? (mode === 'couple' ? 'report-bazi-couple-advanced' : 'report-bazi-advanced');
}

export function syncBaziDoubleReading(
  nameA: string,
  nameB: string,
  data: DoubleBaziResult,
  existingReadingId?: string,
  lang: CoreLocale = 'zh-CN',
) {
  const readingId = existingReadingId ?? newReadingId('bazi');
  const payloadJson = JSON.stringify({ type: 'couple', lang, resultData: data });
  void syncReading({
    appSource: 'bazi',
    readingId,
    title: `八字合盘 · ${nameA.trim() || '甲'} & ${nameB.trim() || '乙'}`,
    summary: `契合度 ${data.score} 分 · ${data.rating}`,
    payloadJson,
  });
  return readingId;
}

import type { ZiweiChart } from '@/lib/ziwei/types';
import { newReadingId, syncReading, type ReadingSyncPayload } from '../../shared/reading-sync/sync';

export { newReadingId, syncReading };
export type { ReadingSyncPayload };

function ziweiSummary(chart: ZiweiChart): string {
  const ming = chart.palaces.find((p) => p.name === '命宫');
  const stars = ming?.stars?.map((s) => s.name).join('、') ?? '';
  const parts = [chart.wuxingJuName];
  if (stars) parts.push(`命宫 ${stars}`);
  return parts.join(' · ');
}

export function syncZiweiReading(chart: ZiweiChart, options?: { label?: string }) {
  const name = chart.birthInfo.name?.trim() || '命主';
  const title = options?.label
    ? `紫微合盘 · ${options.label} · ${name}`
    : `紫微排盘 · ${name}`;
  return syncReading({
    appSource: 'ziwei',
    readingId: newReadingId('ziwei'),
    title,
    summary: ziweiSummary(chart),
  });
}

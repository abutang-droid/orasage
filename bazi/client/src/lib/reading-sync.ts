import type { SingleBaziResult, DoubleBaziResult } from '@/lib/bazi';
import { newReadingId, syncReading } from '../../../../shared/reading-sync/sync';

export { newReadingId, syncReading };

export function syncBaziSingleReading(name: string, data: SingleBaziResult) {
  const displayName = name.trim() || '访客';
  return syncReading({
    appSource: 'bazi',
    readingId: newReadingId('bazi'),
    title: `八字排盘 · ${displayName}`,
    summary: `日主 ${data.riZhu} · ${data.strength} · 喜用 ${data.favorable?.join('、') || '—'}`,
  });
}

export function syncBaziDoubleReading(nameA: string, nameB: string, data: DoubleBaziResult) {
  return syncReading({
    appSource: 'bazi',
    readingId: newReadingId('bazi'),
    title: `八字合盘 · ${nameA.trim() || '甲'} & ${nameB.trim() || '乙'}`,
    summary: `契合度 ${data.score} 分 · ${data.rating}`,
  });
}

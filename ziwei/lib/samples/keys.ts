import type { SampleLookupKey } from './types';

/** 样本库覆盖的干支轮回基准年（1924–1983，共 60 年） */
export const SAMPLE_YEAR_BASE = 1924;
export const SAMPLE_YEAR_END = 1983;
export const SAMPLE_YEAR_SPAN = 60;

/** 将任意公历年生辰映射到样本库年份（同干支轮回） */
export function normalizeSampleYear(year: number): number {
  const offset = ((year - SAMPLE_YEAR_BASE) % SAMPLE_YEAR_SPAN + SAMPLE_YEAR_SPAN) % SAMPLE_YEAR_SPAN;
  let canonical = SAMPLE_YEAR_BASE + offset;
  if (canonical > SAMPLE_YEAR_END) canonical -= SAMPLE_YEAR_SPAN;
  return canonical;
}

export function normalizeLookupKey(key: SampleLookupKey): SampleLookupKey {
  return {
    year: normalizeSampleYear(key.year),
    month: key.month,
    day: Math.min(Math.max(key.day, 1), 30),
    hour: Math.min(Math.max(key.hour, 0), 11),
    gender: key.gender,
  };
}

/** samples-out/year-YYYY/YYYY-MM.jsonl.gz */
export function sampleArchivePath(samplesRoot: string, key: SampleLookupKey): string {
  const y = key.year;
  const m = String(key.month).padStart(2, '0');
  return `${samplesRoot}/samples-out/year-${y}/${y}-${m}.jsonl.gz`;
}

/**
 * 每月 jsonl.gz 固定 720 行：day(1–30) × hour(0–11) × gender(male,female)
 * 排序：day → hour → gender（female 在 male 后）
 */
export function sampleLineIndex(key: SampleLookupKey): number {
  return (key.day - 1) * 24 + key.hour * 2 + (key.gender === 'female' ? 1 : 0);
}

export function lookupKeyString(key: SampleLookupKey): string {
  return `${key.year}-${key.month}-${key.day}-h${key.hour}-${key.gender}`;
}

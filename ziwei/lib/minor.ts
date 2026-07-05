import type { BirthInfo } from '@/lib/ziwei/types';

/** 周岁年龄（满 16 周岁当天起算 16 岁，按成人处理） */
export function calcAgeYears(
  year: number,
  month: number,
  day: number,
  ref: Date = new Date(),
): number {
  if (!year || !month || !day) return 99;
  let age = ref.getFullYear() - year;
  const refMonth = ref.getMonth() + 1;
  const refDay = ref.getDate();
  if (refMonth < month || (refMonth === month && refDay < day)) {
    age -= 1;
  }
  return age;
}

export function isMinorBirth(
  birth: Pick<BirthInfo, 'year' | 'month' | 'day'>,
  ref: Date = new Date(),
): boolean {
  return calcAgeYears(birth.year, birth.month, birth.day, ref) < 16;
}

export function isMinorChartPair(
  chartA: { birthInfo: BirthInfo },
  chartB?: { birthInfo: BirthInfo } | null,
): boolean {
  if (isMinorBirth(chartA.birthInfo)) return true;
  if (chartB && isMinorBirth(chartB.birthInfo)) return true;
  return false;
}

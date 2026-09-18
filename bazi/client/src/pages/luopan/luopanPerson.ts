import type { BirthplaceValue } from '@orasage/city';
import type { PersonInput } from '@/lib/bazi';
import type { LuopanDialState } from './engine.js';

/**
 * Map luopan dial + birth city onto the same PersonInput shape as classic Home.
 * Ranking always goes through calcSingleBazi (lunar-data 四柱、真太阳时、藏干加权五行).
 */
export function luopanToPersonInput(
  s: LuopanDialState,
  city: BirthplaceValue,
): PersonInput {
  const isLunar = s.calendar === 'lunar';
  const lng = city.lng;
  return {
    name: '访客',
    gender: s.sex === '女' ? 'female' : 'male',
    year: isLunar ? s.lunarYear : s.y,
    month: isLunar ? s.lunarMonth : s.m,
    day: isLunar ? s.lunarDay : s.d,
    hour: s.hh,
    minute: s.mi,
    calendar: isLunar ? 'lunar' : 'gregorian',
    ...(isLunar && s.lunarLeap ? { isLeapMonth: true } : {}),
    birthplace: city.city,
    cityName: city.city,
    ...(lng != null ? { lng, lat: city.lat ?? 0, timezone: city.timezone || '+8' } : {}),
  };
}

export function cangGanList(zhi: string, zangGanMap: Record<string, Record<string, number>>): string[] {
  const hidden = zangGanMap[zhi];
  if (!hidden) return [];
  return Object.entries(hidden)
    .sort((a, b) => b[1] - a[1])
    .map(([gan]) => gan);
}

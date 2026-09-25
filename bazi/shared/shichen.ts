/**
 * 时辰 / 时柱。与 lunar-javascript `LunarUtil.getTimeZhiIndex` 以及罗盘
 * `tz=((hh+1)/2|0)%12` 一致：整点两小时一块，子时从 23:00 起。
 *
 *   子 23:00–00:59  丑 01:00–02:59  寅 03:00–04:59  卯 05:00–06:59
 *   辰 07:00–08:59  巳 09:00–10:59  午 11:00–12:59  未 13:00–14:59
 *   申 15:00–16:59  酉 17:00–18:59  戌 19:00–20:59  亥 21:00–22:59
 *
 * 分钟不单独改时辰（真太阳时已在调用前把分钟折进 hour）。
 */

export const TIAN_GAN = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"] as const;
export const DI_ZHI = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"] as const;

export function hourToZhiIndex(hour: number, _minute: number = 0): number {
  const h = ((Math.trunc(hour) % 24) + 24) % 24;
  return Math.floor((h + 1) / 2) % 12;
}

/** 罗盘内核同一公式，便于对拍。 */
export function luopanHourZhiIndex(hour: number): number {
  const hh = ((Math.trunc(hour) % 24) + 24) % 24;
  return ((hh + 1) / 2 | 0) % 12;
}

/**
 * 时柱干支。时干五鼠遁：甲己甲、乙庚丙、丙辛戊、丁壬庚、戊癸壬。
 */
export function getShiZhu(dayGanzhi: string, hour: number, minute: number = 0): string {
  const gan = dayGanzhi[0];
  const ganIdx = (TIAN_GAN as readonly string[]).indexOf(gan);
  if (ganIdx === -1) return "";
  const zhiIdx = hourToZhiIndex(hour, minute);
  const startGanIdx = (ganIdx % 5) * 2;
  const shiGanIdx = (startGanIdx + zhiIdx) % 10;
  return TIAN_GAN[shiGanIdx] + DI_ZHI[zhiIdx];
}

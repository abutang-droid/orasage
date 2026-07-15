/**
 * 未知时辰契约（T0-01 / T1-01）
 * 权威：docs/design-system/bazi-uiux-t0-decisions-2026-07-15.md
 * 留空 → 08:00；用户显式选择的时分原样保留。
 */

export const UNKNOWN_BIRTH_HOUR = "08";
export const UNKNOWN_BIRTH_MINUTE = "00";

export function resolveUnknownBirthTime(hour: string, minute: string): {
  hour: string;
  minute: string;
} {
  return {
    hour: hour.trim() ? hour : UNKNOWN_BIRTH_HOUR,
    minute: minute.trim() ? minute : UNKNOWN_BIRTH_MINUTE,
  };
}

/** 将表单时分转为排盘 payload 数字（先 resolve 再 parse） */
export function birthTimePayload(hour: string, minute: string): {
  hour: number;
  minute: number;
} {
  const resolved = resolveUnknownBirthTime(hour, minute);
  return {
    hour: parseInt(resolved.hour, 10),
    minute: parseInt(resolved.minute, 10),
  };
}

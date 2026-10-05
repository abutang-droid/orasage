/**
 * 排盘记录身份：同一账号（或同一设备）+ 同一套输入 → 同一 readingId。
 * 文件名、数据库行、支付回跳都跟这个 ID。
 */

function fnv1aHex(input: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

function pillarKey(data: Record<string, unknown>, key: string): string {
  const p = data[key] as { gan?: string; zhi?: string } | undefined;
  return `${p?.gan ?? ""}-${p?.zhi ?? ""}`;
}

function personFingerprint(data: Record<string, unknown>): string {
  return [
    String(data.name ?? "").trim() || "访客",
    String(data.gender ?? ""),
    String(data.birthStr ?? ""),
    String(data.calendar ?? ""),
    String(data.birthplace ?? data.cityName ?? ""),
    pillarKey(data, "year"),
    pillarKey(data, "month"),
    pillarKey(data, "day"),
    pillarKey(data, "hour"),
  ].join("|");
}

/** 排盘输入指纹（不含账号、设备）。合盘把两人拼在一起。 */
export function chartInputFingerprint(resultData: Record<string, unknown>): string {
  const p1 = resultData.person1;
  const p2 = resultData.person2;
  if (p1 && typeof p1 === "object" && p2 && typeof p2 === "object") {
    return fnv1aHex(
      `couple|${personFingerprint(p1 as Record<string, unknown>)}|${personFingerprint(p2 as Record<string, unknown>)}`,
    );
  }
  return fnv1aHex(`single|${personFingerprint(resultData)}`);
}

export function sanitizeDeviceId(raw: string | null | undefined): string {
  const t = (raw ?? "").trim().replace(/[^a-zA-Z0-9._:-]/g, "").slice(0, 64);
  return t.length >= 8 ? t : "";
}

/**
 * 稳定 readingId。
 * 已登录：绑账号 + 输入；游客：绑设备 + 输入。
 */
export function stableChartReadingId(opts: {
  userId?: number | null;
  deviceId: string;
  fingerprint: string;
}): string {
  const fp = opts.fingerprint.replace(/[^a-f0-9]/gi, "").slice(0, 16) || "0";
  const uid = opts.userId && opts.userId > 0 ? opts.userId : 0;
  if (uid > 0) return `bazi_u${uid}_${fp}`;
  const device = sanitizeDeviceId(opts.deviceId) || "anon";
  return `bazi_d${device}_${fp}`.slice(0, 96);
}

export function chartKindFromResult(resultData: Record<string, unknown>): "single" | "couple" {
  return resultData.person1 && resultData.person2 ? "couple" : "single";
}

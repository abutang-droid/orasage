/**
 * 四部全书卷次提取（脚本侧，与 main/src/lib/daozang-volumes.ts 逻辑一致）
 */

/** 从 legacy_html 的 QR id（如 3_1_5_12_1）取第 4 段作为卷号 */
export function volumeFromLegacyHtml(html) {
  const m = String(html || '').match(/bookcode\/qr_code\.php\?id=([^"']+)/);
  if (!m) return null;
  const parts = m[1].split('_');
  if (parts.length >= 5) return String(parts[3]);
  return null;
}

/** 从标题解析卷（卷上/卷中/卷下 或 第N卷） */
export function volumeFromTitle(title) {
  const clean = String(title || '').trim();
  const named = clean.match(/卷(上|中|下)/);
  if (named) return named[1];
  const num = clean.match(/第?\s*(\d+)\s*卷/);
  if (num) return num[1];
  return null;
}

export function resolveVolumeKey(title, legacyHtml) {
  return volumeFromLegacyHtml(legacyHtml) || volumeFromTitle(title);
}

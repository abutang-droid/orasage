/** 组合子项角色：固定 SKU vs 八字五行推荐水晶（变量） */
export const COMBO_ITEM_ROLES = ['fixed', 'element_crystal'] as const;
export type ComboItemRole = (typeof COMBO_ITEM_ROLES)[number];

export function isComboItemRole(value: unknown): value is ComboItemRole {
  return value === 'fixed' || value === 'element_crystal';
}

export function normalizeComboItemRole(value: unknown): ComboItemRole {
  return isComboItemRole(value) ? value : 'fixed';
}

/** 写入订单 recommendationContext，便于履约识别实际水晶 */
export function appendCrystalFulfillmentContext(
  base: string | null | undefined,
  crystalSku: string,
): string {
  const tag = `crystalSku=${crystalSku}`;
  const trimmed = (base ?? '').trim();
  if (!trimmed) return tag;
  if (trimmed.includes(`crystalSku=`)) {
    return trimmed.replace(/crystalSku=[^\s;|]+/g, tag);
  }
  return `${trimmed} | ${tag}`;
}

export function parseCrystalSkuFromContext(context: string | null | undefined): string | null {
  if (!context) return null;
  const match = context.match(/crystalSku=([a-z0-9-]+)/i);
  return match?.[1] ?? null;
}

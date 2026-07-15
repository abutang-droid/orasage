/** 五行水晶手链第一期：标准装 base SKU + 礼盒装 gift SKU */

export const CRYSTAL_BASE_SKUS = [
  "crystal-wood",
  "crystal-fire",
  "crystal-earth",
  "crystal-metal",
  "crystal-water",
] as const;

export type CrystalBaseSku = (typeof CRYSTAL_BASE_SKUS)[number];

/** accent is neutral gray token hex — UI chrome must not use element-colored halos (SHOP S14). */
export const CRYSTAL_ELEMENT_META: Record<
  CrystalBaseSku,
  { element: string; elementKey: string; accent: string }
> = {
  "crystal-wood": { element: "木", elementKey: "wood", accent: "#9ca3af" },
  "crystal-fire": { element: "火", elementKey: "fire", accent: "#9ca3af" },
  "crystal-earth": { element: "土", elementKey: "earth", accent: "#9ca3af" },
  "crystal-metal": { element: "金", elementKey: "metal", accent: "#9ca3af" },
  "crystal-water": { element: "水", elementKey: "water", accent: "#9ca3af" },
};

export function crystalGiftSku(baseSku: string): string {
  return `${baseSku}-gift`;
}

export function crystalBaseSkuFromGift(sku: string): string | null {
  if (!sku.endsWith("-gift") || !sku.startsWith("crystal-")) return null;
  const base = sku.slice(0, -"-gift".length);
  return (CRYSTAL_BASE_SKUS as readonly string[]).includes(base) ? base : null;
}

export function isCrystalGiftSku(sku: string): boolean {
  return crystalBaseSkuFromGift(sku) !== null;
}

export function isCrystalBaseSku(sku: string): sku is CrystalBaseSku {
  return (CRYSTAL_BASE_SKUS as readonly string[]).includes(sku);
}

export type ShopHomeLayout = "legacy" | "crystal_v1";

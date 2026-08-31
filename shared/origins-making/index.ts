/** Crystal SKU ↔ Making story mapping (Batch 3 placeholder; later CMS-owned). */
export const MAKING_SKUS = [
  'crystal-wood',
  'crystal-fire',
  'crystal-earth',
  'crystal-metal',
  'crystal-water',
] as const;

export type MakingSku = (typeof MAKING_SKUS)[number];

export function isMakingSku(sku: string): sku is MakingSku {
  return (MAKING_SKUS as readonly string[]).includes(sku);
}

/** Map gift SKUs to the base crystal story. */
export function makingSkuForProduct(sku: string): MakingSku | null {
  const base = sku.endsWith('-gift') ? sku.slice(0, -'-gift'.length) : sku;
  return isMakingSku(base) ? base : null;
}

export const MAKING_META: Record<
  MakingSku,
  { elementEn: string; elementZh: string; nameEn: string; nameZh: string; intentionEn: string; intentionZh: string }
> = {
  'crystal-wood': {
    elementEn: 'Wood',
    elementZh: '木',
    nameEn: 'Realm of Growth · Green Phantom',
    nameZh: '生长之境 · 绿幽灵',
    intentionEn: 'Growth',
    intentionZh: '生长',
  },
  'crystal-fire': {
    elementEn: 'Fire',
    elementZh: '火',
    nameEn: 'Awakening Flame · Red Agate',
    nameZh: '焰心觉醒 · 红玛瑙',
    intentionEn: 'Courage',
    intentionZh: '勇气',
  },
  'crystal-earth': {
    elementEn: 'Earth',
    elementZh: '土',
    nameEn: 'Root of Earth · Citrine',
    nameZh: '厚土之根 · 黄水晶',
    intentionEn: 'Grounding',
    intentionZh: '稳固',
  },
  'crystal-metal': {
    elementEn: 'Metal',
    elementZh: '金',
    nameEn: 'Clear Realm · Clear Quartz',
    nameZh: '澄明之境 · 白水晶',
    intentionEn: 'Clarity',
    intentionZh: '澄明',
  },
  'crystal-water': {
    elementEn: 'Water',
    elementZh: '水',
    nameEn: 'Deep Sea Shield · Obsidian',
    nameZh: '深海静盾 · 黑曜石',
    intentionEn: 'Boundaries',
    intentionZh: '边界',
  },
};

export function makingUrl(locale: string, sku: MakingSku): string {
  return `https://orasage.com/${locale}/origins/the-making/${sku}`;
}

export function shopPdpUrl(sku: string): string {
  return `https://shop.orasage.com/product/${sku}`;
}

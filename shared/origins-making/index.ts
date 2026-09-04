/** Crystal SKU ↔ Making story mapping (later CMS-owned). */
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

export type MakingSpecs = {
  materialEn: string;
  materialZh: string;
  beadMm: string;
  wristEn: string;
  wristZh: string;
  finishEn: string;
  finishZh: string;
};

export const MAKING_META: Record<
  MakingSku,
  {
    elementEn: string;
    elementZh: string;
    nameEn: string;
    nameZh: string;
    intentionEn: string;
    intentionZh: string;
    specs: MakingSpecs;
  }
> = {
  'crystal-wood': {
    elementEn: 'Wood',
    elementZh: '木',
    nameEn: 'Realm of Growth · Green Phantom Quartz Bracelet',
    nameZh: '生长之境 · 绿幽灵手串',
    intentionEn: 'Growth',
    intentionZh: '生长',
    specs: {
      materialEn: 'Green phantom quartz',
      materialZh: '绿幽灵水晶',
      beadMm: '8 mm',
      wristEn: '15–18 cm adjustable',
      wristZh: '15–18 cm 可调',
      finishEn: 'Hand-knotted, waxed cord',
      finishZh: '手工打结 · 蜡线',
    },
  },
  'crystal-fire': {
    elementEn: 'Fire',
    elementZh: '火',
    nameEn: 'Awakening of the Inner Flame · Red Agate Bracelet',
    nameZh: '焰心觉醒 · 红玛瑙手串',
    intentionEn: 'Courage',
    intentionZh: '勇气',
    specs: {
      materialEn: 'Red agate',
      materialZh: '红玛瑙',
      beadMm: '8 mm',
      wristEn: '15–18 cm adjustable',
      wristZh: '15–18 cm 可调',
      finishEn: 'Hand-knotted, waxed cord',
      finishZh: '手工打结 · 蜡线',
    },
  },
  'crystal-earth': {
    elementEn: 'Earth',
    elementZh: '土',
    nameEn: 'Roots of the Fertile Earth · Citrine Bracelet',
    nameZh: '厚土之根 · 黄水晶手串',
    intentionEn: 'Grounding',
    intentionZh: '稳固',
    specs: {
      materialEn: 'Citrine',
      materialZh: '黄水晶',
      beadMm: '8 mm',
      wristEn: '15–18 cm adjustable',
      wristZh: '15–18 cm 可调',
      finishEn: 'Hand-knotted, waxed cord',
      finishZh: '手工打结 · 蜡线',
    },
  },
  'crystal-metal': {
    elementEn: 'Metal',
    elementZh: '金',
    nameEn: 'Realm of Clarity – Clear Quartz Bracelet',
    nameZh: '澄明之境 · 白水晶手串',
    intentionEn: 'Clarity',
    intentionZh: '澄明',
    specs: {
      materialEn: 'Clear quartz',
      materialZh: '白水晶',
      beadMm: '8 mm',
      wristEn: '15–18 cm adjustable',
      wristZh: '15–18 cm 可调',
      finishEn: 'Hand-knotted, waxed cord',
      finishZh: '手工打结 · 蜡线',
    },
  },
  'crystal-water': {
    elementEn: 'Water',
    elementZh: '水',
    nameEn: 'Deep-Sea Silent Shield · Obsidian Bracelet',
    nameZh: '深海静盾 · 黑曜石手串',
    intentionEn: 'Boundaries',
    intentionZh: '边界',
    specs: {
      materialEn: 'Obsidian',
      materialZh: '黑曜石',
      beadMm: '8 mm',
      wristEn: '15–18 cm adjustable',
      wristZh: '15–18 cm 可调',
      finishEn: 'Hand-knotted, waxed cord',
      finishZh: '手工打结 · 蜡线',
    },
  },
};

/** SKUs with a finished Making narrative (see stories.ts). */
export const MAKING_LIVE_SKUS: readonly MakingSku[] = [
  'crystal-wood',
  'crystal-fire',
  'crystal-earth',
  'crystal-metal',
  'crystal-water',
];

export function isMakingLiveSku(sku: string): boolean {
  return (MAKING_LIVE_SKUS as readonly string[]).includes(sku);
}

export {
  MAKING_STORIES,
  getMakingStory,
  hasMakingStory,
} from './stories';
export type { MakingStory, MakingSection } from './stories';

export function makingUrl(locale: string, sku: MakingSku): string {
  return `https://orasage.com/${locale}/origins/the-making/${sku}`;
}

export function shopPdpUrl(sku: string): string {
  return `https://shop.orasage.com/product/${sku}`;
}

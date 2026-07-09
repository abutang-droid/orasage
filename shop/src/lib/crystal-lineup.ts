import type { Product } from '@/lib/products';
import {
  CRYSTAL_BASE_SKUS,
  CRYSTAL_ELEMENT_META,
  crystalGiftSku,
  type CrystalBaseSku,
} from '../../../shared/shop-crystal/index';

export type CrystalLineupItem = {
  baseSku: CrystalBaseSku;
  element: string;
  elementKey: string;
  accent: string;
  standard: Product;
  gift: Product | null;
};

export function buildCrystalLineup(products: Product[]): CrystalLineupItem[] {
  const bySku = new Map(products.map((p) => [p.sku, p]));
  return CRYSTAL_BASE_SKUS.map((baseSku) => {
    const standard = bySku.get(baseSku);
    if (!standard) return null;
    const meta = CRYSTAL_ELEMENT_META[baseSku];
    return {
      baseSku,
      element: meta.element,
      elementKey: meta.elementKey,
      accent: meta.accent,
      standard,
      gift: bySku.get(crystalGiftSku(baseSku)) ?? null,
    };
  }).filter((row): row is CrystalLineupItem => Boolean(row));
}

export function resolveInitialBaseSku(
  lineup: CrystalLineupItem[],
  elementKey?: string | null,
): CrystalBaseSku {
  if (elementKey) {
    const hit = lineup.find((row) => row.elementKey === elementKey);
    if (hit) return hit.baseSku;
  }
  return lineup[0]?.baseSku ?? CRYSTAL_BASE_SKUS[0];
}

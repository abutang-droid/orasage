import { ENV } from '@/lib/env';
import {
  appendCrystalFulfillmentContext,
  normalizeComboItemRole,
} from '../../../shared/shop-combo/crystal-role';

type ComboItemApi = {
  componentSku: string;
  quantity?: number;
  role?: string;
  name?: string;
};

type ProductDetail = {
  sku: string;
  name: string;
  kind?: string;
  comboItems?: ComboItemApi[];
};

async function fetchProductDetail(sku: string, locale: string): Promise<ProductDetail | null> {
  try {
    const res = await fetch(
      `${ENV.authInternalUrl}/api/products/${encodeURIComponent(sku)}?locale=${encodeURIComponent(locale)}`,
      { cache: 'no-store' },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { product?: ProductDetail };
    return data.product ?? null;
  } catch {
    return null;
  }
}

async function fetchReadingCrystalSku(readingId: string): Promise<string | null> {
  try {
    const res = await fetch(
      `${ENV.authInternalUrl}/internal/readings/${encodeURIComponent(readingId)}`,
      { cache: 'no-store' },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { reading?: { crystalSku?: string | null } };
    const sku = data.reading?.crystalSku?.trim();
    return sku || null;
  } catch {
    return null;
  }
}

export type ComboCrystalResolution = {
  crystalSku: string;
  crystalName: string | null;
  fallbackSku: string;
  context: string;
  title: string;
};

/**
 * 若组合含「五行推荐水晶」变量子项，解析实际履约水晶 SKU。
 * 优先级：显式 crystalSku → reading.crystalSku → 子项参考/回退 SKU。
 * 组合优惠价不变；仅履约水晶随五行变化。
 */
export async function resolveComboCrystalFulfillment(input: {
  comboSku: string;
  locale: string;
  productName: string;
  readingId?: string;
  crystalSku?: string;
  recommendationContext?: string;
}): Promise<ComboCrystalResolution | null> {
  const detail = await fetchProductDetail(input.comboSku, input.locale);
  if (!detail?.comboItems?.length) return null;

  const variable = detail.comboItems.find(
    (item) => normalizeComboItemRole(item.role) === 'element_crystal',
  );
  if (!variable) return null;

  const fallbackSku = variable.componentSku;
  let crystalSku = input.crystalSku?.trim() || null;
  if (!crystalSku && input.readingId) {
    crystalSku = await fetchReadingCrystalSku(input.readingId);
  }
  if (!crystalSku) crystalSku = fallbackSku;

  const crystalProduct = await fetchProductDetail(crystalSku, input.locale);
  const resolvedName = crystalProduct?.name ?? crystalSku;

  return {
    crystalSku,
    crystalName: resolvedName,
    fallbackSku,
    context: appendCrystalFulfillmentContext(input.recommendationContext, crystalSku),
    title: `${input.productName}（推荐：${resolvedName}）`,
  };
}

import { inferRequiresShipping, inferRequiresWristSize } from '../../../shared/shop-fulfillment/index';

export type ProductCategory = 'crystal' | 'report' | 'service';

export type ProductTag = {
  id: number;
  code: string;
  label: string;
  groupCode: string;
};

export interface Product {
  sku: string;
  name: string;
  element?: string;
  material?: string;
  color?: string;
  packaging?: string;
  weightGrams?: number | null;
  specs?: Array<{ key: string; label: string; value: string }>;
  attachments?: Array<{ name: string; url: string }>;
  desc: string;
  priceCents: number;
  priceCentsUsd?: number | null;
  priceCentsResolved?: number;
  currency?: 'cny' | 'usd';
  priceDisplay?: string;
  category: ProductCategory;
  tags?: ProductTag[];
  requiresShipping?: boolean;
  requiresWristSize?: boolean;
  imageUrl?: string | null;
}

const ELEMENT_TAG_FALLBACK: Record<string, ProductTag> = {
  木: { id: 1, code: 'element-wood', label: '木', groupCode: 'element' },
  火: { id: 2, code: 'element-fire', label: '火', groupCode: 'element' },
  土: { id: 3, code: 'element-earth', label: '土', groupCode: 'element' },
  金: { id: 4, code: 'element-metal', label: '金', groupCode: 'element' },
  水: { id: 5, code: 'element-water', label: '水', groupCode: 'element' },
};

function fallbackTagsForProduct(p: Pick<Product, 'element'>): ProductTag[] {
  if (!p.element) return [];
  const tag = ELEMENT_TAG_FALLBACK[p.element];
  return tag ? [tag] : [];
}

/**
 * 目录静态兜底（auth-service 不可用时）。
 * 仅含商城应展示的公开商品；计费 SKU（app_only）不得进入目录兜底，
 * 否则 auth 短暂不可用时会在前台「露出」仅计费商品。
 */
/** 兜底列价：双列均为 USDT 分（与线上目录对齐；WOLD 由汇率派生） */
const CATALOG_FALLBACK_RAW: Omit<Product, 'tags'>[] = [
  { sku: 'crystal-wood', name: '生长之境 · 绿幽灵能量手串', element: '木', desc: '五行属木 · 招财旺运 · 生机生长', priceCents: 1778, priceCentsUsd: 1778, category: 'crystal' },
  { sku: 'crystal-fire', name: '焰心觉醒 · 红玛瑙能量手串', element: '火', desc: '五行属火 · 提振活力 · 勇敢行动', priceCents: 1361, priceCentsUsd: 1361, category: 'crystal' },
  { sku: 'crystal-earth', name: '厚土之根 · 黄水晶能量手串', element: '土', desc: '五行属土 · 稳固根基 · 聚财守正', priceCents: 1500, priceCentsUsd: 1500, category: 'crystal' },
  { sku: 'crystal-metal', name: '澄明之境 · 白水晶能量手串', element: '金', desc: '五行属金 · 净化能量 · 思绪澄明', priceCents: 1222, priceCentsUsd: 1222, category: 'crystal' },
  { sku: 'crystal-water', name: '深海静盾 · 黑曜石能量手串', element: '水', desc: '五行属水 · 辟邪护身 · 建立边界', priceCents: 1639, priceCentsUsd: 1639, category: 'crystal' },
  { sku: 'crystal-wood-gift', name: '生长之境 · 绿幽灵能量手串 · 礼盒装', element: '木', packaging: '精美礼盒 · 祝福卡 · 绒布袋', desc: '五行属木 · 赠礼专属包装', priceCents: 2333, priceCentsUsd: 2333, category: 'crystal' },
  { sku: 'crystal-fire-gift', name: '焰心觉醒 · 红玛瑙能量手串 · 礼盒装', element: '火', packaging: '精美礼盒 · 祝福卡 · 绒布袋', desc: '五行属火 · 赠礼专属包装', priceCents: 1917, priceCentsUsd: 1917, category: 'crystal' },
  { sku: 'crystal-earth-gift', name: '厚土之根 · 黄水晶能量手串 · 礼盒装', element: '土', packaging: '精美礼盒 · 祝福卡 · 绒布袋', desc: '五行属土 · 赠礼专属包装', priceCents: 2056, priceCentsUsd: 2056, category: 'crystal' },
  { sku: 'crystal-metal-gift', name: '澄明之境 · 白水晶能量手串 · 礼盒装', element: '金', packaging: '精美礼盒 · 祝福卡 · 绒布袋', desc: '五行属金 · 赠礼专属包装', priceCents: 1778, priceCentsUsd: 1778, category: 'crystal' },
  { sku: 'crystal-water-gift', name: '深海静盾 · 黑曜石能量手串 · 礼盒装', element: '水', packaging: '精美礼盒 · 祝福卡 · 绒布袋', desc: '五行属水 · 赠礼专属包装', priceCents: 2194, priceCentsUsd: 2194, category: 'crystal' },
  { sku: 'diy-bracelet', name: '共振定制 · DIY 能量手串', desc: '自选珠石与配饰 · 按件计费', priceCents: 0, priceCentsUsd: 0, category: 'crystal' },
];

/** App 计费深链 / 结账兜底（不进入目录列表） */
const BILLING_FALLBACK_RAW: Omit<Product, 'tags'>[] = [
  { sku: 'report-bazi-basic', name: '八字深度解读', desc: '完整命盘 AI 解读报告', priceCents: 138, priceCentsUsd: 138, category: 'report' },
  { sku: 'report-bazi-advanced', name: '八字报告 + 能量手串', desc: '深度解读 + 五行水晶推荐', priceCents: 1375, priceCentsUsd: 1375, category: 'report' },
  { sku: 'report-bazi-premium', name: '八字终极能量礼盒', desc: '完整报告 + 水晶礼盒', priceCents: 4153, priceCentsUsd: 4153, category: 'report' },
  { sku: 'report-bazi-couple-advanced', name: '八字合盘报告 + 能量手串', desc: '合盘解读 + 双人五行水晶推荐', priceCents: 2750, priceCentsUsd: 2750, category: 'report' },
  { sku: 'report-bazi-couple-premium', name: '八字合盘终极能量礼盒', desc: '完整合盘报告 + 水晶礼盒', priceCents: 8306, priceCentsUsd: 8306, category: 'report' },
  { sku: 'report-tarot', name: '塔罗深度解读', desc: '牌阵详解 · 行动建议', priceCents: 667, priceCentsUsd: 667, category: 'report' },
  { sku: 'tarot-destiny-slice', name: '定命切片', desc: '面临抉择时抽牌得行动指引 · 一次付费永久解锁', priceCents: 403, priceCentsUsd: 403, category: 'report' },
  { sku: 'temple-donation', name: '祈福乐捐', desc: '支持祈福体系维护与软硬件投入（$0.01–$1 自选）', priceCents: 1, priceCentsUsd: 1, category: 'service' },
];

function withFallbackTags(list: Omit<Product, 'tags'>[]): Product[] {
  return list.map((p) => ({ ...p, tags: fallbackTagsForProduct(p) }));
}

/** @deprecated 名称保留兼容；仅含公开目录兜底，不含计费 SKU */
export const FALLBACK_PRODUCTS: Product[] = withFallbackTags(CATALOG_FALLBACK_RAW);

const BILLING_FALLBACK_PRODUCTS: Product[] = withFallbackTags(BILLING_FALLBACK_RAW);
export const ELEMENT_TO_SKU: Record<string, string> = {
  木: 'crystal-wood',
  火: 'crystal-fire',
  土: 'crystal-earth',
  金: 'crystal-metal',
  水: 'crystal-water',
};

export const categoryLabels: Record<ProductCategory, string> = {
  crystal: '水晶手串',
  report: '数字报告',
  service: '能量咨询',
};

interface ApiProduct {
  sku: string;
  name: string;
  element?: string | null;
  material?: string | null;
  color?: string | null;
  packaging?: string | null;
  weightGrams?: number | null;
  specs?: Array<{ key: string; label: string; value: string }>;
  attachments?: Array<{ name: string; url: string }>;
  desc?: string;
  description?: string;
  priceCents: number;
  priceCentsUsd?: number | null;
  priceCentsResolved?: number;
  currency?: 'cny' | 'usd';
  priceDisplay?: string;
  category: ProductCategory;
  visibility?: 'public' | 'unlisted' | 'app_only' | string;
  tags?: Array<{ id: number; code: string; label: string; groupCode: string }>;
  requiresShipping?: boolean;
  requiresWristSize?: boolean;
}

function mapApiProduct(p: ApiProduct): Product {
  const fulfillment = { category: p.category, sku: p.sku, requiresShipping: p.requiresShipping };
  const tags = (p.tags ?? []).filter((t) => t?.code);
  return {
    sku: p.sku,
    name: p.name,
    element: p.element ?? undefined,
    material: p.material ?? undefined,
    color: p.color ?? undefined,
    packaging: p.packaging ?? undefined,
    weightGrams: p.weightGrams,
    specs: p.specs,
    attachments: p.attachments,
    desc: p.desc ?? p.description ?? '',
    priceCents: p.priceCents,
    priceCentsUsd: p.priceCentsUsd,
    priceCentsResolved: p.priceCentsResolved,
    currency: p.currency,
    priceDisplay: p.priceDisplay,
    category: p.category,
    tags: tags.length > 0 ? tags : fallbackTagsForProduct({ element: p.element ?? undefined }),
    requiresShipping: p.requiresShipping ?? inferRequiresShipping(fulfillment),
    requiresWristSize: p.requiresWristSize ?? inferRequiresWristSize(fulfillment),
  };
}

let cachedProducts: Product[] | null = null;
let cacheExpiry = 0;
let cacheLocale = '';
const CACHE_TTL_MS = 60_000;

export async function fetchProducts(locale = 'zh-CN'): Promise<Product[]> {
  if (cachedProducts && Date.now() < cacheExpiry && cacheLocale === locale) {
    return cachedProducts;
  }

  const { ENV } = await import('./env');
  try {
    const res = await fetch(`${ENV.authInternalUrl}/api/products?locale=${encodeURIComponent(locale)}`, {
      next: { revalidate: 60 },
    } as RequestInit);
    if (!res.ok) throw new Error(`products API ${res.status}`);
    const data = await res.json() as { products: ApiProduct[] };
    // 防御：目录只展示 public；即使上游误返回 app_only/unlisted 也不进列表
    cachedProducts = data.products
      .filter((p) => !p.visibility || p.visibility === 'public')
      .map(mapApiProduct);
    cacheExpiry = Date.now() + CACHE_TTL_MS;
    cacheLocale = locale;
    return cachedProducts;
  } catch (err) {
    console.warn('[shop] fetchProducts fallback:', err);
    return FALLBACK_PRODUCTS;
  }
}

export async function getProduct(sku: string, locale = 'zh-CN'): Promise<Product | null> {
  const list = await fetchProducts(locale);
  const found = list.find((p) => p.sku === sku);
  if (found) return found;

  // 目录只含 visibility=public；app_only/unlisted 商品（App 计费深链）单独取
  const { ENV } = await import('./env');
  try {
    const res = await fetch(
      `${ENV.authInternalUrl}/api/products/${encodeURIComponent(sku)}?locale=${encodeURIComponent(locale)}`,
      { next: { revalidate: 60 } } as RequestInit,
    );
    if (res.ok) {
      const data = await res.json() as { product?: ApiProduct };
      if (data.product) return mapApiProduct(data.product);
    }
  } catch (err) {
    console.warn('[shop] getProduct single fetch fallback:', err);
  }
  return (
    BILLING_FALLBACK_PRODUCTS.find((p) => p.sku === sku)
    ?? FALLBACK_PRODUCTS.find((p) => p.sku === sku)
    ?? null
  );
}

export async function getProductByElement(element: string, locale = 'zh-CN'): Promise<Product | null> {
  const sku = ELEMENT_TO_SKU[element];
  if (!sku) return null;
  return getProduct(sku, locale);
}

/** @deprecated 使用 fetchProducts()；保留兼容旧 import */
export const products = FALLBACK_PRODUCTS;

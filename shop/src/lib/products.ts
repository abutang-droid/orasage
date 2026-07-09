import { inferRequiresShipping, inferRequiresWristSize } from '../../../shared/shop-fulfillment/index';

export type ProductCategory = 'crystal' | 'report' | 'service';

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
  requiresShipping?: boolean;
  requiresWristSize?: boolean;
  imageUrl?: string | null;
}

/** 静态兜底（auth-service 不可用时） */
export const FALLBACK_PRODUCTS: Product[] = [
  { sku: 'crystal-wood', name: '生长之境 · 绿幽灵能量手串', element: '木', desc: '五行属木 · 招财旺运 · 生机生长', priceCents: 12800, priceCentsUsd: 1778, category: 'crystal' },
  { sku: 'crystal-fire', name: '焰心觉醒 · 红玛瑙能量手串', element: '火', desc: '五行属火 · 提振活力 · 勇敢行动', priceCents: 9800, priceCentsUsd: 1361, category: 'crystal' },
  { sku: 'crystal-earth', name: '厚土之根 · 黄水晶能量手串', element: '土', desc: '五行属土 · 稳固根基 · 聚财守正', priceCents: 10800, priceCentsUsd: 1500, category: 'crystal' },
  { sku: 'crystal-metal', name: '澄明之境 · 白水晶能量手串', element: '金', desc: '五行属金 · 净化能量 · 思绪澄明', priceCents: 8800, priceCentsUsd: 1222, category: 'crystal' },
  { sku: 'crystal-water', name: '深海静盾 · 黑曜石能量手串', element: '水', desc: '五行属水 · 辟邪护身 · 建立边界', priceCents: 11800, priceCentsUsd: 1639, category: 'crystal' },
  { sku: 'report-bazi', name: '八字深度报告', desc: '完整命盘解析 · PDF 交付', priceCents: 6800, priceCentsUsd: 944, category: 'report' },
  { sku: 'report-bazi-basic', name: '八字深度解读', desc: '完整命盘 AI 解读报告', priceCents: 990, priceCentsUsd: 138, category: 'report' },
  { sku: 'report-bazi-advanced', name: '八字报告 + 能量手串', desc: '深度解读 + 五行水晶推荐', priceCents: 9900, priceCentsUsd: 1375, category: 'report' },
  { sku: 'report-bazi-premium', name: '八字终极能量礼盒', desc: '完整报告 + 水晶礼盒', priceCents: 29900, priceCentsUsd: 4153, category: 'report' },
  { sku: 'report-bazi-couple-basic', name: '八字合盘深度解读', desc: '双人合盘 AI 解读报告', priceCents: 990, priceCentsUsd: 138, category: 'report' },
  { sku: 'report-bazi-couple-advanced', name: '八字合盘报告 + 能量手串', desc: '合盘解读 + 双人五行水晶推荐', priceCents: 19800, priceCentsUsd: 2750, category: 'report' },
  { sku: 'report-bazi-couple-premium', name: '八字合盘终极能量礼盒', desc: '完整合盘报告 + 水晶礼盒', priceCents: 59800, priceCentsUsd: 8306, category: 'report' },
  { sku: 'report-ziwei', name: '紫微深度报告', desc: '十二宫详解 · 流年运势', priceCents: 7800, priceCentsUsd: 1083, category: 'report' },
  { sku: 'report-ziwei-basic', name: '紫微深度解读', desc: '命盘 AI 解读报告', priceCents: 990, priceCentsUsd: 138, category: 'report' },
  { sku: 'report-ziwei-advanced', name: '紫微报告 + 能量手串', desc: '深度解读 + 五行水晶推荐', priceCents: 9900, priceCentsUsd: 1375, category: 'report' },
  { sku: 'report-ziwei-premium', name: '紫微终极能量礼盒', desc: '完整报告 + 水晶礼盒', priceCents: 29900, priceCentsUsd: 4153, category: 'report' },
  { sku: 'ziwei-chat-pack-10', name: '紫微问答加量包', desc: '额外 10 次 OraSage 对话机会', priceCents: 990, priceCentsUsd: 138, category: 'service' },
  { sku: 'ziwei-chat-yearly', name: '紫微问答年卡', desc: '365 天无限 OraSage 对话', priceCents: 9900, priceCentsUsd: 1375, category: 'service' },
  { sku: 'report-tarot', name: '塔罗深度解读', desc: '牌阵详解 · 行动建议', priceCents: 4800, priceCentsUsd: 667, category: 'report' },
  { sku: 'service-consult', name: '能量咨询 30 分钟', desc: '一对一命理师在线答疑', priceCents: 19800, priceCentsUsd: 2750, category: 'service' },
  { sku: 'temple-donation', name: '祈福乐捐', desc: '支持祈福体系维护与软硬件投入（$0.01–$1 自选）', priceCents: 1, priceCentsUsd: 1, category: 'service' },
];

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
  requiresShipping?: boolean;
  requiresWristSize?: boolean;
}

function mapApiProduct(p: ApiProduct): Product {
  const fulfillment = { category: p.category, sku: p.sku, requiresShipping: p.requiresShipping };
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
    cachedProducts = data.products.map(mapApiProduct);
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
  return FALLBACK_PRODUCTS.find((p) => p.sku === sku) ?? null;
}

export async function getProductByElement(element: string, locale = 'zh-CN'): Promise<Product | null> {
  const sku = ELEMENT_TO_SKU[element];
  if (!sku) return null;
  return getProduct(sku, locale);
}

/** @deprecated 使用 fetchProducts()；保留兼容旧 import */
export const products = FALLBACK_PRODUCTS;

export type ProductCategory = 'crystal' | 'report' | 'service';

export interface Product {
  sku: string;
  name: string;
  element?: string;
  desc: string;
  priceCents: number;
  category: ProductCategory;
}

/** 静态兜底（auth-service 不可用时） */
export const FALLBACK_PRODUCTS: Product[] = [
  { sku: 'crystal-wood', name: '绿幽灵手串', element: '木', desc: '招财旺运 · 五行补木', priceCents: 12800, category: 'crystal' },
  { sku: 'crystal-fire', name: '红玛瑙手串', element: '火', desc: '补火平衡 · 增强活力', priceCents: 9800, category: 'crystal' },
  { sku: 'crystal-earth', name: '黄水晶手串', element: '土', desc: '稳固根基 · 聚财守正', priceCents: 10800, category: 'crystal' },
  { sku: 'crystal-metal', name: '白水晶手串', element: '金', desc: '净化能量 · 清晰思绪', priceCents: 8800, category: 'crystal' },
  { sku: 'crystal-water', name: '黑曜石手串', element: '水', desc: '辟邪护身 · 吸收负能量', priceCents: 11800, category: 'crystal' },
  { sku: 'report-bazi', name: '八字深度报告', desc: '完整命盘解析 · PDF 交付', priceCents: 6800, category: 'report' },
  { sku: 'report-bazi-basic', name: '八字深度解读', desc: '完整命盘 AI 解读报告', priceCents: 990, category: 'report' },
  { sku: 'report-bazi-advanced', name: '八字报告 + 能量手串', desc: '深度解读 + 五行水晶推荐', priceCents: 9900, category: 'report' },
  { sku: 'report-bazi-premium', name: '八字终极能量礼盒', desc: '完整报告 + 水晶礼盒', priceCents: 29900, category: 'report' },
  { sku: 'report-ziwei', name: '紫微深度报告', desc: '十二宫详解 · 流年运势', priceCents: 7800, category: 'report' },
  { sku: 'report-ziwei-basic', name: '紫微深度解读', desc: '命盘 AI 解读报告', priceCents: 990, category: 'report' },
  { sku: 'report-ziwei-advanced', name: '紫微报告 + 能量手串', desc: '深度解读 + 五行水晶推荐', priceCents: 9900, category: 'report' },
  { sku: 'report-ziwei-premium', name: '紫微终极能量礼盒', desc: '完整报告 + 水晶礼盒', priceCents: 29900, category: 'report' },
  { sku: 'report-tarot', name: '塔罗深度解读', desc: '牌阵详解 · 行动建议', priceCents: 4800, category: 'report' },
  { sku: 'service-consult', name: '能量咨询 30 分钟', desc: '一对一命理师在线答疑', priceCents: 19800, category: 'service' },
];

export const ELEMENT_TO_SKU: Record<string, string> = {
  木: 'crystal-wood',
  火: 'crystal-fire',
  土: 'crystal-earth',
  金: 'crystal-metal',
  水: 'crystal-water',
};

export function formatPrice(cents: number) {
  return `¥${(cents / 100).toFixed(2)}`;
}

export const categoryLabels: Record<ProductCategory, string> = {
  crystal: '水晶手串',
  report: '数字报告',
  service: '能量咨询',
};

interface ApiProduct {
  sku: string;
  name: string;
  element?: string | null;
  desc?: string;
  description?: string;
  priceCents: number;
  category: ProductCategory;
}

function mapApiProduct(p: ApiProduct): Product {
  return {
    sku: p.sku,
    name: p.name,
    element: p.element ?? undefined,
    desc: p.desc ?? p.description ?? '',
    priceCents: p.priceCents,
    category: p.category,
  };
}

let cachedProducts: Product[] | null = null;
let cacheExpiry = 0;
const CACHE_TTL_MS = 60_000;

export async function fetchProducts(): Promise<Product[]> {
  if (cachedProducts && Date.now() < cacheExpiry) {
    return cachedProducts;
  }

  const { ENV } = await import('./env');
  try {
    const res = await fetch(`${ENV.authInternalUrl}/api/products`, {
      next: { revalidate: 60 },
    } as RequestInit);
    if (!res.ok) throw new Error(`products API ${res.status}`);
    const data = await res.json() as { products: ApiProduct[] };
    cachedProducts = data.products.map(mapApiProduct);
    cacheExpiry = Date.now() + CACHE_TTL_MS;
    return cachedProducts;
  } catch (err) {
    console.warn('[shop] fetchProducts fallback:', err);
    return FALLBACK_PRODUCTS;
  }
}

export async function getProduct(sku: string): Promise<Product | null> {
  const list = await fetchProducts();
  const found = list.find((p) => p.sku === sku);
  if (found) return found;
  return FALLBACK_PRODUCTS.find((p) => p.sku === sku) ?? null;
}

export async function getProductByElement(element: string): Promise<Product | null> {
  const sku = ELEMENT_TO_SKU[element];
  if (!sku) return null;
  return getProduct(sku);
}

/** @deprecated 使用 fetchProducts()；保留兼容旧 import */
export const products = FALLBACK_PRODUCTS;

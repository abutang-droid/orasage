import { inferRequiresShipping, inferRequiresWristSize } from '../../../shared/shop-fulfillment/index';
import { crystalName, crystalTagline } from '../../../shared/shop-crystal/naming';

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
  /** Locale-resolved catalog tags from auth-service */
  tags?: Array<{ id: number; code: string; label: string; groupCode: string }>;
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
  { sku: 'crystal-wood', name: crystalName('crystal-wood')!, element: '木', desc: crystalTagline('crystal-wood')!, priceCents: 16800, priceCentsUsd: 16800, category: 'crystal' },
  { sku: 'crystal-fire', name: crystalName('crystal-fire')!, element: '火', desc: crystalTagline('crystal-fire')!, priceCents: 16800, priceCentsUsd: 16800, category: 'crystal' },
  { sku: 'crystal-earth', name: crystalName('crystal-earth')!, element: '土', desc: crystalTagline('crystal-earth')!, priceCents: 16800, priceCentsUsd: 16800, category: 'crystal' },
  { sku: 'crystal-metal', name: crystalName('crystal-metal')!, element: '金', desc: crystalTagline('crystal-metal')!, priceCents: 16800, priceCentsUsd: 16800, category: 'crystal' },
  { sku: 'crystal-water', name: crystalName('crystal-water')!, element: '水', desc: crystalTagline('crystal-water')!, priceCents: 16800, priceCentsUsd: 16800, category: 'crystal' },
  { sku: 'crystal-wood-gift', name: crystalName('crystal-wood-gift')!, element: '木', packaging: '精美礼盒 · 祝福卡 · 绒布袋', desc: crystalTagline('crystal-wood-gift')!, priceCents: 58800, priceCentsUsd: 58800, category: 'crystal' },
  { sku: 'crystal-fire-gift', name: crystalName('crystal-fire-gift')!, element: '火', packaging: '精美礼盒 · 祝福卡 · 绒布袋', desc: crystalTagline('crystal-fire-gift')!, priceCents: 58800, priceCentsUsd: 58800, category: 'crystal' },
  { sku: 'crystal-earth-gift', name: crystalName('crystal-earth-gift')!, element: '土', packaging: '精美礼盒 · 祝福卡 · 绒布袋', desc: crystalTagline('crystal-earth-gift')!, priceCents: 58800, priceCentsUsd: 58800, category: 'crystal' },
  { sku: 'crystal-metal-gift', name: crystalName('crystal-metal-gift')!, element: '金', packaging: '精美礼盒 · 祝福卡 · 绒布袋', desc: crystalTagline('crystal-metal-gift')!, priceCents: 58800, priceCentsUsd: 58800, category: 'crystal' },
  { sku: 'crystal-water-gift', name: crystalName('crystal-water-gift')!, element: '水', packaging: '精美礼盒 · 祝福卡 · 绒布袋', desc: crystalTagline('crystal-water-gift')!, priceCents: 58800, priceCentsUsd: 58800, category: 'crystal' },
  { sku: 'report-bazi-basic', name: '八字深度解读', desc: '完整命盘 AI 解读报告（站内 HTML）', priceCents: 99, priceCentsUsd: 99, category: 'report' },
  { sku: 'report-bazi-advanced', name: '八字报告 + 水晶手串', desc: '深度解读 + 五行水晶推荐', priceCents: 1375, priceCentsUsd: 1375, category: 'report' },
  { sku: 'report-bazi-premium', name: '八字终极水晶礼盒', desc: '完整报告 + 水晶礼盒', priceCents: 4153, priceCentsUsd: 4153, category: 'report' },
  { sku: 'report-bazi-couple-basic', name: '八字合盘深度解读', desc: '双人合盘 AI 解读报告（站内 HTML）', priceCents: 99, priceCentsUsd: 99, category: 'report' },
  { sku: 'report-bazi-couple-advanced', name: '八字合盘报告 + 水晶手串', desc: '合盘解读 + 双人五行水晶推荐', priceCents: 2750, priceCentsUsd: 2750, category: 'report' },
  { sku: 'report-bazi-couple-premium', name: '八字合盘终极水晶礼盒', desc: '完整合盘报告 + 水晶礼盒', priceCents: 8306, priceCentsUsd: 8306, category: 'report' },
  { sku: 'report-ziwei-basic', name: '紫微深度解读', desc: '命盘 AI 解读报告（站内 HTML）', priceCents: 99, priceCentsUsd: 99, category: 'report' },
  { sku: 'report-ziwei-advanced', name: '紫微报告 + 水晶手串', desc: '深度解读 + 五行水晶推荐', priceCents: 1375, priceCentsUsd: 1375, category: 'report' },
  { sku: 'report-ziwei-premium', name: '紫微终极水晶礼盒', desc: '完整报告 + 水晶礼盒', priceCents: 4153, priceCentsUsd: 4153, category: 'report' },
  { sku: 'ziwei-chat-pack-10', name: '紫微问答加量包', desc: '额外 10 次 OraSage 对话机会', priceCents: 138, priceCentsUsd: 138, category: 'service' },
  { sku: 'ziwei-chat-yearly', name: '紫微问答年卡', desc: '365 天无限 OraSage 对话', priceCents: 1375, priceCentsUsd: 1375, category: 'service' },
  { sku: 'report-tarot', name: '塔罗深度解读', desc: '牌阵详解 · 行动建议', priceCents: 667, priceCentsUsd: 667, category: 'report' },
  { sku: 'report-tarot-bundle', name: '塔罗深度解读+仪式器物', desc: '三牌阵完整报告 + 专属仪式器物（实体发货）', priceCents: 16800, priceCentsUsd: 16800, category: 'report' },
  { sku: 'tarot-destiny-slice', name: '问题切片', desc: '面临抉择时抽牌得行动指引 · 一次付费永久解锁', priceCents: 403, priceCentsUsd: 403, category: 'report' },
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
  service: '咨询服务',
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
  tags?: Array<{ id: number; code: string; label: string; groupCode: string }>;
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
    tags: p.tags ?? [],
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
  return FALLBACK_PRODUCTS.find((p) => p.sku === sku) ?? null;
}

export async function getProductByElement(element: string, locale = 'zh-CN'): Promise<Product | null> {
  const sku = ELEMENT_TO_SKU[element];
  if (!sku) return null;
  return getProduct(sku, locale);
}

/** @deprecated 使用 fetchProducts()；保留兼容旧 import */
export const products = FALLBACK_PRODUCTS;

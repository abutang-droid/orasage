export type ProductCategory = 'crystal' | 'report' | 'service';

export interface HomepageCatalogItem {
  sku: string;
  name: string;
  element?: string | null;
  desc: string;
  priceDisplay: string;
  category: ProductCategory;
  categoryLabel: string;
  shopUrl: string;
  imageUrl?: string | null;
}

export interface HomepageCatalog {
  products: HomepageCatalogItem[];
  categories: Array<{ id: ProductCategory; label: string }>;
}

const FALLBACK_CRYSTALS: HomepageCatalogItem[] = [
  { sku: 'crystal-wood', name: '绿幽灵', element: '木', desc: '招财旺运', priceDisplay: '', category: 'crystal', categoryLabel: '水晶手串', shopUrl: 'https://shop.orasage.com?sku=crystal-wood' },
  { sku: 'crystal-fire', name: '红玛瑙', element: '火', desc: '补火平衡', priceDisplay: '', category: 'crystal', categoryLabel: '水晶手串', shopUrl: 'https://shop.orasage.com?sku=crystal-fire' },
  { sku: 'crystal-earth', name: '黄水晶', element: '土', desc: '稳固根基', priceDisplay: '', category: 'crystal', categoryLabel: '水晶手串', shopUrl: 'https://shop.orasage.com?sku=crystal-earth' },
  { sku: 'crystal-metal', name: '白水晶', element: '金', desc: '净化能量', priceDisplay: '', category: 'crystal', categoryLabel: '水晶手串', shopUrl: 'https://shop.orasage.com?sku=crystal-metal' },
  { sku: 'crystal-water', name: '黑曜石', element: '水', desc: '辟邪护身', priceDisplay: '', category: 'crystal', categoryLabel: '水晶手串', shopUrl: 'https://shop.orasage.com?sku=crystal-water' },
  { sku: 'report-bazi-basic', name: '八字深度解读', element: null, desc: '完整命盘 AI 解读报告', priceDisplay: '', category: 'report', categoryLabel: '数字报告', shopUrl: 'https://shop.orasage.com?sku=report-bazi-basic' },
];

export async function fetchHomepageCatalog(): Promise<HomepageCatalog> {
  const shopUrl = process.env.SHOP_URL ?? 'https://shop.orasage.com';
  try {
    const res = await fetch(`${shopUrl}/api/products/homepage`, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error(`shop homepage API ${res.status}`);
    const data = await res.json() as {
      products: Array<{
        sku: string;
        name: string;
        element?: string | null;
        desc?: string;
        description?: string;
        priceDisplay?: string;
        category: ProductCategory;
        categoryLabel?: string;
        shopUrl?: string;
        imageUrl?: string | null;
      }>;
      categories: Array<{ id: ProductCategory; label: string }>;
    };

    const products = data.products.map((p) => ({
      sku: p.sku,
      name: p.name,
      element: p.element ?? null,
      desc: p.desc ?? p.description ?? '',
      priceDisplay: p.priceDisplay ?? '',
      category: p.category,
      categoryLabel: p.categoryLabel ?? p.category,
      shopUrl: p.shopUrl ?? `${shopUrl}?sku=${encodeURIComponent(p.sku)}`,
      imageUrl: p.imageUrl ?? null,
    }));

    return {
      products,
      categories: data.categories?.length
        ? data.categories
        : deriveCategories(products),
    };
  } catch {
    return {
      products: FALLBACK_CRYSTALS.map((p) => ({
        ...p,
        shopUrl: `${shopUrl}?sku=${encodeURIComponent(p.sku)}`,
      })),
      categories: deriveCategories(FALLBACK_CRYSTALS),
    };
  }
}

function deriveCategories(products: HomepageCatalogItem[]) {
  const labels: Record<ProductCategory, string> = {
    crystal: '水晶手串',
    report: '数字报告',
    service: '能量咨询',
  };
  const ids = new Set(products.map((p) => p.category));
  return (['crystal', 'report', 'service'] as const)
    .filter((id) => ids.has(id))
    .map((id) => ({ id, label: labels[id] }));
}

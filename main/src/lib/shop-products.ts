import { crystalName, crystalTagline } from '../../../shared/shop-crystal/naming';

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
  { sku: 'crystal-wood', name: crystalName('crystal-wood')!, element: '木', desc: crystalTagline('crystal-wood')!, priceDisplay: '', category: 'crystal', categoryLabel: '水晶手串', shopUrl: 'https://shop.orasage.com?sku=crystal-wood' },
  { sku: 'crystal-fire', name: crystalName('crystal-fire')!, element: '火', desc: crystalTagline('crystal-fire')!, priceDisplay: '', category: 'crystal', categoryLabel: '水晶手串', shopUrl: 'https://shop.orasage.com?sku=crystal-fire' },
  { sku: 'crystal-earth', name: crystalName('crystal-earth')!, element: '土', desc: crystalTagline('crystal-earth')!, priceDisplay: '', category: 'crystal', categoryLabel: '水晶手串', shopUrl: 'https://shop.orasage.com?sku=crystal-earth' },
  { sku: 'crystal-metal', name: crystalName('crystal-metal')!, element: '金', desc: crystalTagline('crystal-metal')!, priceDisplay: '', category: 'crystal', categoryLabel: '水晶手串', shopUrl: 'https://shop.orasage.com?sku=crystal-metal' },
  { sku: 'crystal-water', name: crystalName('crystal-water')!, element: '水', desc: crystalTagline('crystal-water')!, priceDisplay: '', category: 'crystal', categoryLabel: '水晶手串', shopUrl: 'https://shop.orasage.com?sku=crystal-water' },
  { sku: 'report-bazi-basic', name: '八字深度解读', element: null, desc: '完整命盘 AI 解读报告', priceDisplay: '', category: 'report', categoryLabel: '数字报告', shopUrl: 'https://shop.orasage.com?sku=report-bazi-basic' },
];

const CATEGORY_LABELS: Record<string, Record<ProductCategory, string>> = {
  'zh-CN': { crystal: '水晶手串', report: '数字报告', service: '能量咨询' },
  en: { crystal: 'Crystal Bracelets', report: 'Digital Reports', service: 'Energy Consultations' },
  'pt-BR': { crystal: 'Pulseiras de Cristal', report: 'Relatórios Digitais', service: 'Consultas Energéticas' },
};

export async function fetchHomepageCatalog(locale = 'zh-CN'): Promise<HomepageCatalog> {
  const shopUrl = process.env.SHOP_URL ?? 'https://shop.orasage.com';
  try {
    const res = await fetch(
      `${shopUrl}/api/products/homepage?locale=${encodeURIComponent(locale)}`,
      { next: { revalidate: 60 } },
    );
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
        : deriveCategories(products, locale),
    };
  } catch {
    return {
      products: FALLBACK_CRYSTALS.map((p) => ({
        ...p,
        shopUrl: `${shopUrl}?sku=${encodeURIComponent(p.sku)}`,
      })),
      categories: deriveCategories(FALLBACK_CRYSTALS, locale),
    };
  }
}

function deriveCategories(products: HomepageCatalogItem[], locale = 'zh-CN') {
  const labels = CATEGORY_LABELS[locale] ?? CATEGORY_LABELS.en ?? CATEGORY_LABELS['zh-CN'];
  const ids = new Set(products.map((p) => p.category));
  return (['crystal', 'report', 'service'] as const)
    .filter((id) => ids.has(id))
    .map((id) => ({ id, label: labels[id] }));
}

import { NextResponse } from 'next/server';
import { fetchProductImageMap } from '@/lib/cms-product-images';

const authInternalUrl = process.env.AUTH_INTERNAL_URL ?? 'http://127.0.0.1:3101';

export async function GET() {
  try {
    const [res, imageMap] = await Promise.all([
      fetch(`${authInternalUrl}/api/products/homepage`, {
        next: { revalidate: 60 },
      } as RequestInit),
      fetchProductImageMap(),
    ]);
    if (!res.ok) throw new Error(`homepage API ${res.status}`);
    const data = await res.json() as {
      products?: Array<{ sku: string } & Record<string, unknown>>;
      categories?: unknown;
    };
    const products = (data.products ?? []).map((p) => ({
      ...p,
      imageUrl: imageMap.get(p.sku) ?? null,
    }));
    return NextResponse.json({ ...data, products });
  } catch (err) {
    console.warn('[shop] homepage products fallback:', err);
    const { FALLBACK_PRODUCTS, categoryLabels } = await import('@/lib/products');
    const products = FALLBACK_PRODUCTS.slice(0, 6).map((p) => ({
      sku: p.sku,
      name: p.name,
      element: p.element ?? null,
      desc: p.desc,
      description: p.desc,
      priceCents: p.priceCents,
      priceDisplay: `¥${(p.priceCents / 100).toFixed(2)}`,
      category: p.category,
      categoryLabel: categoryLabels[p.category],
      shopUrl: `https://shop.orasage.com?sku=${encodeURIComponent(p.sku)}`,
    }));
    const categorySet = new Set(products.map((p) => p.category));
    const categories = (['crystal', 'report', 'service'] as const)
      .filter((id) => categorySet.has(id))
      .map((id) => ({ id, label: categoryLabels[id] }));
    return NextResponse.json({ products, categories });
  }
}

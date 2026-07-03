import { NextResponse } from 'next/server';
import { fetchProducts } from '@/lib/products';

export async function GET() {
  const products = await fetchProducts();
  return NextResponse.json({
    products: products.map((p) => ({
      sku: p.sku,
      name: p.name,
      element: p.element,
      desc: p.desc,
      priceCents: p.priceCents,
      priceDisplay: `¥${(p.priceCents / 100).toFixed(2)}`,
      category: p.category,
      shopUrl: `https://shop.orasage.com?sku=${encodeURIComponent(p.sku)}`,
    })),
  });
}

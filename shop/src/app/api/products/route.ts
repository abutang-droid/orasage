import { NextResponse } from 'next/server';
import { products } from '@/lib/products';

export async function GET() {
  return NextResponse.json({
    products: products.map((p) => ({
      sku: p.sku,
      name: p.name,
      element: p.element,
      desc: p.desc,
      priceCents: p.priceCents,
      priceDisplay: `¥${(p.priceCents / 100).toFixed(2)}`,
      category: p.category,
    })),
  });
}

'use client';

import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import type { Product, ProductCategory } from '@/lib/products';
import { categoryLabels } from '@/lib/products';
import { ProductCard } from './ProductCard';

export function ProductCatalog({ products }: { products: Product[] }) {
  const searchParams = useSearchParams();
  const activeCategory = (searchParams.get('cat') as ProductCategory | null) ?? 'all';
  const highlightSku = searchParams.get('sku');

  const filtered = useMemo(() => {
    if (activeCategory === 'all') return products;
    return products.filter((p) => p.category === activeCategory);
  }, [products, activeCategory]);

  const categories: Array<ProductCategory | 'all'> = ['all', 'crystal', 'report', 'service'];

  return (
    <>
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:justify-center [&::-webkit-scrollbar]:hidden">
        {categories.map((cat) => (
          <a
            key={cat}
            href={cat === 'all' ? '/' : `/?cat=${cat}`}
            data-active={activeCategory === cat}
            className="shop-category-pill"
          >
            {cat === 'all' ? '全部' : categoryLabels[cat]}
          </a>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {filtered.map((product) => (
          <div
            key={product.sku}
            id={product.sku}
            className={highlightSku === product.sku ? 'rounded-2xl ring-2 ring-sage-primary/30' : ''}
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </>
  );
}

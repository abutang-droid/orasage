'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import type { Product, ProductCategory } from '@/lib/products';
import { ProductCard } from './ProductCard';

const CATEGORY_ORDER: ProductCategory[] = ['crystal', 'report', 'service'];

type ProductCatalogProps = {
  products: Product[];
  featuredSkus?: string[];
};

export function ProductCatalog({ products, featuredSkus = [] }: ProductCatalogProps) {
  const t = useTranslations('categories');
  const tc = useTranslations('catalog');
  const searchParams = useSearchParams();
  const activeCategory = (searchParams.get('cat') as ProductCategory | null) ?? 'all';
  const highlightSku = searchParams.get('sku');

  const filtered = useMemo(() => {
    if (activeCategory === 'all') return products;
    return products.filter((p) => p.category === activeCategory);
  }, [products, activeCategory]);

  const featured = useMemo(() => {
    if (featuredSkus.length === 0) return [];
    const bySku = new Map(products.map((p) => [p.sku, p]));
    return featuredSkus.map((sku) => bySku.get(sku)).filter((p): p is Product => Boolean(p));
  }, [products, featuredSkus]);

  const sections = useMemo(() => {
    if (activeCategory !== 'all') {
      return [{ id: activeCategory, label: t(activeCategory), items: filtered }];
    }
    return CATEGORY_ORDER
      .map((cat) => ({
        id: cat,
        label: t(cat),
        items: products.filter((p) => p.category === cat),
      }))
      .filter((section) => section.items.length > 0);
  }, [activeCategory, filtered, products, t]);

  useEffect(() => {
    if (!highlightSku) return;
    const el = document.getElementById(highlightSku);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlightSku, filtered]);

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
            {cat === 'all' ? t('all') : t(cat)}
          </a>
        ))}
        <a href="/diy" className="shop-category-pill shop-category-pill--diy">
          ✦ {tc('diy')}
        </a>
      </div>

      {activeCategory === 'all' && featured.length > 0 && (
        <section className="shop-collection-section">
          <div className="shop-collection-header">
            <h2 className="shop-collection-title">{tc('featured')}</h2>
            <p className="shop-collection-subtitle">{tc('featuredSubtitle')}</p>
          </div>
          <div className="shop-collection-grid">
            {featured.map((product) => (
              <div
                key={product.sku}
                id={product.sku}
                className={highlightSku === product.sku ? 'rounded-2xl ring-2 ring-sage-primary/30' : ''}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </section>
      )}

      {sections.map((section) => (
        <section key={section.id} className="shop-collection-section">
          {activeCategory === 'all' && (
            <div className="shop-collection-header">
              <h2 className="shop-collection-title">{section.label}</h2>
            </div>
          )}
          <div className="shop-collection-grid">
            {section.items.map((product) => (
              <div
                key={product.sku}
                id={product.sku}
                className={highlightSku === product.sku ? 'rounded-2xl ring-2 ring-sage-primary/30' : ''}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}

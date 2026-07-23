'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import type { Product, ProductCategory, ProductTag } from '@/lib/products';
import { useShopLocale } from '@/components/ShopLocaleProvider';
import { ProductCard } from './ProductCard';

type ProductCatalogProps = {
  products: Product[];
  featuredSkus?: string[];
};

function catalogHref(opts: {
  tag?: string | null;
  locale?: string;
  sku?: string | null;
}): string {
  const params = new URLSearchParams();
  if (opts.tag) params.set('tag', opts.tag);
  if (opts.locale && opts.locale !== 'zh-CN') params.set('locale', opts.locale);
  if (opts.sku) params.set('sku', opts.sku);
  const q = params.toString();
  return q ? `/?${q}` : '/';
}

/** 目录中出现的推荐标签（去重，按分组与编码稳定排序） */
function collectFilterTags(products: Product[]): ProductTag[] {
  const byCode = new Map<string, ProductTag>();
  for (const product of products) {
    for (const tag of product.tags ?? []) {
      if (!tag.code || byCode.has(tag.code)) continue;
      byCode.set(tag.code, tag);
    }
  }
  return [...byCode.values()].sort((a, b) => {
    const groupCmp = (a.groupCode || '').localeCompare(b.groupCode || '');
    if (groupCmp !== 0) return groupCmp;
    return a.code.localeCompare(b.code);
  });
}

export function ProductCatalog({ products, featuredSkus = [] }: ProductCatalogProps) {
  const t = useTranslations('categories');
  const tc = useTranslations('catalog');
  const { locale } = useShopLocale();
  const searchParams = useSearchParams();
  const activeTag = searchParams.get('tag')?.trim() || null;
  /** 旧 ?cat= 链接仍可筛选，但不在 UI 上主动按分类展示 */
  const legacyCatParam = searchParams.get('cat');
  const legacyCategory: ProductCategory | null =
    legacyCatParam === 'crystal' || legacyCatParam === 'report' || legacyCatParam === 'service'
      ? legacyCatParam
      : null;
  const highlightSku = searchParams.get('sku');

  const filterTags = useMemo(() => collectFilterTags(products), [products]);

  const filtered = useMemo(() => {
    if (activeTag) {
      return products.filter((p) => (p.tags ?? []).some((tag) => tag.code === activeTag));
    }
    if (legacyCategory) {
      return products.filter((p) => p.category === legacyCategory);
    }
    return products;
  }, [products, activeTag, legacyCategory]);

  const featured = useMemo(() => {
    if (activeTag || legacyCategory || featuredSkus.length === 0) return [];
    const bySku = new Map(products.map((p) => [p.sku, p]));
    return featuredSkus.map((sku) => bySku.get(sku)).filter((p): p is Product => Boolean(p));
  }, [products, featuredSkus, activeTag, legacyCategory]);

  // 「全部」下精选区已展示的 SKU 不再出现在下方目录，避免同一商品渲染两次
  const catalogGrid = useMemo(() => {
    if (featured.length === 0) return filtered;
    const featuredSet = new Set(featured.map((p) => p.sku));
    return filtered.filter((p) => !featuredSet.has(p.sku));
  }, [filtered, featured]);

  useEffect(() => {
    if (!highlightSku) return;
    const el =
      document.getElementById(highlightSku)
      ?? document.getElementById(`featured-${highlightSku}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlightSku, catalogGrid, featured]);

  const showAll = !activeTag && !legacyCategory;

  return (
    <>
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:justify-center [&::-webkit-scrollbar]:hidden">
        <a
          href={catalogHref({ locale, sku: highlightSku })}
          data-active={showAll}
          className="shop-category-pill"
        >
          {t('all')}
        </a>
        {filterTags.map((tag) => (
          <a
            key={tag.code}
            href={catalogHref({ tag: tag.code, locale, sku: highlightSku })}
            data-active={activeTag === tag.code}
            className="shop-category-pill"
          >
            {tag.label}
          </a>
        ))}
        <a href="/diy" className="shop-category-pill shop-category-pill--diy">
          ✦ {tc('diy')}
        </a>
      </div>

      {showAll && featured.length > 0 && (
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

      {catalogGrid.length > 0 ? (
        <section className="shop-collection-section">
          <div className="shop-collection-grid">
            {catalogGrid.map((product) => (
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
      ) : null}

      {filtered.length === 0 ? (
        <p className="mt-6 text-center text-sage-muted">{tc('emptyFilter')}</p>
      ) : null}
    </>
  );
}

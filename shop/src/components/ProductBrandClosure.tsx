import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import type { ProductCategory } from '@/lib/products';
import { ORASAGE_URLS } from '@/lib/orasage-app-shell/config';

type ProductBrandClosureProps = {
  element?: string | null;
  sku: string;
  category: ProductCategory;
};

const CRYSTAL_SKUS = new Set([
  'crystal-wood',
  'crystal-fire',
  'crystal-earth',
  'crystal-metal',
  'crystal-water',
]);

type ClosureVariant =
  | 'crystal'
  | 'reportBazi'
  | 'reportZiwei'
  | 'reportTarot'
  | 'temple'
  | 'ziweiChat'
  | 'default';

function resolveVariant(sku: string, category: ProductCategory): ClosureVariant {
  if (CRYSTAL_SKUS.has(sku)) return 'crystal';
  if (category === 'report') {
    if (sku.includes('bazi')) return 'reportBazi';
    if (sku.includes('ziwei')) return 'reportZiwei';
    return 'reportTarot';
  }
  if (sku === 'temple-donation') return 'temple';
  if (sku.includes('ziwei-chat')) return 'ziweiChat';
  return 'default';
}

function resolveHref(variant: ClosureVariant): string {
  const urls = ORASAGE_URLS;
  switch (variant) {
    case 'crystal':
    case 'reportBazi':
      return urls.bazi;
    case 'reportZiwei':
    case 'ziweiChat':
      return urls.ziwei;
    case 'reportTarot':
      return urls.tarot;
    case 'temple':
    case 'default':
    default:
      return urls.main;
  }
}

export async function ProductBrandClosure({
  element,
  sku,
  category,
}: ProductBrandClosureProps) {
  const t = await getTranslations('pdp.closure');
  const variant = resolveVariant(sku, category);
  const href = resolveHref(variant);

  const title = t(`${variant}.title`);
  const sub = t(`${variant}.sub`);
  const body =
    variant === 'crystal' && element
      ? t('crystal.bodyWithElement', { element })
      : t(`${variant}.body`);
  const cta = t(`${variant}.cta`);
  const note = t(`${variant}.note`);

  return (
    <section className="shop-pdp-closure" aria-labelledby="shop-pdp-closure-title">
      <p className="shop-pdp-closure-eyebrow">{t('eyebrow')}</p>
      <h2 id="shop-pdp-closure-title" className="shop-pdp-closure-title">
        {title}
      </h2>
      <p className="shop-pdp-closure-sub">{sub}</p>
      <p className="shop-pdp-closure-body">{body}</p>
      <Link href={href} className="shop-pdp-closure-cta">
        {cta}
      </Link>
      <p className="shop-pdp-closure-note">{note}</p>
    </section>
  );
}

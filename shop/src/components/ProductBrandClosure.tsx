import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import type { ProductCategory } from '@/lib/products';
import { localizeFiveElement } from '@/lib/pdp-i18n';
import { getServerShopLocale } from '@/lib/currency-server';

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

type ClosureKey =
  | 'crystal'
  | 'reportBazi'
  | 'reportZiwei'
  | 'reportTarot'
  | 'temple'
  | 'ziweiChat'
  | 'default';

function closureKey(sku: string, category: ProductCategory): ClosureKey {
  if (CRYSTAL_SKUS.has(sku)) return 'crystal';
  if (category === 'report') {
    if (sku.includes('bazi')) return 'reportBazi';
    if (sku.includes('ziwei')) return 'reportZiwei';
    if (sku.includes('tarot')) return 'reportTarot';
    return 'reportTarot';
  }
  if (sku === 'temple-donation') return 'temple';
  if (sku.includes('ziwei-chat')) return 'ziweiChat';
  return 'default';
}

export async function ProductBrandClosure({
  element,
  sku,
  category,
}: ProductBrandClosureProps) {
  const locale = await getServerShopLocale();
  const t = await getTranslations('pdp');
  const key = closureKey(sku, category);
  const prefix = `closure.${key}` as const;
  const localizedElement = localizeFiveElement(element, locale);

  const title = t(`${prefix}.title`);
  const sub = t(`${prefix}.sub`);
  const body =
    key === 'crystal' && localizedElement
      ? t(`${prefix}.bodyWithElement`, { element: localizedElement })
      : t(`${prefix}.body`);
  const cta = t(`${prefix}.cta`);
  const note = t(`${prefix}.note`);
  const href = t(`${prefix}.href`);

  return (
    <section className="shop-pdp-closure" aria-labelledby="shop-pdp-closure-title">
      <p className="shop-pdp-closure-eyebrow">{t('closureEyebrow')}</p>
      <h2 id="shop-pdp-closure-title" className="shop-pdp-closure-title">
        {title}
      </h2>
      {sub.trim() ? <p className="shop-pdp-closure-sub">{sub}</p> : null}
      <p className="shop-pdp-closure-body">{body}</p>
      <Link href={href} className="shop-pdp-closure-cta">
        {cta}
      </Link>
      <p className="shop-pdp-closure-note">{note}</p>
    </section>
  );
}

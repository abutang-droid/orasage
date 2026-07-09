import type { Metadata } from 'next';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { PRODUCT_SKU_TO_BEAD_MATERIAL } from '@/lib/diy';
import { fetchDiyCatalog } from '@/lib/diy-server';
import { getServerShopLocale } from '@/lib/currency-server';
import { currencyForLocale } from '@/lib/currency';
import { DiyDesigner } from '@/components/diy/DiyDesigner';

type PageProps = {
  searchParams: Promise<{ base?: string; element?: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('diy');
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  };
}

export default async function DiyPage({ searchParams }: PageProps) {
  const [{ base, element }, locale, catalog, t] = await Promise.all([
    searchParams,
    getServerShopLocale(),
    fetchDiyCatalog(),
    getTranslations('diy'),
  ]);
  const currency = currencyForLocale(locale);

  const initialMaterial = base ? PRODUCT_SKU_TO_BEAD_MATERIAL[base] : undefined;
  const initialElement = element && ['金', '木', '水', '火', '土'].includes(element) ? element : undefined;

  return (
    <main className="shop-page safe-bottom flex-1">
      <div className="shop-diy-page">
        <Link href="/" className="shop-pdp-back shop-pdp-back--top orasage-subpage-back-local">
          ← {t('backToShop')}
        </Link>

        <header className="shop-diy-header">
          <p className="shop-diy-eyebrow">OraSage Energy Shop</p>
          <h1 className="shop-diy-title">{t('title')}</h1>
          <p className="shop-diy-sub">{t('subtitle')}</p>
        </header>

        <DiyDesigner
          beads={catalog.beads}
          config={catalog.config}
          currency={currency}
          initialMaterial={initialMaterial}
          initialElement={initialElement}
        />
      </div>
    </main>
  );
}

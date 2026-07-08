import type { Metadata } from 'next';
import Link from 'next/link';
import { PRODUCT_SKU_TO_BEAD_MATERIAL } from '@/lib/diy';
import { fetchDiyCatalog } from '@/lib/diy-server';
import { getServerShopLocale } from '@/lib/currency-server';
import { currencyForLocale } from '@/lib/currency';
import { DiyDesigner } from '@/components/diy/DiyDesigner';

export const metadata: Metadata = {
  title: '共振定制 · 设计你的能量手串 | OraSage Energy Shop',
  description: '逐颗挑选水晶、隔珠与隔片，按手围实时预览与计价，定制专属于你的五行能量手串。',
};

type PageProps = {
  searchParams: Promise<{ base?: string; element?: string }>;
};

export default async function DiyPage({ searchParams }: PageProps) {
  const [{ base, element }, locale, catalog] = await Promise.all([
    searchParams,
    getServerShopLocale(),
    fetchDiyCatalog(),
  ]);
  const currency = currencyForLocale(locale);

  const initialMaterial = base ? PRODUCT_SKU_TO_BEAD_MATERIAL[base] : undefined;
  const initialElement = element && ['金', '木', '水', '火', '土'].includes(element) ? element : undefined;

  return (
    <main className="shop-page safe-bottom flex-1">
      <div className="shop-diy-page">
        <Link href="/" className="shop-pdp-back shop-pdp-back--top">
          ← 返回商城
        </Link>

        <header className="shop-diy-header">
          <p className="shop-diy-eyebrow">OraSage Energy Shop</p>
          <h1 className="shop-diy-title">共振定制 · 设计你的能量手串</h1>
          <p className="shop-diy-sub">Design Your Resonance — 逐颗挑选，让能量与你共振</p>
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

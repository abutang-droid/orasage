import { Hero, ToolCards, ShopSection, ContentSections } from '@/components/HomeSections';
import { setRequestLocale } from 'next-intl/server';
import { fetchHomepageCatalog } from '@/lib/shop-products';

type Props = { params: Promise<{ locale: string }> };

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const homepageCatalog = await fetchHomepageCatalog();

  return (
    <div className="home-portal">
      <Hero />
      <ToolCards />
      <ShopSection catalog={homepageCatalog} />
      <ContentSections />
    </div>
  );
}

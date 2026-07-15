import { Hero, ToolCards, ShopSection, ContentSections } from '@/components/HomeSections';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { fetchHomepageCatalog } from '@/lib/shop-products';
import { fallbackHomeHero, fetchHomeHero } from '@/lib/cms-home-hero';

type Props = { params: Promise<{ locale: string }> };

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const tHero = await getTranslations('hero');
  const fallback = fallbackHomeHero({
    hero: { title: tHero('title'), subtitle: tHero('subtitle') },
  });

  const [homepageCatalog, hero] = await Promise.all([
    fetchHomepageCatalog(),
    fetchHomeHero(locale, fallback),
  ]);

  return (
    <div className="home-portal">
      <Hero hero={hero} fallbackTitle={tHero('title')} />
      <ToolCards />
      <ShopSection catalog={homepageCatalog} />
      <ContentSections />
    </div>
  );
}

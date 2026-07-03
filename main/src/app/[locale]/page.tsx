import { Hero, ToolCards, ShopSection, ContentSections } from '@/components/HomeSections';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { fetchHomepageCatalog } from '@/lib/shop-products';
import { fallbackHomeHero, fetchHomeHero } from '@/lib/cms-home-hero';

type Props = { params: Promise<{ locale: string }> };

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [homepageCatalog, cmsHero, tHero] = await Promise.all([
    fetchHomepageCatalog(),
    fetchHomeHero(locale),
    getTranslations('hero'),
  ]);

  const hero = cmsHero ?? fallbackHomeHero({
    hero: { title: tHero('title'), subtitle: tHero('subtitle') },
  });

  return (
    <div className="home-portal">
      <Hero hero={hero} />
      <ToolCards />
      <ShopSection catalog={homepageCatalog} />
      <ContentSections />
    </div>
  );
}

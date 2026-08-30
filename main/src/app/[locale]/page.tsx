import { Hero, ToolCards, ShopSection, ContentSections } from '@/components/HomeSections';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { fetchHomepageCatalog } from '@/lib/shop-products';
import { fallbackHomeHero, fetchHomeHero } from '@/lib/cms-home-hero';
import { Disclaimer } from '@/lib/orasage-app-shell';

type Props = { params: Promise<{ locale: string }> };

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const tHero = await getTranslations('hero');
  const fallback = fallbackHomeHero({
    hero: { title: tHero('title'), subtitle: tHero('subtitle') },
  });

  const [homepageCatalog, hero] = await Promise.all([
    fetchHomepageCatalog(locale),
    fetchHomeHero(locale, fallback),
  ]);

  return (
    <div className="home-portal">
      <Hero hero={hero} />
      <Disclaimer variant="standard" locale={locale} className="orasage-disclaimer--banner px-5 sm:px-6" />
      <ToolCards />
      <ShopSection catalog={homepageCatalog} />
      <ContentSections />
    </div>
  );
}

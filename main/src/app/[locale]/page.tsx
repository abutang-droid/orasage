import { Hero, ToolCards, ShopSection, ContentSections } from '@/components/HomeSections';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { fetchHomepageCatalog } from '@/lib/shop-products';
import { fallbackHomeHero, fetchHomeHero } from '@/lib/cms-home-hero';
import { Disclaimer } from '@/lib/orasage-app-shell';
import { buildPortalPageMeta } from '@/lib/seo';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const messages = (await import(`../../../messages/${locale}.json`)).default;
  const homeTitles: Record<string, string> = {
    'zh-CN': '看见真实的自己',
    en: 'Self & Energy',
    'pt-BR': 'Self & Energy',
  };
  return buildPortalPageMeta({
    locale,
    pathname: '',
    title: homeTitles[locale] ?? 'OraSage Portal',
    description: messages.meta.description as string,
  });
}

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

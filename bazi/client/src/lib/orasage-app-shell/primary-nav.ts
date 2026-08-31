import { pickLabel, SHELL_LABELS } from './labels';
import {
  daozangUrl,
  insightsUrl,
  mainPortalUrl,
  ORASAGE_URLS,
  originsUrl,
  readingsUrl,
  searchUrl,
} from './config';

export type NavLink = {
  id: string;
  href: string;
  label: string;
  external?: boolean;
};

export type NavCategory = {
  id: 'home' | 'shop' | 'insights' | 'origins' | 'readings' | 'daozang';
  href: string;
  label: string;
  external?: boolean;
  children?: NavLink[];
};

function isZh(locale: string): boolean {
  return locale === 'zh-CN' || locale === 'zh-TW' || locale.startsWith('zh');
}

function shopProduct(sku: string): string {
  return `${ORASAGE_URLS.shop}/product/${sku}`;
}

/** P1 desktop primary categories — EN 4 / ZH 6 (道藏一级). */
export function getPrimaryNavCategories(locale = 'zh-CN'): NavCategory[] {
  const zh = isZh(locale);
  const shopChildren: NavLink[] = [
    {
      id: 'by-element',
      href: `${ORASAGE_URLS.shop}/#by-element`,
      label: pickLabel(SHELL_LABELS.navByElement, locale),
      external: true,
    },
    {
      id: 'wood',
      href: shopProduct('crystal-wood'),
      label: pickLabel(SHELL_LABELS.elementWood, locale),
      external: true,
    },
    {
      id: 'fire',
      href: shopProduct('crystal-fire'),
      label: pickLabel(SHELL_LABELS.elementFire, locale),
      external: true,
    },
    {
      id: 'earth',
      href: shopProduct('crystal-earth'),
      label: pickLabel(SHELL_LABELS.elementEarth, locale),
      external: true,
    },
    {
      id: 'metal',
      href: shopProduct('crystal-metal'),
      label: pickLabel(SHELL_LABELS.elementMetal, locale),
      external: true,
    },
    {
      id: 'water',
      href: shopProduct('crystal-water'),
      label: pickLabel(SHELL_LABELS.elementWater, locale),
      external: true,
    },
    {
      id: 'by-intention',
      href: `${ORASAGE_URLS.shop}/#by-intention`,
      label: pickLabel(SHELL_LABELS.navByIntention, locale),
      external: true,
    },
    {
      id: 'intent-growth',
      href: shopProduct('crystal-wood'),
      label: pickLabel(SHELL_LABELS.intentGrowth, locale),
      external: true,
    },
    {
      id: 'intent-courage',
      href: shopProduct('crystal-fire'),
      label: pickLabel(SHELL_LABELS.intentCourage, locale),
      external: true,
    },
    {
      id: 'intent-grounding',
      href: shopProduct('crystal-earth'),
      label: pickLabel(SHELL_LABELS.intentGrounding, locale),
      external: true,
    },
    {
      id: 'intent-clarity',
      href: shopProduct('crystal-metal'),
      label: pickLabel(SHELL_LABELS.intentClarity, locale),
      external: true,
    },
    {
      id: 'intent-boundaries',
      href: shopProduct('crystal-water'),
      label: pickLabel(SHELL_LABELS.intentBoundaries, locale),
      external: true,
    },
    {
      id: 'bracelets',
      href: ORASAGE_URLS.shop,
      label: pickLabel(SHELL_LABELS.navBracelets, locale),
      external: true,
    },
    {
      id: 'reports',
      href: `${ORASAGE_URLS.shop}/product/report-bazi-basic`,
      label: pickLabel(SHELL_LABELS.navReports, locale),
      external: true,
    },
    {
      id: 'gifts',
      href: `${ORASAGE_URLS.shop}/gifts`,
      label: pickLabel(SHELL_LABELS.navGifts, locale),
      external: true,
    },
  ];

  const insightsChildren: NavLink[] = [
    {
      id: 'day-master',
      href: `${insightsUrl(locale)}/day-master`,
      label: pickLabel(SHELL_LABELS.navDayMaster, locale),
    },
    {
      id: 'five-elements',
      href: `${insightsUrl(locale)}/five-elements`,
      label: pickLabel(SHELL_LABELS.navFiveElementsDecoded, locale),
    },
    {
      id: 'solar-terms',
      href: `${insightsUrl(locale)}/solar-terms`,
      label: pickLabel(SHELL_LABELS.navSolarTerms, locale),
    },
    {
      id: 'crystal-companion',
      href: `${insightsUrl(locale)}/crystal`,
      label: pickLabel(SHELL_LABELS.navCrystalCompanion, locale),
    },
    {
      id: 'latest',
      href: `${insightsUrl(locale)}#latest`,
      label: pickLabel(SHELL_LABELS.navLatest, locale),
    },
    {
      id: 'corrections',
      href: `${insightsUrl(locale)}#corrections`,
      label: pickLabel(SHELL_LABELS.navCorrections, locale),
    },
  ];

  const originsChildren: NavLink[] = [
    {
      id: 'the-making',
      href: `${originsUrl(locale)}/the-making`,
      label: pickLabel(SHELL_LABELS.navTheMaking, locale),
    },
    {
      id: 'atelier',
      href: `${originsUrl(locale)}/atelier`,
      label: pickLabel(SHELL_LABELS.navAtelier, locale),
    },
    {
      id: 'our-story',
      href: `${originsUrl(locale)}/our-story`,
      label: pickLabel(SHELL_LABELS.navOurStory, locale),
    },
  ];

  const readingsChildren: NavLink[] = [
    {
      id: 'bazi',
      href: ORASAGE_URLS.bazi,
      label: pickLabel(SHELL_LABELS.bazi, locale),
      external: true,
    },
    {
      id: 'ziwei',
      href: ORASAGE_URLS.ziwei,
      label: pickLabel(SHELL_LABELS.ziwei, locale),
      external: true,
    },
    {
      id: 'tarot',
      href: ORASAGE_URLS.tarot,
      label: pickLabel(SHELL_LABELS.tarot, locale),
      external: true,
    },
    {
      id: 'wishing-well',
      href: ORASAGE_URLS.temple,
      label: pickLabel(SHELL_LABELS.blessing, locale),
      external: true,
    },
    {
      id: 'daozang',
      href: daozangUrl(locale),
      label: pickLabel(SHELL_LABELS.daozang, locale),
    },
  ];

  const shop: NavCategory = {
    id: 'shop',
    href: ORASAGE_URLS.shop,
    label: pickLabel(SHELL_LABELS.shop, locale),
    external: true,
    children: shopChildren,
  };
  const insights: NavCategory = {
    id: 'insights',
    href: insightsUrl(locale),
    label: pickLabel(SHELL_LABELS.insights, locale),
    children: insightsChildren,
  };
  const origins: NavCategory = {
    id: 'origins',
    href: originsUrl(locale),
    label: pickLabel(SHELL_LABELS.origins, locale),
    children: originsChildren,
  };
  const readings: NavCategory = {
    id: 'readings',
    href: readingsUrl(locale),
    label: pickLabel(SHELL_LABELS.readings, locale),
    children: readingsChildren,
  };
  const daozang: NavCategory = {
    id: 'daozang',
    href: daozangUrl(locale),
    label: pickLabel(SHELL_LABELS.daozang, locale),
  };
  const home: NavCategory = {
    id: 'home',
    href: mainPortalUrl(locale),
    label: pickLabel(SHELL_LABELS.home, locale),
  };

  if (zh) {
    // 首页 / 商城 / 玄析 / 造物 / 道藏 / 测算
    return [home, shop, insights, origins, daozang, readings];
  }
  // Shop → Insights → Origins → Readings
  return [shop, insights, origins, readings];
}

export function getUtilityNav(locale = 'zh-CN'): {
  search: NavLink;
  cart: NavLink;
  myReadings: NavLink;
  profile: NavLink;
} {
  return {
    search: {
      id: 'search',
      href: searchUrl(locale),
      label: pickLabel(SHELL_LABELS.search, locale),
    },
    cart: {
      id: 'cart',
      href: `${ORASAGE_URLS.shop}/cart`,
      label: pickLabel(SHELL_LABELS.cart, locale),
      external: true,
    },
    myReadings: {
      id: 'my-readings',
      href: `${mainPortalUrl(locale)}/profile/readings`,
      label: pickLabel(SHELL_LABELS.myReadings, locale),
    },
    profile: {
      id: 'profile',
      href: `${mainPortalUrl(locale)}/profile`,
      label: pickLabel(SHELL_LABELS.mine, locale),
    },
  };
}

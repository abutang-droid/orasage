import { pickLabel, SHELL_LABELS } from './labels';
import {
  daozangUrl,
  famousUrl,
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

/** P1 desktop primary categories — EN 4 / ZH 5 (商城·玄析无二级；道藏仅测算下). */
export function getPrimaryNavCategories(locale = 'zh-CN'): NavCategory[] {
  const zh = isZh(locale);

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
    {
      id: 'famous',
      href: famousUrl(locale),
      label: pickLabel(SHELL_LABELS.famous, locale),
    },
  ];

  const shop: NavCategory = {
    id: 'shop',
    href: ORASAGE_URLS.shop,
    label: pickLabel(SHELL_LABELS.shop, locale),
    external: true,
  };
  const insights: NavCategory = {
    id: 'insights',
    href: insightsUrl(locale),
    label: pickLabel(SHELL_LABELS.insights, locale),
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
  const home: NavCategory = {
    id: 'home',
    href: mainPortalUrl(locale),
    label: pickLabel(SHELL_LABELS.home, locale),
  };

  if (zh) {
    // 首页 / 商城 / 玄析 / 造物 / 测算（道藏、名人案例在测算二级）
    return [home, shop, insights, origins, readings];
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

import {
  cmsLocale,
  decodeHtmlEntities,
  daozangArticlePath,
  famousArticlePath,
  fetchDaozangIndex,
  fetchFamousPages,
  stripHtml,
  type DaozangIndexItem,
} from '@/lib/cms';
import { ORASAGE_URLS } from '@/lib/orasage-seo';
import { MAKING_SKUS } from '@/lib/origins-making';
import { locales, type Locale } from '@/i18n/routing';

/** Locales included in sitemap for CMS articles (canonical language versions). */
export const SITEMAP_ARTICLE_LOCALES: Locale[] = ['zh-CN', 'en'];

export type ContentItem = {
  canonical: string;
  title: string;
  description?: string;
  lastModified?: string;
  priority?: number;
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  noindex?: boolean;
};

/** Build absolute portal URL: https://orasage.com/{locale}/{path} */
export function portalAbsoluteUrl(locale: string, pathname = ''): string {
  const base = `${ORASAGE_URLS.main}/${locale}`;
  if (!pathname || pathname === '/') return base;
  const raw = pathname.startsWith('/') ? pathname.slice(1) : pathname;
  const [pathPart, queryPart] = raw.split('?');
  const encodedPath = pathPart
    .split('/')
    .filter(Boolean)
    .map((segment) => encodeURIComponent(decodeURIComponent(segment)))
    .join('/');
  const suffix = queryPart ? `?${queryPart}` : '';
  return encodedPath ? `${base}/${encodedPath}${suffix}` : `${base}${suffix}`;
}

function daozangItem(locale: string, article: DaozangIndexItem): ContentItem {
  const title = decodeHtmlEntities(article.title);
  return {
    canonical: portalAbsoluteUrl(locale, daozangArticlePath(article.slug)),
    title: title,
    description: article.excerpt ?? undefined,
    lastModified: undefined,
    priority: 0.6,
    changeFrequency: 'monthly',
  };
}

async function getDaozangArticles(locale: Locale): Promise<ContentItem[]> {
  try {
    const index = await fetchDaozangIndex(cmsLocale(locale));
    return index.map((article) => daozangItem(locale, article));
  } catch {
    return [];
  }
}

async function getFamousCases(locale: Locale): Promise<ContentItem[]> {
  try {
    const docs = await fetchFamousPages(cmsLocale(locale));
    return docs.map((doc) => ({
      canonical: portalAbsoluteUrl(locale, famousArticlePath(doc.slug)),
      title: decodeHtmlEntities(doc.title),
      description: doc.excerpt ?? (doc.legacyHtml ? stripHtml(doc.legacyHtml) : undefined),
      noindex: true,
      priority: 0.3,
      changeFrequency: 'monthly' as const,
    }));
  } catch {
    return [];
  }
}

type StaticRouteDef = {
  path: string;
  titleKey?: string;
  titles?: Partial<Record<Locale, string>>;
  descriptionKey?: string;
  descriptions?: Partial<Record<Locale, string>>;
  priority?: number;
  changeFrequency?: ContentItem['changeFrequency'];
  noindex?: boolean;
};

const STATIC_ROUTES: StaticRouteDef[] = [
  {
    path: '',
    titles: {
      'zh-CN': '看见真实的自己',
      en: 'Self & Energy',
      'pt-BR': 'Self & Energy',
    },
    descriptions: {
      'zh-CN': '八字、紫微、塔罗 — 以五行结构陪你内省',
      en: 'BaZi, Zi Wei, Tarot — structured introspection through the Five Elements',
      'pt-BR': 'BaZi, Zi Wei, Tarô — introspecção estruturada pelos Cinco Elementos',
    },
    priority: 1.0,
    changeFrequency: 'weekly',
  },
  {
    path: '/daozang',
    titles: {
      'zh-CN': '道藏',
      en: 'Dao Canon',
      'pt-BR': 'Canô Dao',
    },
    priority: 0.7,
    changeFrequency: 'monthly',
  },
  {
    path: '/faq',
    titles: {
      'zh-CN': '常见问题',
      en: 'FAQ',
      'pt-BR': 'Perguntas frequentes',
    },
    priority: 0.5,
    changeFrequency: 'monthly',
  },
  {
    path: '/profile/about',
    titles: { 'zh-CN': '关于我们', en: 'About Us', 'pt-BR': 'Sobre nós' },
    priority: 0.4,
    changeFrequency: 'monthly',
  },
  {
    path: '/profile/terms',
    titles: { 'zh-CN': '服务条款', en: 'Terms of Service', 'pt-BR': 'Termos de serviço' },
    priority: 0.3,
    changeFrequency: 'yearly',
  },
  {
    path: '/profile/privacy',
    titles: { 'zh-CN': '隐私政策', en: 'Privacy Policy', 'pt-BR': 'Política de privacidade' },
    priority: 0.3,
    changeFrequency: 'yearly',
  },
  {
    path: '/profile/contact',
    titles: { 'zh-CN': '联系我们', en: 'Contact Us', 'pt-BR': 'Contato' },
    priority: 0.4,
    changeFrequency: 'monthly',
  },
  {
    path: '/readings',
    titles: { 'zh-CN': '测算', en: 'Readings', 'pt-BR': 'Leituras' },
    descriptions: {
      'zh-CN': '八字、紫微、塔罗 — 娱乐与自我探索用途的结构对照。',
      en: 'BaZi, Zi Wei, and Tarot — structural lenses for entertainment and self-exploration.',
      'pt-BR': 'BaZi, Zi Wei e Tarô — lentes estruturais para entretenimento e introspecção.',
    },
    priority: 0.85,
    changeFrequency: 'weekly',
  },
  {
    path: '/insights',
    titles: { 'zh-CN': '玄析', en: 'Insights', 'pt-BR': 'Insights' },
    descriptions: {
      'zh-CN': '理解结构，不问吉凶。日主、五行、节气与水晶志。',
      en: 'Understand the structure. Not the fortune.',
      'pt-BR': 'Entenda a estrutura. Não a sorte.',
    },
    priority: 0.8,
    changeFrequency: 'weekly',
  },
  {
    path: '/insights/day-master',
    titles: { 'zh-CN': '日主人格学', en: 'Day Master Typology', 'pt-BR': 'Tipologia do Mestre do Dia' },
    priority: 0.75,
    changeFrequency: 'monthly',
  },
  {
    path: '/insights/five-elements',
    titles: { 'zh-CN': '五行解码', en: 'Five Elements Decoded', 'pt-BR': 'Cinco Elementos' },
    priority: 0.75,
    changeFrequency: 'monthly',
  },
  {
    path: '/insights/solar-terms',
    titles: { 'zh-CN': '节气笔记', en: 'Solar Terms', 'pt-BR': 'Termos solares' },
    priority: 0.7,
    changeFrequency: 'monthly',
  },
  {
    path: '/insights/corrections',
    titles: { 'zh-CN': '校正与流派', en: 'Corrections & Schools', 'pt-BR': 'Correções e escolas' },
    priority: 0.65,
    changeFrequency: 'monthly',
  },
  {
    path: '/insights/crystal',
    titles: { 'zh-CN': '水晶志', en: 'Crystal Companion', 'pt-BR': 'Companheiro de cristal' },
    priority: 0.7,
    changeFrequency: 'monthly',
  },
  {
    path: '/origins',
    titles: { 'zh-CN': '造物', en: 'Origins', 'pt-BR': 'Origens' },
    descriptions: {
      'zh-CN': '造物记、工坊与缘起 — 工艺与选择的可核对说明。',
      en: 'The Making, Atelier, and Our Story — inspectable craft decisions.',
      'pt-BR': 'The Making, Atelier e Our Story — decisões de artesanato verificáveis.',
    },
    priority: 0.75,
    changeFrequency: 'monthly',
  },
  {
    path: '/origins/the-making',
    titles: { 'zh-CN': '造物记', en: 'The Making', 'pt-BR': 'The Making' },
    priority: 0.7,
    changeFrequency: 'monthly',
  },
  {
    path: '/origins/atelier',
    titles: { 'zh-CN': '工坊', en: 'Atelier', 'pt-BR': 'Atelier' },
    priority: 0.65,
    changeFrequency: 'monthly',
  },
  {
    path: '/origins/our-story',
    titles: { 'zh-CN': '缘起', en: 'Our Story', 'pt-BR': 'Nossa história' },
    priority: 0.65,
    changeFrequency: 'monthly',
  },
  {
    path: '/famous',
    titles: { 'zh-CN': '名人案例', en: 'Famous Cases', 'pt-BR': 'Casos famosos' },
    noindex: true,
    priority: 0.3,
    changeFrequency: 'monthly',
  },
];

const PRIVATE_PROFILE_PATHS = [
  '/profile',
  '/profile/orders',
  '/profile/settings',
  '/profile/tickets',
  '/profile/merit',
  '/profile/recommendations',
  '/profile/readings',
  '/profile/profiles',
];

function getStaticPages(): ContentItem[] {
  const items: ContentItem[] = [];
  const makingRoutes: StaticRouteDef[] = MAKING_SKUS.map((sku) => ({
    path: `/origins/the-making/${sku}`,
    titles: { 'zh-CN': `造物记 · ${sku}`, en: `The Making · ${sku}`, 'pt-BR': `The Making · ${sku}` },
    priority: 0.6,
    changeFrequency: 'monthly' as const,
  }));

  for (const locale of locales) {
    for (const route of [...STATIC_ROUTES, ...makingRoutes]) {
      items.push({
        canonical: portalAbsoluteUrl(locale, route.path),
        title: route.titles?.[locale] ?? route.titleKey ?? 'OraSage',
        description: route.descriptions?.[locale],
        priority: route.priority ?? 0.5,
        changeFrequency: route.changeFrequency ?? 'monthly',
        noindex: route.noindex,
      });
    }

    for (const path of PRIVATE_PROFILE_PATHS) {
      items.push({
        canonical: portalAbsoluteUrl(locale, path),
        title: 'My Account',
        noindex: true,
        priority: 0.1,
        changeFrequency: 'never',
      });
    }
  }

  return items;
}

export async function getAllContent(): Promise<ContentItem[]> {
  const [staticPages, ...articleBatches] = await Promise.all([
    Promise.resolve(getStaticPages()),
    ...SITEMAP_ARTICLE_LOCALES.map((locale) => getDaozangArticles(locale)),
    ...locales.map((locale) => getFamousCases(locale)),
  ]);

  return [...staticPages, ...articleBatches.flat()];
}

/** Content items eligible for sitemap.xml (indexable, canonical language versions). */
export async function getSitemapContent(): Promise<ContentItem[]> {
  const all = await getAllContent();
  return all.filter((item) => !item.noindex);
}

export async function getContentByCanonical(canonical: string): Promise<ContentItem | undefined> {
  const all = await getAllContent();
  return all.find((c) => c.canonical === canonical);
}

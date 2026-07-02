const CMS_URL = process.env.CMS_URL || process.env.NEXT_PUBLIC_CMS_URL || 'https://cms.orasage.com';

export type PublishSection =
  | 'daozang'
  | 'famous'
  | 'main'
  | 'bazi'
  | 'ziwei'
  | 'tarot'
  | 'shop';

export type CmsPage = {
  id: number;
  title: string;
  slug: string;
  appSource?: PublishSection | null;
  legacyHtml?: string | null;
  wpStatus?: 'publish' | 'draft' | null;
  locale?: string | null;
  sourceUrl?: string | null;
  updatedAt?: string;
};

type CmsListResponse = {
  docs: CmsPage[];
  totalDocs: number;
  totalPages: number;
  page: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

const localeMap: Record<string, string> = {
  'zh-CN': 'zh-CN',
  'zh-TW': 'zh-TW',
  en: 'en',
  'pt-BR': 'pt',
  es: 'es',
  fr: 'fr',
  de: 'de',
  ja: 'ja',
  ko: 'ko',
  th: 'th',
  vi: 'vi',
  ar: 'ar',
};

export function cmsLocale(siteLocale: string): string {
  return localeMap[siteLocale] || siteLocale;
}

export function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, num) => String.fromCharCode(Number(num)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

export function stripHtml(html: string, max = 140): string {
  const plain = decodeHtmlEntities(html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
  return plain.length > max ? `${plain.slice(0, max)}…` : plain;
}

function buildWhere(section: PublishSection, locale?: string): URLSearchParams {
  const params = new URLSearchParams();
  params.set('where[and][0][appSource][equals]', section);
  params.set('where[and][1][wpStatus][equals]', 'publish');
  if (locale) {
    params.set('where[and][2][locale][equals]', locale);
  }
  return params;
}

export async function fetchCmsPages(options: {
  section: PublishSection;
  locale?: string;
  page?: number;
  limit?: number;
}): Promise<CmsListResponse> {
  const params = buildWhere(options.section, options.locale);
  params.set('limit', String(options.limit ?? 30));
  params.set('page', String(options.page ?? 1));
  params.set('depth', '0');
  params.set('sort', 'title');

  const res = await fetch(`${CMS_URL}/api/pages?${params}`, {
    next: { revalidate: 120 },
  });
  if (!res.ok) {
    throw new Error(`CMS fetch failed: ${res.status}`);
  }
  return res.json();
}

export async function fetchCmsPageBySlug(slug: string): Promise<CmsPage | null> {
  const params = new URLSearchParams();
  params.set('where[and][0][slug][equals]', slug);
  params.set('where[and][1][wpStatus][equals]', 'publish');
  params.set('limit', '1');
  params.set('depth', '0');

  const res = await fetch(`${CMS_URL}/api/pages?${params}`, {
    next: { revalidate: 120 },
  });
  if (!res.ok) return null;
  const data: CmsListResponse = await res.json();
  return data.docs[0] ?? null;
}

export function daozangArticlePath(slug: string): string {
  return `/daozang/${slug}`;
}

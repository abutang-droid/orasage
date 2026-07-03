import type { Metadata } from 'next';

export const ORASAGE_SITE_NAME = 'OraSage';

export const ORASAGE_URLS = {
  main: 'https://orasage.com',
  bazi: 'https://bazi.orasage.com',
  ziwei: 'https://ziwei.orasage.com',
  tarot: 'https://tarot.orasage.com',
  shop: 'https://shop.orasage.com',
} as const;

/** UI keeps product brands; SEO titles end with | OraSage */
export function orasageTitle(pageTitle: string): string {
  if (/OraSage/i.test(pageTitle)) return pageTitle;
  return `${pageTitle} | OraSage`;
}

export const ORASAGE_DEFAULT_KEYWORDS = [
  'OraSage',
  '命理',
  '八字',
  '紫微斗数',
  '塔罗',
  '能量水晶',
  'divination',
  'BaZi',
  'Zi Wei',
  'tarot',
] as const;

export function orasageOpenGraph(opts: {
  title: string;
  description: string;
  url?: string;
  locale?: string;
  type?: 'website' | 'article';
}) {
  return {
    siteName: ORASAGE_SITE_NAME,
    title: orasageTitle(opts.title),
    description: opts.description,
    type: opts.type ?? 'website',
    ...(opts.url ? { url: opts.url } : {}),
    ...(opts.locale ? { locale: opts.locale } : {}),
  };
}

export function orasageTwitter(title: string, description: string) {
  return {
    card: 'summary_large_image' as const,
    title: orasageTitle(title),
    description,
  };
}

export function buildOrasageMetadata(opts: {
  title: string;
  description: string;
  keywords?: string | string[];
  metadataBase?: URL;
  canonical?: string;
  openGraph?: Parameters<typeof orasageOpenGraph>[0];
  robots?: Metadata['robots'];
}): Metadata {
  const keywords = opts.keywords
    ? (Array.isArray(opts.keywords) ? opts.keywords : opts.keywords.split(',').map((k) => k.trim()))
    : [...ORASAGE_DEFAULT_KEYWORDS];

  return {
    title: orasageTitle(opts.title),
    description: opts.description,
    keywords,
    ...(opts.metadataBase ? { metadataBase: opts.metadataBase } : {}),
    ...(opts.canonical ? { alternates: { canonical: opts.canonical } } : {}),
    openGraph: orasageOpenGraph(opts.openGraph ?? { title: opts.title, description: opts.description }),
    twitter: orasageTwitter(opts.title, opts.description),
    ...(opts.robots ? { robots: opts.robots } : {}),
  };
}

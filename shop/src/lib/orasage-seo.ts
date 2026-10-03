import type { Metadata } from 'next';
import {
  LATIN_BRAND,
  isChineseLocale,
  siteDisplayName,
  titleTemplate,
  withSiteTitle,
} from '@/lib/orasage-app-shell/brand';

export const ORASAGE_SITE_NAME = LATIN_BRAND;
export { isChineseLocale, siteDisplayName, titleTemplate };

export const ORASAGE_URLS = {
  main: 'https://orasage.com',
  bazi: 'https://bazi.orasage.com',
  ziwei: 'https://ziwei.orasage.com',
  tarot: 'https://tarot.orasage.com',
  shop: 'https://shop.orasage.com',
} as const;

/** SEO titles: 中文 | 海棠未眠；其它语言 | OraSage */
export function orasageTitle(pageTitle: string, locale?: string | null): string {
  return withSiteTitle(pageTitle, locale);
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
  /** Absolute URL of a 1200x630 share card */
  image?: string;
}) {
  const loc = opts.locale?.replace('_', '-');
  return {
    siteName: siteDisplayName(loc),
    title: orasageTitle(opts.title, loc),
    description: opts.description,
    type: opts.type ?? 'website',
    ...(opts.url ? { url: opts.url } : {}),
    ...(opts.locale ? { locale: opts.locale } : {}),
    ...(opts.image ? { images: [{ url: opts.image, width: 1200, height: 630 }] } : {}),
  };
}

export function orasageTwitter(
  title: string,
  description: string,
  image?: string,
  locale?: string | null,
) {
  return {
    card: 'summary_large_image' as const,
    title: orasageTitle(title, locale),
    description,
    ...(image ? { images: [image] } : {}),
  };
}

export function buildOrasageMetadata(opts: {
  title: string;
  description: string;
  keywords?: string | string[];
  metadataBase?: URL;
  canonical?: string;
  locale?: string | null;
  openGraph?: Parameters<typeof orasageOpenGraph>[0];
  robots?: Metadata['robots'];
  ogImage?: string;
}): Metadata {
  const keywords = opts.keywords
    ? (Array.isArray(opts.keywords) ? opts.keywords : opts.keywords.split(',').map((k) => k.trim()))
    : [...ORASAGE_DEFAULT_KEYWORDS];
  const loc = opts.locale ?? opts.openGraph?.locale?.replace('_', '-');

  return {
    title: orasageTitle(opts.title, loc),
    description: opts.description,
    keywords,
    ...(opts.metadataBase ? { metadataBase: opts.metadataBase } : {}),
    ...(opts.canonical ? { alternates: { canonical: opts.canonical } } : {}),
    openGraph: orasageOpenGraph({
      ...(opts.openGraph ?? { title: opts.title, description: opts.description }),
      ...(opts.ogImage ? { image: opts.ogImage } : {}),
      ...(loc ? { locale: loc.replace('-', '_') } : {}),
    }),
    twitter: orasageTwitter(opts.title, opts.description, opts.ogImage, loc),
    ...(opts.robots ? { robots: opts.robots } : {}),
  };
}

import type { Metadata } from 'next';
import { getSiteApex, orasageUrlsFor, type OrasageUrls } from '@/lib/orasage-app-shell/config';

export const ORASAGE_SITE_NAME = 'OraSage';

/** Cross-app public URLs for the current deployment apex (build env / runtime). */
export const ORASAGE_URLS: OrasageUrls = new Proxy({} as OrasageUrls, {
  get(_target, prop: string | symbol) {
    if (typeof prop !== 'string') return undefined;
    const urls = orasageUrlsFor(getSiteApex());
    return urls[prop as keyof OrasageUrls];
  },
});

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
  /** Absolute URL of a 1200x630 share card (VI v1.0 §6.2) */
  image?: string;
}) {
  return {
    siteName: ORASAGE_SITE_NAME,
    title: orasageTitle(opts.title),
    description: opts.description,
    type: opts.type ?? 'website',
    ...(opts.url ? { url: opts.url } : {}),
    ...(opts.locale ? { locale: opts.locale } : {}),
    ...(opts.image ? { images: [{ url: opts.image, width: 1200, height: 630 }] } : {}),
  };
}

export function orasageTwitter(title: string, description: string, image?: string) {
  return {
    card: 'summary_large_image' as const,
    title: orasageTitle(title),
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
  openGraph?: Parameters<typeof orasageOpenGraph>[0];
  robots?: Metadata['robots'];
  /** Absolute URL of a 1200x630 share card (VI v1.0 §6.2) */
  ogImage?: string;
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
    openGraph: orasageOpenGraph({
      ...(opts.openGraph ?? { title: opts.title, description: opts.description }),
      ...(opts.ogImage ? { image: opts.ogImage } : {}),
    }),
    twitter: orasageTwitter(opts.title, opts.description, opts.ogImage),
    ...(opts.robots ? { robots: opts.robots } : {}),
  };
}

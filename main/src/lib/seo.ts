import type { Metadata } from 'next';
import type { ContentItem } from '@/lib/content';
import { portalAbsoluteUrl } from '@/lib/content';
import { locales } from '@/i18n/routing';
import { orasageOpenGraph, orasageTwitter, ORASAGE_URLS } from '@/lib/orasage-seo';

/** Self-referencing hreflang set for portal pages (apex canonical). */
export function buildHreflangAlternates(pathname = ''): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const locale of locales) {
    languages[locale] = portalAbsoluteUrl(locale, pathname);
  }
  languages['x-default'] = portalAbsoluteUrl('en', pathname);
  return languages;
}

function pathnameFromCanonical(canonical: string): string {
  try {
    const u = new URL(canonical);
    const parts = u.pathname.split('/').filter(Boolean);
    if (parts.length <= 1) return '';
    return `/${parts.slice(1).join('/')}`;
  } catch {
    return '';
  }
}

/** Build page metadata with self-referencing canonical. Title suffix is set explicitly for consistency. */
export function buildPageMeta(item: ContentItem): Metadata {
  const ogTitle = item.title.includes('OraSage') ? item.title : `${item.title} | OraSage`;
  const pageTitle = ogTitle;
  const pathname = pathnameFromCanonical(item.canonical);

  return {
    title: { absolute: pageTitle },
    ...(item.description ? { description: item.description } : {}),
    alternates: {
      canonical: item.canonical,
      languages: buildHreflangAlternates(pathname),
    },
    robots: item.noindex
      ? { index: false, follow: true }
      : { index: true, follow: true },
    openGraph: orasageOpenGraph({
      title: ogTitle,
      description: item.description ?? '',
      url: item.canonical,
      type: 'website',
      image: `${ORASAGE_URLS.main}/og.png`,
    }),
    twitter: orasageTwitter(ogTitle, item.description ?? '', `${ORASAGE_URLS.main}/og.png`),
  };
}

export function buildPortalPageMeta(opts: {
  locale: string;
  pathname?: string;
  title: string;
  description?: string;
  noindex?: boolean;
}): Metadata {
  return buildPageMeta({
    canonical: portalAbsoluteUrl(opts.locale, opts.pathname ?? ''),
    title: opts.title,
    description: opts.description,
    noindex: opts.noindex,
  });
}

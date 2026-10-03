import type { Metadata } from 'next';
import type { ContentItem } from '@/lib/content';
import { portalAbsoluteUrl } from '@/lib/content';
import { locales } from '@/i18n/routing';
import { orasageOpenGraph, orasageTwitter, ORASAGE_URLS, orasageTitle } from '@/lib/orasage-seo';

/** Self-referencing hreflang set for portal pages (apex canonical). */
export function buildHreflangAlternates(pathname = ''): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const locale of locales) {
    languages[locale] = portalAbsoluteUrl(locale, pathname);
  }
  languages['x-default'] = portalAbsoluteUrl('en', pathname);
  return languages;
}

function localeFromCanonical(canonical: string): string | undefined {
  try {
    const u = new URL(canonical);
    const parts = u.pathname.split('/').filter(Boolean);
    return parts[0];
  } catch {
    return undefined;
  }
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

/** Build page metadata with self-referencing canonical. Title suffix follows locale (zh: 海棠未眠). */
export function buildPageMeta(item: ContentItem & { locale?: string }): Metadata {
  const locale = item.locale ?? localeFromCanonical(item.canonical);
  const ogTitle = orasageTitle(item.title, locale);
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
      locale: locale?.replace('-', '_'),
      image: `${ORASAGE_URLS.main}/og.png`,
    }),
    twitter: orasageTwitter(ogTitle, item.description ?? '', `${ORASAGE_URLS.main}/og.png`, locale),
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
    locale: opts.locale,
  });
}

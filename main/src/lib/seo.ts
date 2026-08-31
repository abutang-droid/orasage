import type { Metadata } from 'next';
import type { ContentItem } from '@/lib/content';
import { portalAbsoluteUrl } from '@/lib/content';
import { orasageOpenGraph, orasageTwitter, ORASAGE_URLS } from '@/lib/orasage-seo';

/** Build page metadata with self-referencing canonical. Title suffix comes from layout template. */
export function buildPageMeta(item: ContentItem): Metadata {
  const ogTitle = item.title.includes('OraSage') ? item.title : `${item.title} | OraSage`;

  return {
    title: item.title,
    ...(item.description ? { description: item.description } : {}),
    alternates: {
      canonical: item.canonical,
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

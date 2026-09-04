export type JsonLd = Record<string, unknown>;

export type BreadcrumbCrumb = { name: string; url: string };

const SITE = 'https://orasage.com';

export function absoluteOrasageUrl(locale: string, path = ''): string {
  const suffix = path.startsWith('/') ? path : path ? `/${path}` : '';
  return `${SITE}/${locale}${suffix}`;
}

export function articleJsonLd(opts: {
  locale: string;
  path: string;
  title: string;
  description?: string;
  datePublished?: string;
  dateModified?: string;
  inLanguage?: string;
  image?: string;
}): JsonLd {
  const url = absoluteOrasageUrl(opts.locale, opts.path);
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: opts.title,
    description: opts.description,
    inLanguage: opts.inLanguage ?? opts.locale,
    ...(opts.datePublished ? { datePublished: opts.datePublished } : {}),
    ...(opts.dateModified ? { dateModified: opts.dateModified } : {}),
    author: { '@type': 'Organization', name: 'OraSage' },
    publisher: {
      '@type': 'Organization',
      name: 'OraSage',
      logo: { '@type': 'ImageObject', url: `${SITE}/og.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    ...(opts.image ? { image: opts.image } : {}),
  };
}

export function breadcrumbJsonLd(opts: { locale: string; items: BreadcrumbCrumb[] }): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: opts.items.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: absoluteOrasageUrl(opts.locale, crumb.url),
    })),
  };
}

export function faqJsonLd(
  items: Array<{ question: string; answer: string }>,
): JsonLd | null {
  const mainEntity = items
    .map((item) => ({
      question: item.question.trim(),
      answer: item.answer.trim(),
    }))
    .filter((item) => item.question && item.answer)
    .map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    }));
  if (mainEntity.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity,
  };
}

export function productAggregateRatingJsonLd(opts: {
  ratingValue: number;
  reviewCount: number;
}): JsonLd | null {
  if (!Number.isFinite(opts.ratingValue) || opts.reviewCount < 1) return null;
  return {
    '@type': 'AggregateRating',
    ratingValue: opts.ratingValue.toFixed(1),
    reviewCount: String(opts.reviewCount),
  };
}

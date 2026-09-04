import {
  articleJsonLd,
  breadcrumbJsonLd,
  faqJsonLd,
  type BreadcrumbCrumb,
} from '../../../shared/seo/jsonld';

function JsonLdScript({ id, data }: { id: string; data: Record<string, unknown> }) {
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function ArticleJsonLd(props: {
  locale: string;
  path: string;
  title: string;
  description?: string;
  datePublished?: string;
  dateModified?: string;
  inLanguage?: string;
  image?: string;
}) {
  return <JsonLdScript id={`jsonld-article-${props.path}`} data={articleJsonLd(props)} />;
}

export function BreadcrumbJsonLd({
  locale,
  items,
}: {
  locale: string;
  items: BreadcrumbCrumb[];
}) {
  return <JsonLdScript id="jsonld-breadcrumb" data={breadcrumbJsonLd({ locale, items })} />;
}

export function FaqJsonLd({
  items,
}: {
  items: Array<{ question: string; answer: string }>;
}) {
  const data = faqJsonLd(items);
  if (!data) return null;
  return <JsonLdScript id="jsonld-faq" data={data} />;
}

import { notFound } from 'next/navigation';
import { getPayload } from 'payload';
import config from '@payload-config';

type Props = {
  params: Promise<{ slug: string[] }>;
};

export default async function PageView({ params }: Props) {
  const { slug: slugParts } = await params;
  const slug = slugParts.join('/');
  const payload = await getPayload({ config });

  const result = await payload.find({
    collection: 'pages',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
  });

  const page = result.docs[0];
  if (!page) notFound();

  const legacyHtml = typeof page.legacyHtml === 'string' ? page.legacyHtml : '';
  const hasLegacy = legacyHtml.trim().length > 0;

  return (
    <main
      style={{
        maxWidth: 800,
        margin: '0 auto',
        padding: '32px 20px 64px',
        fontFamily: 'system-ui, sans-serif',
        lineHeight: 1.7,
        color: '#1a1a1a',
      }}
    >
      <header style={{ marginBottom: 32, borderBottom: '1px solid #e5e5e5', paddingBottom: 16 }}>
        <h1 style={{ margin: '0 0 8px', fontSize: 28 }}>{page.title}</h1>
      </header>

      {hasLegacy ? (
        <article
          className="legacy-html-body"
          dangerouslySetInnerHTML={{ __html: legacyHtml }}
        />
      ) : page.content ? (
        <p style={{ color: '#666' }}>该页面使用 CMS 富文本，暂无 HTML 原文预览。</p>
      ) : (
        <p style={{ color: '#666' }}>暂无正文内容。</p>
      )}

      <style>{`
        .legacy-html-body img { max-width: 100%; height: auto; }
        .legacy-html-body table { max-width: 100%; overflow-x: auto; display: block; }
        .legacy-html-body h1, .legacy-html-body h2, .legacy-html-body h3 { margin-top: 1.5em; }
      `}</style>
    </main>
  );
}

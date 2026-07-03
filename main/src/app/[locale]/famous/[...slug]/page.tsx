import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageShell, PageTitle } from '@/components/PageShell';
import { ArticleTitle, LegacyHtmlArticle } from '@/components/LegacyHtmlArticle';
import { fetchCmsPageBySlug } from '@/lib/cms';

import { Alert, AlertDescription, Separator, buttonVariants } from '@orasage/ui';
type Props = {
  params: Promise<{ locale: string; slug: string[] }>;
};

export default async function FamousArticlePage({ params }: Props) {
  const { locale, slug: slugParts } = await params;
  const slug = slugParts.join('/');
  setRequestLocale(locale);
  const t = await getTranslations('famous');

  const page = await fetchCmsPageBySlug(slug);
  if (!page || page.appSource !== 'famous') notFound();

  const legacyHtml = page.legacyHtml?.trim();

  return (
    <PageShell>
      <header>
        <PageTitle>
          <ArticleTitle>{page.title}</ArticleTitle>
        </PageTitle>
        {page.sourceUrl && (
          <div className="mt-4">
            <a
              href={page.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className={buttonVariants({ variant: 'outline', size: 'sm' })}
            >
              {t('sourceLink')}
            </a>
          </div>
        )}
      </header>

      <Separator className="my-6 sm:my-8" />

      {legacyHtml ? (
        <LegacyHtmlArticle html={legacyHtml} />
      ) : (
        <Alert>
          <AlertDescription>{t('noBody')}</AlertDescription>
        </Alert>
      )}
    </PageShell>
  );
}
